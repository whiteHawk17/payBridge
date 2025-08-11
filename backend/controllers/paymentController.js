const Razorpay = require('razorpay');
const crypto = require('crypto');
const TransactionsModel = require('../model/TransactionsModel');
const RoomsModel = require('../model/RoomsModel');
const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = require('../config/env');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET
});

// Commission rate (5% of transaction amount)
const COMMISSION_RATE = 0.05;

exports.createOrder = async (req, res) => {
  try {
    const { roomId, amount, description } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!roomId || !amount || !description) {
      return res.status(400).json({ error: 'Room ID, amount, and description are required' });
    }

    // Verify room exists and user is the buyer
    const room = await RoomsModel.findById(roomId);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (room.buyerId.toString() !== userId) {
      return res.status(403).json({ error: 'Only the buyer can initiate payment for this room' });
    }

    // Check if transaction already exists
    const existingTransaction = await TransactionsModel.findOne({ roomId });
    if (existingTransaction) {
      return res.status(400).json({ error: 'Payment already initiated for this room' });
    }

    // Calculate commission
    const commission = amount * COMMISSION_RATE;
    const totalAmount = amount + commission;

    // Create Razorpay order
    const orderOptions = {
      amount: Math.round(totalAmount * 100), // Razorpay expects amount in paise
      currency: 'INR',
      receipt: `room_${roomId.toString().slice(-8)}_${Date.now().toString().slice(-8)}`,
      notes: {
        roomId: roomId,
        description: description,
        commission: commission.toString(),
        buyerId: userId
      }
    };

    console.log('Creating Razorpay order with options:', orderOptions);
    const order = await razorpay.orders.create(orderOptions);
    console.log('Razorpay order created successfully:', order.id);

    // Create transaction record
    console.log('Creating transaction record with data:', {
      roomId, buyerId: userId, sellerId: room.sellerId, amount, commission
    });
    const transaction = await TransactionsModel.create({
      roomId: roomId,
      buyerId: userId,
      sellerId: room.sellerId,
      amount: amount,
      commission: commission,
      paymentStatus: 'INITIATED',
      razorpayOrderId: order.id,
      description: description,
      completionDate: room.completionDate
    });
    console.log('Transaction record created successfully:', transaction._id);

    // Update room with transaction ID
    console.log('Updating room status to AWAITING_PAYMENT');
    await RoomsModel.findByIdAndUpdate(roomId, {
      transactionId: transaction._id,
      status: 'AWAITING_PAYMENT'
    });
    console.log('Room updated successfully');

    const response = {
      success: true,
      orderId: order.id,
      amount: totalAmount,
      currency: 'INR',
      transactionId: transaction._id,
      key: RAZORPAY_KEY_ID
    };
    console.log('Sending successful response:', response);
    res.json(response);

  } catch (error) {
    console.error('Create order error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      roomId: req.body.roomId,
      amount: req.body.amount,
      userId: req.user?.id
    });
    res.status(500).json({ 
      error: 'Failed to create payment order',
      details: error.message 
    });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Verify payment signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    // Find and update transaction
    const transaction = await TransactionsModel.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        paymentStatus: 'SUCCESS',
        razorpayPaymentId: razorpay_payment_id
      },
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Update room status
    await RoomsModel.findByIdAndUpdate(transaction.roomId, {
      status: 'ACTIVE'
    });

    res.json({
      success: true,
      message: 'Payment verified successfully',
      transactionId: transaction._id,
      roomId: transaction.roomId
    });

  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
};

exports.getPaymentStatus = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user.id;

    const transaction = await TransactionsModel.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Check if user is part of this transaction
    if (transaction.buyerId.toString() !== userId && transaction.sellerId.toString() !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      transactionId: transaction._id,
      amount: transaction.amount,
      commission: transaction.commission,
      totalAmount: transaction.amount + transaction.commission,
      paymentStatus: transaction.paymentStatus,
      razorpayOrderId: transaction.razorpayOrderId,
      razorpayPaymentId: transaction.razorpayPaymentId,
      createdAt: transaction.createdAt
    });

  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({ error: 'Failed to get payment status' });
  }
};

exports.refundPayment = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user.id;

    const transaction = await TransactionsModel.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Check if user is the buyer
    if (transaction.buyerId.toString() !== userId) {
      return res.status(403).json({ error: 'Only the buyer can request a refund' });
    }

    // Check if payment was successful
    if (transaction.paymentStatus !== 'SUCCESS') {
      return res.status(400).json({ error: 'Payment not successful, cannot refund' });
    }

    // Check if funds are already released
    if (transaction.isFundsReleased) {
      return res.status(400).json({ error: 'Funds already released, cannot refund' });
    }

    // Process refund through Razorpay
    if (transaction.razorpayPaymentId) {
      try {
        await razorpay.payments.refund(transaction.razorpayPaymentId, {
          amount: Math.round((transaction.amount + transaction.commission) * 100)
        });

        // Update transaction status
        await TransactionsModel.findByIdAndUpdate(transactionId, {
          paymentStatus: 'REFUNDED'
        });

        // Update room status
        await RoomsModel.findByIdAndUpdate(transaction.roomId, {
          status: 'DISPUTE'
        });

        res.json({
          success: true,
          message: 'Refund processed successfully'
        });
      } catch (refundError) {
        console.error('Razorpay refund error:', refundError);
        res.status(500).json({ error: 'Failed to process refund' });
      }
    } else {
      res.status(400).json({ error: 'No payment ID found for refund' });
    }

  } catch (error) {
    console.error('Refund payment error:', error);
    res.status(500).json({ error: 'Failed to process refund' });
  }
};

exports.releasePayment = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user.id;

    const transaction = await TransactionsModel.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Check if user is the buyer
    if (transaction.buyerId.toString() !== userId) {
      return res.status(403).json({ error: 'Only the buyer can release payment' });
    }

    // Check if payment was successful
    if (transaction.paymentStatus !== 'SUCCESS') {
      return res.status(400).json({ error: 'Payment not successful, cannot release' });
    }

    // Check if funds are already released
    if (transaction.isFundsReleased) {
      return res.status(400).json({ error: 'Funds already released' });
    }

    // Get room details to check seller payment details
    const room = await RoomsModel.findById(transaction.roomId);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Check if seller has provided payment details
    if (!room.sellerPaymentDetails || !room.sellerPaymentDetails.isDetailsComplete) {
      return res.status(400).json({ 
        error: 'Seller has not provided payment details yet. Please ask the seller to add their UPI ID and bank details first.' 
      });
    }

    // Process real payout through Razorpay
    try {
      // Create payout to seller's bank account
      const payoutData = {
        account_number: room.sellerPaymentDetails.bankAccount,
        fund_account: {
          account_type: 'bank_account',
          bank_account: {
            name: room.sellerPaymentDetails.accountHolderName,
            ifsc: room.sellerPaymentDetails.ifscCode,
            account_number: room.sellerPaymentDetails.bankAccount
          }
        },
        amount: Math.round(transaction.amount * 100), // Convert to paise
        currency: 'INR',
        mode: 'IMPS', // Instant transfer
        purpose: 'payout',
        queue_if_low_balance: true,
        reference_id: `payout_${transactionId}_${Date.now()}`,
        narration: `Payment for work completion - Room ${room._id}`
      };

      console.log('Creating Razorpay payout with data:', payoutData);
      const payout = await razorpay.payouts.create(payoutData);
      console.log('Razorpay payout created successfully:', payout.id);

      // Update transaction status
      await TransactionsModel.findByIdAndUpdate(transactionId, {
        isFundsReleased: true,
        razorpayPayoutId: payout.id,
        payoutStatus: 'PROCESSING',
        payoutCreatedAt: new Date()
      });

      // Update room status
      await RoomsModel.findByIdAndUpdate(transaction.roomId, {
        status: 'COMPLETED'
      });

      // TODO: Send email notifications to both parties
      // TODO: Send webhook notification

      res.json({
        success: true,
        message: 'Payment released successfully to seller',
        payoutId: payout.id,
        sellerPaymentDetails: {
          upiId: room.sellerPaymentDetails.upiId,
          bankAccount: room.sellerPaymentDetails.bankAccount,
          ifscCode: room.sellerPaymentDetails.ifscCode,
          accountHolderName: room.sellerPaymentDetails.accountHolderName
        },
        amount: transaction.amount,
        releasedAt: new Date(),
        payoutStatus: 'PROCESSING'
      });

    } catch (payoutError) {
      console.error('Razorpay payout error:', payoutError);
      
      // If payout fails, try UPI transfer as fallback
      if (room.sellerPaymentDetails.upiId) {
        try {
          const upiPayout = await razorpay.payouts.create({
            fund_account: {
              account_type: 'vpa',
              vpa: {
                address: room.sellerPaymentDetails.upiId
              }
            },
            amount: Math.round(transaction.amount * 100),
            currency: 'INR',
            mode: 'UPI',
            purpose: 'payout',
            reference_id: `upipayout_${transactionId}_${Date.now()}`,
            narration: `UPI Payment for work completion`
          });

          console.log('UPI payout created successfully:', upiPayout.id);

          // Update transaction status
          await TransactionsModel.findByIdAndUpdate(transactionId, {
            isFundsReleased: true,
            razorpayPayoutId: upiPayout.id,
            payoutStatus: 'PROCESSING',
            payoutCreatedAt: new Date()
          });

          // Update room status
          await RoomsModel.findByIdAndUpdate(transaction.roomId, {
            status: 'COMPLETED'
          });

          res.json({
            success: true,
            message: 'Payment released successfully via UPI',
            payoutId: upiPayout.id,
            method: 'UPI',
            amount: transaction.amount,
            releasedAt: new Date(),
            payoutStatus: 'PROCESSING'
          });

        } catch (upiError) {
          console.error('UPI payout also failed:', upiError);
          res.status(500).json({ 
            error: 'Failed to process payout. Please try again or contact support.',
            details: upiError.message 
          });
        }
      } else {
        res.status(500).json({ 
          error: 'Failed to process bank payout. Please try again or contact support.',
          details: payoutError.message 
        });
      }
    }

  } catch (error) {
    console.error('Release payment error:', error);
    res.status(500).json({ error: 'Failed to release payment' });
  }
};

// Webhook handlers
exports.handleWebhook = async (req, res) => {
  try {
    const { event, payload } = req.body;
    
    console.log('Received webhook:', event, payload.payment.entity.id);
    
    if (event === 'payment.captured') {
      const payment = payload.payment.entity;
      
      // Find transaction by Razorpay payment ID
      const transaction = await TransactionsModel.findOne({ 
        razorpayPaymentId: payment.id 
      });
      
      if (transaction) {
        // Update transaction status
        await TransactionsModel.findByIdAndUpdate(transaction._id, {
          paymentStatus: 'SUCCESS',
          updatedAt: new Date()
        });
        
        console.log(`Transaction ${transaction._id} marked as successful`);
      }
    }
    
    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

exports.handlePayoutWebhook = async (req, res) => {
  try {
    const { event, payload } = req.body;
    
    console.log('Received payout webhook:', event, payload.payout.entity.id);
    
    if (event === 'payout.processed') {
      const payout = payload.payout.entity;
      
      // Find transaction by Razorpay payout ID
      const transaction = await TransactionsModel.findOne({ 
        razorpayPayoutId: payout.id 
      });
      
      if (transaction) {
        // Update payout status
        await TransactionsModel.findByIdAndUpdate(transaction._id, {
          payoutStatus: 'SUCCESS',
          payoutCompletedAt: new Date(),
          updatedAt: new Date()
        });
        
        console.log(`Payout ${payout.id} completed for transaction ${transaction._id}`);
        
        // TODO: Send success notification to seller
        // TODO: Update room status if needed
      }
    } else if (event === 'payout.failed') {
      const payout = payload.payout.entity;
      
      // Find transaction by Razorpay payout ID
      const transaction = await TransactionsModel.findOne({ 
        razorpayPayoutId: payout.id 
      });
      
      if (transaction) {
        // Update payout status
        await TransactionsModel.findByIdAndUpdate(transaction._id, {
          payoutStatus: 'FAILED',
          payoutCompletedAt: new Date(),
          updatedAt: new Date()
        });
        
        console.log(`Payout ${payout.id} failed for transaction ${transaction._id}`);
        
        // TODO: Send failure notification to seller and buyer
        // TODO: Mark room for manual intervention
      }
    }
    
    res.json({ received: true });
  } catch (error) {
    console.error('Payout webhook error:', error);
    res.status(500).json({ error: 'Payout webhook processing failed' });
  }
};
