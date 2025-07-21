const RoomsModel = require('../model/RoomsModel');
const UsersModel = require('../model/UsersModel');
const AuditLogsModel = require('../model/AuditLogsModel');
const TransactionsModel = require('../model/TransactionsModel');
const PlatformSettingsModel = require('../model/PlatformSettingsModel');
const MessagesModel = require('../model/MessagesModel');
const NotificationModel = require('../model/NotificationModel');

exports.getDisputeRooms = async (req, res) => {
  try {
    const status = req.query.status || 'DISPUTE';
    const rooms = await RoomsModel.find({ status });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.resolveRoomDispute = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { resolutionNote } = req.body;
    // 1. Update room status to RESOLVED
    const updatedRoom = await RoomsModel.findByIdAndUpdate(
      roomId,
      { status: 'RESOLVED', resolutionNote },
      { new: true }
    );
    if (!updatedRoom) return res.status(404).json({ error: 'Room not found' });

    // 2. Update related transactions to RELEASED (if any)
    const updatedTransactions = await TransactionsModel.updateMany(
      { room: roomId, status: 'ESCROW' },
      { $set: { status: 'RELEASED' } }
    );

    // 3. Log this action in AuditLogsModel
    await AuditLogsModel.create({
      action: 'RESOLVE_DISPUTE',
      room: roomId,
      performedBy: req.user.id,
      note: resolutionNote,
      timestamp: new Date()
    });

    res.json({
      message: 'Dispute resolved, funds released.',
      room: updatedRoom,
      transactionsUpdated: updatedTransactions.modifiedCount
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.listUsers = async (req, res) => {
  try {
    // TODO: Add search/filter logic as needed
    const users = await UsersModel.find({});
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getAuditLogs = async (req, res) => {
  try {
    const { action, user, room } = req.query;
    const filter = {};
    if (action) filter.action = action;
    if (user) filter.performedBy = user;
    if (room) filter.room = room;
    const logs = await AuditLogsModel.find(filter);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.changeRoomStatus = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { status, note } = req.body;
    const allowedStatuses = ['ACTIVE', 'SUSPENDED', 'CLOSED', 'APPROVED', 'DISPUTE', 'RESOLVED'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const updatedRoom = await RoomsModel.findByIdAndUpdate(
      roomId,
      { status, statusChangeNote: note },
      { new: true }
    );
    if (!updatedRoom) return res.status(404).json({ error: 'Room not found' });
    await AuditLogsModel.create({
      action: 'CHANGE_ROOM_STATUS',
      room: roomId,
      performedBy: req.user.id,
      newStatus: status,
      note,
      timestamp: new Date()
    });
    res.json({
      message: `Room status changed to ${status}`,
      room: updatedRoom
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getRoomDocuments = async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await RoomsModel.findById(roomId);
    if (!room) return res.status(404).json({ error: 'Room not found' });
    // Assume documents are stored as an array of file paths/URLs in room.documents
    const documents = room.documents || [];
    // Log the document view in AuditLogsModel
    await AuditLogsModel.create({
      action: 'VIEW_ROOM_DOCUMENTS',
      room: roomId,
      performedBy: req.user.id,
      timestamp: new Date()
    });
    res.json({ documents });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    const allowedRoles = ['user', 'admin'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    const user = await UsersModel.findByIdAndUpdate(userId, { role }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    await AuditLogsModel.create({
      action: 'CHANGE_USER_ROLE',
      user: userId,
      performedBy: req.user.id,
      newRole: role,
      timestamp: new Date()
    });
    res.json({ message: `User role changed to ${role}`, user });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.suspendUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await UsersModel.findByIdAndUpdate(userId, { suspended: true }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    await AuditLogsModel.create({
      action: 'SUSPEND_USER',
      user: userId,
      performedBy: req.user.id,
      timestamp: new Date()
    });
    res.json({ message: 'User suspended', user });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await UsersModel.findByIdAndDelete(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    await AuditLogsModel.create({
      action: 'DELETE_USER',
      user: userId,
      performedBy: req.user.id,
      timestamp: new Date()
    });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.listAllTransactions = async (req, res) => {
  try {
    const transactions = await TransactionsModel.find({});
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.refundTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const transaction = await TransactionsModel.findByIdAndUpdate(
      transactionId,
      { status: 'REFUNDED' },
      { new: true }
    );
    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
    await AuditLogsModel.create({
      action: 'REFUND_TRANSACTION',
      transaction: transactionId,
      performedBy: req.user.id,
      timestamp: new Date()
    });
    res.json({ message: 'Transaction refunded', transaction });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.flagTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const transaction = await TransactionsModel.findByIdAndUpdate(
      transactionId,
      { flagged: true },
      { new: true }
    );
    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
    await AuditLogsModel.create({
      action: 'FLAG_TRANSACTION',
      transaction: transactionId,
      performedBy: req.user.id,
      timestamp: new Date()
    });
    res.json({ message: 'Transaction flagged', transaction });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.manualPayout = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const transaction = await TransactionsModel.findByIdAndUpdate(
      transactionId,
      { status: 'PAID_MANUAL' },
      { new: true }
    );
    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
    await AuditLogsModel.create({
      action: 'MANUAL_PAYOUT',
      transaction: transactionId,
      performedBy: req.user.id,
      timestamp: new Date()
    });
    res.json({ message: 'Manual payout processed', transaction });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getPlatformSettings = async (req, res) => {
  try {
    const settings = await PlatformSettingsModel.findOne();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updatePlatformSettings = async (req, res) => {
  try {
    const updates = req.body;
    const settings = await PlatformSettingsModel.findOneAndUpdate({}, updates, { new: true, upsert: true });
    await AuditLogsModel.create({
      action: 'UPDATE_PLATFORM_SETTINGS',
      performedBy: req.user.id,
      updates,
      timestamp: new Date()
    });
    res.json({ message: 'Platform settings updated', settings });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getAdminDashboard = async (req, res) => {
  try {
    const totalUsers = await UsersModel.countDocuments();
    const totalRooms = await RoomsModel.countDocuments();
    const totalTransactions = await TransactionsModel.countDocuments();
    const totalFunds = await TransactionsModel.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const disputes = await RoomsModel.countDocuments({ status: 'DISPUTE' });
    const resolvedDisputes = await RoomsModel.countDocuments({ status: 'RESOLVED' });
    res.json({
      totalUsers,
      totalRooms,
      totalTransactions,
      totalFunds: totalFunds[0]?.total || 0,
      disputes,
      resolvedDisputes
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getFlaggedMessages = async (req, res) => {
  try {
    const flaggedMessages = await MessagesModel.find({ flagged: true });
    res.json(flaggedMessages);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.sendNotification = async (req, res) => {
  try {
    const { userIds, message } = req.body;
    if (!Array.isArray(userIds) || !message) {
      return res.status(400).json({ error: 'userIds (array) and message are required' });
    }
    const notifications = await Promise.all(userIds.map(userId =>
      NotificationModel.create({ user: userId, message, sentBy: req.user.id, timestamp: new Date() })
    ));
    await AuditLogsModel.create({
      action: 'SEND_NOTIFICATION',
      performedBy: req.user.id,
      userIds,
      message,
      timestamp: new Date()
    });
    res.json({ message: 'Notifications sent', notifications });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
}; 