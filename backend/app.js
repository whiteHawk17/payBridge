
const express = require('express');
const app = express();
const passport = require('./middleware/passport');
const { PORT } = require('./config/env');
const connectDB = require('./config/db');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "https://paybridge.site",
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
  }
});

// Socket.IO connection handling
const { setupSocketHandlers } = require('./utils/socketHandlers');
setupSocketHandlers(io);


app.use(express.json());
app.use(passport.initialize());

// Models
const UsersModel = require('./model/UsersModel');
const TransactionsModel = require('./model/TransactionsModel');
const RoomsModel = require('./model/RoomsModel');
const MessagesModel = require('./model/MessagesModel');
const AuditLogsModel = require('./model/AuditLogsModel');

// Middlewares
const cookieParser = require('cookie-parser');
app.use(express.json());
app.use(cookieParser());

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const roomRoutes = require('./routes/rooms');
const messageRoutes = require('./routes/messages');
const transactionRoutes = require('./routes/transactions');
const auditLogRoutes = require('./routes/auditLogs');
const adminRoutes = require('./routes/admin');
const dashboardRoutes = require('./routes/dashboard');
const uploadRoutes = require('./routes/upload');
const cors = require('cors');
   
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://paybridge.site',
  credentials: true, // if you use cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/auth', authRoutes);
app.use('/', userRoutes);
app.use('/rooms', roomRoutes);
app.use('/', messageRoutes);
app.use('/transactions', transactionRoutes);
app.use('/audit-logs', auditLogRoutes);
app.use('/admin', adminRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/upload', uploadRoutes);


// DB Connect
connectDB();

// Start Server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
