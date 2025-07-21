const TransactionsModel = require('../model/TransactionsModel');
const RoomsModel = require('../model/RoomsModel');
const UsersModel = require('../model/UsersModel');

exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const totalTransactions = await TransactionsModel.countDocuments({ user: userId });
    const successfulTransactions = await TransactionsModel.countDocuments({ user: userId, status: 'SUCCESS' });
    const pendingTransactions = await TransactionsModel.countDocuments({ user: userId, status: 'PENDING' });
    const fundsInEscrowAgg = await TransactionsModel.aggregate([
      { $match: { user: userId, status: 'ESCROW' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const fundsInEscrow = fundsInEscrowAgg[0]?.total || 0;
    const disputesResolved = await RoomsModel.countDocuments({ participants: userId, status: 'RESOLVED' });
    res.json({
      totalTransactions,
      successfulTransactions,
      pendingTransactions,
      fundsInEscrow,
      disputesResolved
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getActiveRooms = async (req, res) => {
  try {
    const userId = req.user.id;
    const rooms = await RoomsModel.find({ participants: userId, status: 'ACTIVE' });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createRoom = async (req, res) => {
  try {
    // TODO: Add input validation as needed
    const { name, participants } = req.body;
    const newRoom = await RoomsModel.create({ name, participants, status: 'ACTIVE' });
    res.status(201).json(newRoom);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getRoomDetails = async (req, res) => {
  try {
    const room = await RoomsModel.findById(req.params.roomId);
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await UsersModel.findById(req.user.id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.logout = (req, res) => {
  // TODO: Implement session/token invalidation as per your auth system
  if (req.session) {
    req.session.destroy(() => {
      res.json({ message: 'Logged out' });
    });
  } else {
    res.json({ message: 'Logged out (token-based)' });
  }
}; 