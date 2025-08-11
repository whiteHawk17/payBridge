
const express = require('express');
const app = express();
const passport = require('./middleware/passport');
const { PORT, corsOrigins } = require('./config/env');
const connectDB = require('./config/db');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIo(server, {
  cors: {
    origin: corsOrigins,
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
const paymentRoutes = require('./routes/payment');
const auditLogRoutes = require('./routes/auditLogs');
const adminRoutes = require('./routes/admin');
const dashboardRoutes = require('./routes/dashboard');
const uploadRoutes = require('./routes/upload');
const videoRoutes = require('./routes/video');
const cors = require('cors');
   
app.use(cors({
  origin: corsOrigins,
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
app.use('/payment', paymentRoutes);
app.use('/audit-logs', auditLogRoutes);
app.use('/admin', adminRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/upload', uploadRoutes);
app.use('/video', videoRoutes);


// DB Connect
connectDB();

// Start Server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
