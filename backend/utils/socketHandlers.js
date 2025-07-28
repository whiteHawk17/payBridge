const MessagesModel = require('../model/MessagesModel');
const RoomsModel = require('../model/RoomsModel');
const UsersModel = require('../model/UsersModel');
const { verifyToken } = require('./jwt');

const setupSocketHandlers = (io) => {
  // Store connected users
  const connectedUsers = new Map();
  
  // Store video call sessions
  const videoCallSessions = new Map();

  io.use(async (socket, next) => {
    try {
      // Get token from handshake auth or query
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      // Verify token
      const decoded = verifyToken(token);
      socket.userId = decoded.id;
      socket.userName = decoded.name;
      
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userName} (${socket.userId})`);
    
    // Store user connection
    connectedUsers.set(socket.userId, {
      socketId: socket.id,
      userName: socket.userName,
      rooms: new Set(),
      lastSeen: new Date()
    });

    // Join room
    socket.on('join_room', async (roomId) => {
      try {
        // Verify user is part of the room
        const room = await RoomsModel.findById(roomId);
        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        if (room.buyerId?.toString() !== socket.userId && 
            room.sellerId?.toString() !== socket.userId) {
          socket.emit('error', { message: 'You are not authorized to join this room' });
          return;
        }

        // Join the room
        socket.join(roomId);
        
        // Update user's rooms
        const userData = connectedUsers.get(socket.userId);
        if (userData) {
          userData.rooms.add(roomId);
          userData.lastSeen = new Date();
        }

        // Load previous messages
        const messages = await MessagesModel.find({ roomId })
          .populate('senderId', 'name photo')
          .sort({ createdAt: 1 })
          .limit(50);

        socket.emit('room_joined', { 
          roomId, 
          messages: messages.map(msg => ({
            id: msg._id,
            content: msg.content,
            senderId: msg.senderId._id,
            senderName: msg.senderId.name,
            senderPhoto: msg.senderId.photo,
            timestamp: msg.createdAt,
            type: msg.type,
            messageType: msg.messageType,
            attachments: msg.attachments,
            status: msg.status,
            readBy: msg.readBy
          }))
        });

        // Notify other users in the room
        socket.to(roomId).emit('user_joined', {
          userId: socket.userId,
          userName: socket.userName
        });

        // Mark messages as read
        await markMessagesAsRead(roomId, socket.userId);

      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Handle new message
    socket.on('send_message', async (data) => {
      try {
        const { roomId, content, type = 'CHAT', messageType = 'TEXT', attachments = [] } = data;

        // Verify user is part of the room
        const room = await RoomsModel.findById(roomId);
        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        if (room.buyerId?.toString() !== socket.userId && 
            room.sellerId?.toString() !== socket.userId) {
          socket.emit('error', { message: 'You are not authorized to send messages in this room' });
          return;
        }

        // Save message to database
        const newMessage = await MessagesModel.create({
          roomId,
          senderId: socket.userId,
          content,
          type,
          messageType,
          attachments,
          status: 'SENT'
        });

        // Populate sender info
        await newMessage.populate('senderId', 'name photo');

        const messageData = {
          id: newMessage._id,
          content: newMessage.content,
          senderId: newMessage.senderId._id,
          senderName: newMessage.senderId.name,
          senderPhoto: newMessage.senderId.photo,
          timestamp: newMessage.createdAt,
          type: newMessage.type,
          messageType: newMessage.messageType,
          attachments: newMessage.attachments,
          status: newMessage.status,
          readBy: newMessage.readBy
        };

        // Broadcast message to all users in the room
        io.to(roomId).emit('new_message', messageData);

        // Update message status to delivered for other users
        setTimeout(async () => {
          await updateMessageStatus(newMessage._id, 'DELIVERED');
          socket.to(roomId).emit('message_status_update', {
            messageId: newMessage._id,
            status: 'DELIVERED'
          });
        }, 1000);

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle message read
    socket.on('mark_as_read', async (data) => {
      try {
        const { messageId, roomId } = data;
        
        // Update message status
        await updateMessageStatus(messageId, 'READ', socket.userId);
        
        // Notify other users
        socket.to(roomId).emit('message_status_update', {
          messageId,
          status: 'READ',
          readBy: socket.userId
        });
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    });

    // Handle typing indicator
    socket.on('typing', (data) => {
      const { roomId, isTyping } = data;
      socket.to(roomId).emit('user_typing', {
        userId: socket.userId,
        userName: socket.userName,
        isTyping
      });
    });

    // Video Call Signaling
    socket.on('start_video_call', (data) => {
      const { roomId } = data;
      console.log(`User ${socket.userName} started video call in room ${roomId}`);
      
      // Notify other users in the room
      socket.to(roomId).emit('video_call_started', {
        userId: socket.userId,
        userName: socket.userName
      });
    });

    socket.on('end_video_call', (data) => {
      const { roomId, fromUserId } = data;
      console.log(`User ${socket.userName} ended video call in room ${roomId}`);
      
      // Notify other users in the room
      socket.to(roomId).emit('end_video_call', {
        fromUserId: socket.userId
      });
    });

    socket.on('call_rejected', (data) => {
      const { roomId, toUserId, fromUserId } = data;
      console.log(`User ${socket.userName} rejected call in room ${roomId}`);
      
      // Notify the caller that their call was rejected
      socket.to(roomId).emit('call_rejected', {
        fromUserId: socket.userId
      });
    });

    // WebRTC Signaling
    socket.on('offer', (data) => {
      const { roomId, offer, targetUserId } = data;
      console.log(`Offer from ${socket.userName} to ${targetUserId} in room ${roomId}`);
      
      // Forward offer to target user
      socket.to(roomId).emit('offer', {
        offer,
        fromUserId: socket.userId,
        fromUserName: socket.userName
      });
    });

    socket.on('answer', (data) => {
      const { roomId, answer, toUserId } = data;
      console.log(`Answer from ${socket.userName} to ${toUserId} in room ${roomId}`);
      
      // Forward answer to target user
      socket.to(roomId).emit('answer', {
        answer,
        fromUserId: socket.userId,
        fromUserName: socket.userName
      });
    });

    socket.on('ice_candidate', (data) => {
      const { roomId, candidate, targetUserId } = data;
      
      // Forward ICE candidate to target user
      socket.to(roomId).emit('ice_candidate', {
        candidate,
        fromUserId: socket.userId,
        fromUserName: socket.userName
      });
    });

    // Handle user activity
    socket.on('user_activity', () => {
      const userData = connectedUsers.get(socket.userId);
      if (userData) {
        userData.lastSeen = new Date();
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userName} (${socket.userId})`);
      
      // Update last seen
      const userData = connectedUsers.get(socket.userId);
      if (userData) {
        userData.lastSeen = new Date();
      }
      
      // Remove user from connected users after a delay
      setTimeout(() => {
        connectedUsers.delete(socket.userId);
      }, 5000);
    });

    // Handle leave room
    socket.on('leave_room', (roomId) => {
      socket.leave(roomId);
      
      // Update user's rooms
      const userData = connectedUsers.get(socket.userId);
      if (userData) {
        userData.rooms.delete(roomId);
      }

      socket.to(roomId).emit('user_left', {
        userId: socket.userId,
        userName: socket.userName
      });
    });
  });

  // Helper function to mark messages as read
  const markMessagesAsRead = async (roomId, userId) => {
    try {
      await MessagesModel.updateMany(
        { 
          roomId, 
          senderId: { $ne: userId },
          'readBy.userId': { $ne: userId }
        },
        { 
          $push: { 
            readBy: { 
              userId, 
              readAt: new Date() 
            } 
          },
          $set: { status: 'READ' }
        }
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Helper function to update message status
  const updateMessageStatus = async (messageId, status, userId = null) => {
    try {
      const updateData = { status };
      if (userId && status === 'READ') {
        updateData.$push = { readBy: { userId, readAt: new Date() } };
      }
      
      await MessagesModel.findByIdAndUpdate(messageId, updateData);
    } catch (error) {
      console.error('Error updating message status:', error);
    }
  };

  return io;
};

module.exports = { setupSocketHandlers }; 