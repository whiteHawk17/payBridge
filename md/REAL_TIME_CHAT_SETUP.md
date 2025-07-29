                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           # Real-Time Chat Setup Guide

This document explains how the real-time chat functionality has been implemented in the PayBridge application.

## Overview

The real-time chat system uses Socket.IO to enable instant messaging between participants in a room. The system includes:

- **Backend**: Socket.IO server with authentication middleware
- **Frontend**: React components with Socket.IO client
- **Database**: MongoDB for message persistence
- **Authentication**: JWT-based authentication for secure connections

## Architecture

### Backend Components

1. **Socket.IO Server** (`backend/app.js`)
   - Integrated with Express server
   - CORS configured for frontend communication
   - Authentication middleware for secure connections

2. **Socket Handlers** (`backend/utils/socketHandlers.js`)
   - Room joining/leaving logic
   - Message broadcasting
   - Typing indicators
   - User presence tracking

3. **Message Model** (`backend/model/MessagesModel.js`)
   - Stores chat messages with sender info
   - Supports different message types (CHAT, EVIDENCE)
   - Timestamps and room associations

### Frontend Components

1. **Socket Context** (`frontend/src/contexts/SocketContext.tsx`)
   - Manages socket connection state
   - Provides socket instance to components
   - Handles connection/disconnection

2. **Authentication Hook** (`frontend/src/hooks/useAuth.ts`)
   - Manages user authentication state
   - Automatically connects to socket when authenticated
   - Handles token storage and validation

3. **Chatbox Component** (`frontend/src/components/rooms/Chatbox.tsx`)
   - Real-time message display
   - Typing indicators
   - Connection status
   - Message sending functionality

## Features

### Real-Time Messaging
- Instant message delivery
- Message persistence in database
- Sender information display
- Timestamp formatting

### Typing Indicators
- Shows when users are typing
- Automatic timeout after 1 second
- Real-time updates

### Connection Status
- Visual connection indicator
- Automatic reconnection
- Error handling

### Room Management
- Join/leave room functionality
- User presence tracking
- Authorization checks

## Setup Instructions

### 1. Install Dependencies

**Backend:**
```bash
cd backend
npm install socket.io
```

**Frontend:**
```bash
cd frontend
npm install socket.io-client
```

### 2. Start the Servers

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm start
```

### 3. Test the Connection

1. Navigate to `/socket-test` in your browser
2. Check authentication status
3. Verify socket connection
4. Send test messages

## Usage

### Joining a Room

1. Navigate to a room page (e.g., `/rooms/:roomId`)
2. The Chatbox component automatically joins the room
3. Previous messages are loaded
4. Real-time messaging is enabled

### Sending Messages

1. Type in the chat input field
2. Press Enter or click the send button
3. Messages are instantly delivered to all room participants
4. Messages are stored in the database

### Typing Indicators

- Start typing to show "is typing" indicator
- Indicator automatically disappears after 1 second
- Other users see who is currently typing

## API Endpoints

### Socket Events

**Client to Server:**
- `join_room` - Join a specific room
- `send_message` - Send a new message
- `typing` - Update typing status
- `leave_room` - Leave a room

**Server to Client:**
- `room_joined` - Confirmation of room join with messages
- `new_message` - New message received
- `user_joined` - User joined the room
- `user_left` - User left the room
- `user_typing` - User typing status update
- `error` - Error messages

### REST Endpoints

- `GET /auth/me` - Get current user info
- `GET /auth/token` - Get current user's token (for testing)

## Security

- JWT authentication required for socket connections
- Room access verification before joining
- Message sender validation
- CORS protection

## Troubleshooting

### Connection Issues
1. Check if backend server is running on port 3002
2. Verify CORS settings match frontend URL
3. Check authentication token validity

### Message Not Sending
1. Verify socket connection status
2. Check room authorization
3. Review browser console for errors

### Authentication Errors
1. Ensure user is logged in
2. Check token expiration
3. Verify token format

## Future Enhancements

- File attachments support
- Message reactions
- Read receipts
- Message editing/deletion
- Push notifications
- Message search functionality
- Voice/video chat integration

## Testing

Use the `/socket-test` route to test:
- Authentication status
- Socket connection
- Message sending
- Error handling

This provides a simple interface to verify all components are working correctly. 