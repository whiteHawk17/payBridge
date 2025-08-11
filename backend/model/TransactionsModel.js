const mongoose = require("mongoose");
const { Schema } = mongoose;

const transactionSchema = new Schema(
  {
    roomId:             { type: Schema.Types.ObjectId, ref: "Room", required: true },
    buyerId:            { type: Schema.Types.ObjectId, ref: "User", required: true },
    sellerId:           { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount:             { type: Number, required: true, min: 1 },
    commission:         { type: Number, required: true, min: 0 },
    paymentStatus:      { type: String, enum: ["INITIATED","SUCCESS","FAILED","REFUNDED"], default: "INITIATED" },
    razorpayPaymentId:  { type: String, default: null },
    razorpayOrderId:    { type: String, default: null },
    razorpayPayoutId:   { type: String, default: null },
    isFundsReleased:    { type: Boolean, default: false },
    payoutStatus:        { type: String, enum: ["PENDING", "PROCESSING", "SUCCESS", "FAILED"], default: "PENDING" },
    payoutCreatedAt:    { type: Date, default: null },
    payoutCompletedAt:  { type: Date, default: null },
    deliveryProofURL:   { type: String, default: null },
    verificationStatus: { type: String, enum: ["PENDING","VERIFIED","REJECTED"], default: "PENDING" },
    flagged: { type: Boolean, default: false },
    description:        { type: String, default: null },
    completionDate:     { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);