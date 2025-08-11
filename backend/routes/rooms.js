const express = require('express');
const router = express.Router();
const jwtAuth = require('../middleware/jwtAuth');
const upload = require('../middleware/upload');
const RoomsModel = require('../model/RoomsModel');
const MessagesModel = require('../model/MessagesModel');
const { v4: uuidv4 } = require('uuid');

// POST /rooms
router.post('/', (req, res) => {
  // TODO: Implement create room logic
  res.send('Create room endpoint');
});

// GET /rooms
router.get('/', (req, res) => {
  // TODO: Implement list rooms logic
  res.send('List rooms endpoint');
});

// GET /rooms/:roomId
router.get('/:roomId', (req, res) => {
  // TODO: Implement get room details logic
  res.send('Get room details endpoint');
});

// POST /rooms/:roomId/invite
router.post('/:roomId/invite', (req, res) => {
  // TODO: Implement invite counterparty logic
  res.send('Invite counterparty endpoint');
});

// POST /rooms/:roomId/invite/accept
router.post('/:roomId/invite/accept', (req, res) => {
  // TODO: Implement accept invitation logic
  res.send('Accept invitation endpoint');
});

// POST /rooms/:roomId/invite/reject
router.post('/:roomId/invite/reject', (req, res) => {
  // TODO: Implement reject invitation logic
  res.send('Reject invitation endpoint');
});

// PATCH /rooms/:roomId/status
router.patch('/:roomId/status', (req, res) => {
  // TODO: Implement update room status logic
  res.send('Update room status endpoint');
});

// Get work status for a room
router.get('/:roomId/work-status', jwtAuth, async (req, res) => {
  try {
    const room = await RoomsModel.findById(req.params.roomId)
      .populate('buyerId', 'name email photo')
      .populate('sellerId', 'name email photo');
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Check if user is part of this room
    if (room.buyerId?._id.toString() !== req.user.id && 
        room.sellerId?._id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      currentPhase: room.workStatus?.currentPhase || 'NOT_STARTED',
      sellerUpdates: room.workStatus?.sellerUpdates || [],
      buyerResponses: room.workStatus?.buyerResponses || [],
      disputeDetails: room.workStatus?.disputeDetails || null
    });
  } catch (error) {
    console.error('Error fetching work status:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Submit work update (seller)
router.post('/:roomId/work-update', jwtAuth, upload.array('attachments', 10), async (req, res) => {
  try {
    const room = await RoomsModel.findById(req.params.roomId);
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Check if user is the seller
    if (room.sellerId?.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only seller can submit work updates' });
    }

    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Process uploaded files
    const attachments = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: file.path,
      url: `/uploads/${file.filename}`
    })) : [];

    const updateId = uuidv4();
    const workUpdate = {
      updateId,
      message,
      attachments,
      timestamp: new Date(),
      status: 'PENDING'
    };

    // Update room work status
    if (!room.workStatus) {
      room.workStatus = {
        currentPhase: 'IN_PROGRESS',
        sellerUpdates: [],
        buyerResponses: [],
        disputeDetails: null
      };
    }

    room.workStatus.sellerUpdates.push(workUpdate);
    room.workStatus.currentPhase = 'UNDER_REVIEW';
    
    await room.save();

    // Create a message in chat
    const chatMessage = new MessagesModel({
      roomId: room._id,
      senderId: req.user.id,
      content: `📝 **Work Update Submitted**\n\n${message}`,
      messageType: 'WORK_UPDATE',
      attachments: attachments.map(att => ({
        filename: att.filename,
        originalName: att.originalName,
        mimeType: att.mimeType,
        size: att.size,
        path: att.path,
        url: att.url
      })),
      status: 'SENT'
    });
    await chatMessage.save();

    res.json({ success: true, updateId });
  } catch (error) {
    console.error('Error submitting work update:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Submit buyer response
router.post('/:roomId/buyer-response', jwtAuth, upload.array('attachments', 10), async (req, res) => {
  try {
    const room = await RoomsModel.findById(req.params.roomId);
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Check if user is the buyer
    if (room.buyerId?.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only buyer can submit responses' });
    }

    const { updateId, action, message } = req.body;
    if (!updateId || !action) {
      return res.status(400).json({ error: 'Update ID and action are required' });
    }

    // Find the work update
    const workUpdate = room.workStatus?.sellerUpdates?.find(update => update.updateId === updateId);
    if (!workUpdate) {
      return res.status(404).json({ error: 'Work update not found' });
    }

    // Process uploaded files
    const attachments = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: file.path,
      url: `/uploads/${file.filename}`
    })) : [];

    const responseId = uuidv4();
    const buyerResponse = {
      responseId,
      updateId,
      action,
      message: message || '',
      attachments,
      timestamp: new Date()
    };

    // Update work status
    if (!room.workStatus.buyerResponses) {
      room.workStatus.buyerResponses = [];
    }
    room.workStatus.buyerResponses.push(buyerResponse);

    // Update work update status
    workUpdate.status = action === 'APPROVE' ? 'APPROVED' : 
                       action === 'REJECT' ? 'REJECTED' : 
                       action === 'DISPUTE' ? 'DISPUTED' : 'PENDING';

    // Update room phase
    if (action === 'APPROVE') {
      room.workStatus.currentPhase = 'COMPLETED';
    } else if (action === 'REJECT') {
      room.workStatus.currentPhase = 'REJECTED';
    } else if (action === 'DISPUTE') {
      room.workStatus.currentPhase = 'DISPUTED';
    }

    await room.save();

    // Create a message in chat
    const actionText = {
      'APPROVE': '✅ Approved',
      'REJECT': '❌ Rejected',
      'REQUEST_CHANGES': '🔄 Requested Changes',
      'DISPUTE': '⚠️ Disputed'
    };

    const chatMessage = new MessagesModel({
      roomId: room._id,
      senderId: req.user.id,
      content: `${actionText[action]} work update #${room.workStatus.sellerUpdates.findIndex(u => u.updateId === updateId) + 1}${message ? `\n\n${message}` : ''}`,
      messageType: 'BUYER_RESPONSE',
      attachments: attachments.map(att => ({
        filename: att.filename,
        originalName: att.originalName,
        mimeType: att.mimeType,
        size: att.size,
        path: att.path,
        url: att.url
      })),
      status: 'SENT'
    });
    await chatMessage.save();

    res.json({ success: true, responseId });
  } catch (error) {
    console.error('Error submitting buyer response:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get dispute chat messages
router.get('/:roomId/dispute-chat', jwtAuth, async (req, res) => {
  try {
    const room = await RoomsModel.findById(req.params.roomId);
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Check if user is part of this room
    if (room.buyerId?.toString() !== req.user.id && 
        room.sellerId?.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get dispute messages from chat
    const messages = await MessagesModel.find({
      roomId: room._id,
      messageType: { $in: ['DISPUTE_MESSAGE', 'AI_RESPONSE', 'SYSTEM_MESSAGE'] }
    }).populate('senderId', 'name email photo')
      .sort({ createdAt: 1 });

    res.json({
      messages: messages.map(msg => ({
        id: msg._id,
        sender: msg.messageType === 'AI_RESPONSE' ? 'ai' : 
                msg.messageType === 'SYSTEM_MESSAGE' ? 'system' : 'user',
        message: msg.content,
        timestamp: msg.createdAt,
        attachments: msg.attachments || []
      })),
      status: room.workStatus?.disputeDetails?.aiReview?.status || 'PENDING'
    });
  } catch (error) {
    console.error('Error fetching dispute chat:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Submit dispute message
router.post('/:roomId/dispute-message', jwtAuth, upload.array('attachments', 10), async (req, res) => {
  try {
    const room = await RoomsModel.findById(req.params.roomId);
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Check if user is part of this room
    if (room.buyerId?.toString() !== req.user.id && 
        room.sellerId?.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Process uploaded files
    const attachments = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: file.path,
      url: `/uploads/${file.filename}`
    })) : [];

    // Save user message
    const userMessage = new MessagesModel({
      roomId: room._id,
      senderId: req.user.id,
      content: message,
      messageType: 'DISPUTE_MESSAGE',
      attachments,
      status: 'SENT'
    });
    await userMessage.save();

    // Generate AI response (simplified for now)
    const aiResponse = generateAIResponse(message, room.workStatus);

    // Save AI response
    const aiMessage = new MessagesModel({
      roomId: room._id,
      senderId: null, // AI doesn't have a user ID
      content: aiResponse,
      messageType: 'AI_RESPONSE',
      status: 'SENT'
    });
    await aiMessage.save();

    res.json({
      success: true,
      aiResponse,
      status: room.workStatus?.disputeDetails?.aiReview?.status || 'PENDING'
    });
  } catch (error) {
    console.error('Error submitting dispute message:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Request AI decision
router.post('/:roomId/ai-decision', jwtAuth, async (req, res) => {
  try {
    const room = await RoomsModel.findById(req.params.roomId);
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Check if user is part of this room
    if (room.buyerId?.toString() !== req.user.id && 
        room.sellerId?.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Generate AI decision (simplified for now)
    const decision = generateAIDecision(room.workStatus);

    // Update room dispute status
    if (!room.workStatus.disputeDetails) {
      room.workStatus.disputeDetails = {
        initiatedBy: req.user.id,
        reason: 'Work quality dispute',
        evidence: [],
        aiReview: {
          status: 'COMPLETED',
          decision: decision.decision,
          reasoning: decision.reasoning,
          reviewedAt: new Date()
        },
        adminReview: {
          status: 'PENDING',
          adminId: null,
          decision: null,
          resolution: null,
          resolvedAt: null
        }
      };
    } else {
      room.workStatus.disputeDetails.aiReview = {
        status: 'COMPLETED',
        decision: decision.decision,
        reasoning: decision.reasoning,
        reviewedAt: new Date()
      };
    }

    room.workStatus.currentPhase = 'DISPUTED';
    await room.save();

    // Save AI decision message
    const aiMessage = new MessagesModel({
      roomId: room._id,
      senderId: null,
      content: `🤖 **AI Decision Reached**\n\n**Decision:** ${decision.decision}\n\n**Reasoning:** ${decision.reasoning}\n\n**Next Steps:** ${decision.nextSteps}`,
      messageType: 'AI_RESPONSE',
      status: 'SENT'
    });
    await aiMessage.save();

    res.json(decision);
  } catch (error) {
    console.error('Error requesting AI decision:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Accept AI decision
router.post('/:roomId/accept-ai-decision', jwtAuth, async (req, res) => {
  try {
    const room = await RoomsModel.findById(req.params.roomId);
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Check if user is part of this room
    if (room.buyerId?.toString() !== req.user.id && 
        room.sellerId?.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Add user to accepted list
    if (!room.workStatus.disputeDetails.aiReview.acceptedBy) {
      room.workStatus.disputeDetails.aiReview.acceptedBy = [];
    }
    
    if (!room.workStatus.disputeDetails.aiReview.acceptedBy.includes(req.user.id)) {
      room.workStatus.disputeDetails.aiReview.acceptedBy.push(req.user.id);
    }

    // Check if both parties accepted
    const buyerAccepted = room.workStatus.disputeDetails.aiReview.acceptedBy.includes(room.buyerId?.toString());
    const sellerAccepted = room.workStatus.disputeDetails.aiReview.acceptedBy.includes(room.sellerId?.toString());

    if (buyerAccepted && sellerAccepted) {
      room.workStatus.currentPhase = 'RESOLVED';
      room.workStatus.disputeDetails.adminReview.status = 'RESOLVED';
    }

    await room.save();

    // Save acceptance message
    const acceptMessage = new MessagesModel({
      roomId: room._id,
      senderId: req.user.id,
      content: `✅ ${req.user.name} has accepted the AI decision.`,
      messageType: 'SYSTEM_MESSAGE',
      status: 'SENT'
    });
    await acceptMessage.save();

    res.json({ success: true });
  } catch (error) {
    console.error('Error accepting AI decision:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Escalate dispute to admin
router.post('/:roomId/escalate-dispute', jwtAuth, async (req, res) => {
  try {
    const room = await RoomsModel.findById(req.params.roomId);
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Check if user is part of this room
    if (room.buyerId?.toString() !== req.user.id && 
        room.sellerId?.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update dispute status
    if (room.workStatus.disputeDetails) {
      room.workStatus.disputeDetails.adminReview.status = 'IN_PROGRESS';
    }

    await room.save();

    // Save escalation message
    const escalateMessage = new MessagesModel({
      roomId: room._id,
      senderId: req.user.id,
      content: `📞 Dispute escalated to admin review by ${req.user.name}. An admin will review the case and provide a final decision within 24-48 hours.`,
      messageType: 'SYSTEM_MESSAGE',
      status: 'SENT'
    });
    await escalateMessage.save();

    res.json({ success: true });
  } catch (error) {
    console.error('Error escalating dispute:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Helper function to generate AI response
function generateAIResponse(message, workStatus) {
  const responses = [
    "I understand your concern. Let me analyze the evidence provided by both parties.",
    "Thank you for providing this information. I'm reviewing the work updates and responses.",
    "I can see there's a disagreement here. Let me examine the details more closely.",
    "Based on the information provided, I need to ask a few clarifying questions.",
    "I'm processing the evidence from both sides to reach a fair decision."
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

// Helper function to generate AI decision
function generateAIDecision(workStatus) {
  const decisions = [
    {
      decision: 'BUYER_WINS',
      reasoning: 'The evidence shows that the delivered work does not meet the agreed-upon specifications. The buyer is entitled to a refund or work correction.',
      nextSteps: 'Seller should provide corrected work or process refund within 3 business days.'
    },
    {
      decision: 'SELLER_WINS',
      reasoning: 'The delivered work meets the agreed-upon requirements and quality standards. The buyer should accept the work and release payment.',
      nextSteps: 'Buyer should accept the work and release payment within 24 hours.'
    },
    {
      decision: 'COMPROMISE',
      reasoning: 'Both parties have valid points. A partial refund or work modification is the fairest solution.',
      nextSteps: 'Seller should provide partial refund or make agreed modifications within 5 business days.'
    }
  ];
  
  return decisions[Math.floor(Math.random() * decisions.length)];
}

module.exports = router; 