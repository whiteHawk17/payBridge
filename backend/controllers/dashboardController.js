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
        description: tx ? tx.description : 'No description',
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
    const { role, description, price, date } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!role || !description || !price || !date) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Create the room
    const roomData = {
      status: 'ACTIVE', // Set to ACTIVE so it appears in active rooms
      disputeStatus: 'NONE'
    };

    // Set buyer or seller based on role
    if (role === 'buyer') {
      roomData.buyerId = userId;
    } else if (role === 'seller') {
      roomData.sellerId = userId;
    } else {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const newRoom = await RoomsModel.create(roomData);

    // Create a transaction record with additional details
    const transactionData = {
      roomId: newRoom._id,
      buyerId: userId, // Set to current user initially
      sellerId: userId, // Set to current user initially
      amount: parseFloat(price),
      commission: 0.05, // 5% commission
      paymentStatus: 'INITIATED',
      description: description,
      completionDate: new Date(date)
    };

    const newTransaction = await TransactionsModel.create(transactionData);

    // Update room with transaction ID
    await RoomsModel.findByIdAndUpdate(newRoom._id, {
      transactionId: newTransaction._id
    });

    res.status(201).json({
      message: 'Room created successfully',
      room: newRoom,
      transaction: newTransaction
    });
  } catch (err) {
    console.error('Create room error:', err);
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

exports.joinRoom = async (req, res) => {
  try {
    const { roomId } = req.body;
    const userId = req.user.id;

    if (!roomId) {
      return res.status(400).json({ error: 'Room ID is required' });
    }

    // Find the room
    const room = await RoomsModel.findById(roomId);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Check if room is active
    if (room.status !== 'ACTIVE') {
      return res.status(400).json({ error: 'Room is not active' });
    }

    // Check if user is already a participant
    if (room.buyerId && room.buyerId.toString() === userId) {
      return res.status(400).json({ error: 'You are already the buyer in this room' });
    }

    if (room.sellerId && room.sellerId.toString() === userId) {
      return res.status(400).json({ error: 'You are already the seller in this room' });
    }

    // Determine available role and join the room
    let updateData = {};
    if (!room.buyerId) {
      updateData.buyerId = userId;
    } else if (!room.sellerId) {
      updateData.sellerId = userId;
    } else {
      return res.status(400).json({ error: 'Room is full' });
    }

    // Update the room
    const updatedRoom = await RoomsModel.findByIdAndUpdate(
      roomId,
      updateData,
      { new: true }
    );

    // Update the transaction to include the new participant
    const transaction = await TransactionsModel.findOne({ roomId });
    if (transaction) {
      const transactionUpdate = {};
      if (!transaction.buyerId && !room.buyerId) {
        transactionUpdate.buyerId = userId;
      } else if (!transaction.sellerId && !room.sellerId) {
        transactionUpdate.sellerId = userId;
      }
      
      if (Object.keys(transactionUpdate).length > 0) {
        await TransactionsModel.findByIdAndUpdate(transaction._id, transactionUpdate);
      }
    }

    res.json({
      message: 'Successfully joined the room',
      room: updatedRoom
    });
  } catch (err) {
    console.error('Join room error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getTransactionDetails = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const transaction = await TransactionsModel.findById(transactionId);
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (err) {
    console.error('Get transaction error:', err);
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
    const transactions = await TransactionsModel.find(match).lean();
    
    // Weekly volume (for last 4 weeks)
    const now = new Date();
    let weekBuckets = [0, 0, 0, 0];
    transactions.forEach(tx => {
      const diff = Math.floor((now - new Date(tx.createdAt)) / (1000 * 60 * 60 * 24 * 7));
      if (diff < 4) weekBuckets[3 - diff] += tx.amount;
    });

    // Status counts
    const statusCounts = { SUCCESS: 0, INITIATED: 0, FAILED: 0, REFUNDED: 0 };
    transactions.forEach(tx => {
      if (statusCounts[tx.paymentStatus] !== undefined) statusCounts[tx.paymentStatus]++;
    });

    // Value distribution
    const valueDist = { '<1k': 0, '1k-5k': 0, '5k-10k': 0, '>10k': 0 };
    transactions.forEach(tx => {
      if (tx.amount < 1000) valueDist['<1k']++;
      else if (tx.amount < 5000) valueDist['1k-5k']++;
      else if (tx.amount < 10000) valueDist['5k-10k']++;
      else valueDist['>10k']++;
    });

    // Category breakdown (by room description or type)
    const roomIds = transactions.map(tx => tx.roomId).filter(Boolean);
    const rooms = await RoomsModel.find({ _id: { $in: roomIds } }).lean();
    const categoryMap = {};
    rooms.forEach(room => {
      // Try to get description from associated transaction first
      const associatedTx = transactions.find(tx => tx.roomId.toString() === room._id.toString());
      const cat = associatedTx?.description || room.description || 'General Transaction';
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });

    // KPIs
    const totalVolume = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    const successCount = statusCounts.SUCCESS;
    const avgValue = transactions.length ? (totalVolume / transactions.length) : 0;
    const successRate = transactions.length ? (successCount / transactions.length) * 100 : 0;
    
    // If no real data, generate sample data for demonstration
    if (transactions.length === 0) {
      weekBuckets = [15000, 22000, 18000, 25000];
      statusCounts.SUCCESS = 8;
      statusCounts.INITIATED = 3;
      statusCounts.FAILED = 1;
      valueDist['<1k'] = 3;
      valueDist['1k-5k'] = 5;
      valueDist['5k-10k'] = 2;
      valueDist['>10k'] = 2;
      categoryMap['Electronics'] = 4;
      categoryMap['Services'] = 3;
      categoryMap['General Transaction'] = 5;
    }
    
    res.json({
      weeklyVolume: weekBuckets,
      statusCounts,
      valueDistribution: valueDist,
      categoryBreakdown: categoryMap,
      kpis: {
        totalVolume: transactions.length === 0 ? 80000 : totalVolume,
        successRate: Math.round(successRate * 100) / 100,
        avgValue: Math.round(avgValue * 100) / 100,
        totalTransactions: transactions.length === 0 ? 12 : transactions.length
      },
      period
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}; 