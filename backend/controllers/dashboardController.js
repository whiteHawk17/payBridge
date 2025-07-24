const TransactionsModel = require('../model/TransactionsModel');
const RoomsModel = require('../model/RoomsModel');
const UsersModel = require('../model/UsersModel');

exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const userQuery = { $or: [{ buyerId: userId }, { sellerId: userId }] };
    const totalTransactions = await TransactionsModel.countDocuments(userQuery);
    const successfulTransactions = await TransactionsModel.countDocuments({ ...userQuery, paymentStatus: 'SUCCESS' });
    const pendingTransactions = await TransactionsModel.countDocuments({ ...userQuery, paymentStatus: 'INITIATED' });
    const fundsInEscrowAgg = await TransactionsModel.aggregate([
      { $match: { ...userQuery, paymentStatus: 'INITIATED' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const fundsInEscrow = fundsInEscrowAgg[0]?.total || 0;
    const disputesResolved = await RoomsModel.countDocuments({
      $or: [
        { buyerId: userId },
        { sellerId: userId }
      ],
      status: 'RESOLVED'
    });
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
    // Find active rooms where user is buyer or seller
    const rooms = await RoomsModel.find({
      $or: [
        { buyerId: userId },
        { sellerId: userId }
      ],
      status: 'ACTIVE'
    })
      .populate('buyerId', 'name photo')
      .populate('sellerId', 'name photo')
      .lean();

    // For each room, get the latest transaction (if any)
    const roomIds = rooms.map(r => r._id);
    const transactions = await TransactionsModel.find({ roomId: { $in: roomIds } })
      .sort({ createdAt: -1 })
      .lean();
    const txByRoom = {};
    transactions.forEach(tx => {
      if (!txByRoom[tx.roomId.toString()]) {
        txByRoom[tx.roomId.toString()] = tx;
      }
    });

    const result = rooms.map(room => {
      const tx = txByRoom[room._id.toString()];
      return {
        _id: room._id,
        buyer: room.buyerId,
        seller: room.sellerId,
        amount: tx ? tx.amount : null,
        status: tx ? tx.paymentStatus : room.status,
        reason: room.disputeStatus || 'N/A',
      };
    });
    res.json(result);
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

exports.getPastTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    // Find all transactions where the user is buyer or seller
    const transactions = await TransactionsModel.find({
      $or: [
        { buyerId: userId },
        { sellerId: userId }
      ]
    })
      .populate('roomId')
      .sort({ createdAt: -1 });

    // Map to required fields for frontend
    const result = transactions.map(tx => ({
      id: tx._id,
      roomId: tx.roomId?._id,
      category: tx.roomId ? tx.roomId.name || tx.roomId._id : '',
      date: tx.createdAt,
      status: tx.paymentStatus,
      amount: tx.amount,
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const period = req.query.period || '30d';
    let startDate = null;
    if (period === '30d') {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
    } else if (period === '90d') {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 90);
    }
    const match = {
      $or: [
        { buyerId: userId },
        { sellerId: userId }
      ]
    };
    if (startDate) match.createdAt = { $gte: startDate };

    // Fetch all relevant transactions
    const txs = await TransactionsModel.find(match).lean();

    // Weekly volume (for last 4 weeks)
    const now = new Date();
    const weekBuckets = [0, 0, 0, 0];
    txs.forEach(tx => {
      const diff = Math.floor((now - new Date(tx.createdAt)) / (1000 * 60 * 60 * 24 * 7));
      if (diff < 4) weekBuckets[3 - diff] += tx.amount;
    });

    // Status counts
    const statusCounts = { SUCCESS: 0, INITIATED: 0, FAILED: 0, REFUNDED: 0, DISPUTED: 0 };
    txs.forEach(tx => {
      if (statusCounts[tx.paymentStatus] !== undefined) statusCounts[tx.paymentStatus]++;
      // Optionally, count disputes if you have a field for that
    });

    // Value distribution
    const valueDist = { '<1k': 0, '1k-5k': 0, '5k-10k': 0, '>10k': 0 };
    txs.forEach(tx => {
      if (tx.amount < 1000) valueDist['<1k']++;
      else if (tx.amount < 5000) valueDist['1k-5k']++;
      else if (tx.amount < 10000) valueDist['5k-10k']++;
      else valueDist['>10k']++;
    });

    // Category breakdown (by room name or type if available)
    const roomIds = txs.map(tx => tx.roomId).filter(Boolean);
    const rooms = await RoomsModel.find({ _id: { $in: roomIds } }).lean();
    const categoryMap = {};
    rooms.forEach(room => {
      const cat = room.name || 'Other';
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });

    // KPIs
    const totalVolume = txs.reduce((sum, tx) => sum + tx.amount, 0);
    const successCount = statusCounts.SUCCESS;
    const disputeCount = statusCounts.DISPUTED;
    const avgValue = txs.length ? (totalVolume / txs.length) : 0;
    const successRate = txs.length ? (successCount / txs.length) * 100 : 0;
    const disputeRate = txs.length ? (disputeCount / txs.length) * 100 : 0;

    res.json({
      weeklyVolume: weekBuckets,
      statusCounts,
      valueDistribution: valueDist,
      categoryBreakdown: categoryMap,
      kpis: {
        totalVolume,
        successRate,
        avgValue,
        disputeRate
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
}; 