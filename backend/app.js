

const express = require('express');
const app = express();
const passport = require('./middleware/passport');
const { PORT } = require('./config/env');
const connectDB = require('./config/db');


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

app.use('/auth', authRoutes);
app.use('/', userRoutes);
app.use('/rooms', roomRoutes);
app.use('/', messageRoutes);
app.use('/transactions', transactionRoutes);
app.use('/audit-logs', auditLogRoutes);
app.use('/admin', adminRoutes);

// DB Connect
connectDB();

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
