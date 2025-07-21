const mongoose = require("mongoose");
const { Schema } = mongoose;

const invitationSchema = new Schema(
  {
    token:         { type: String, required: true },
    email:         { type: String, lowercase: true, trim: true },
    invitedUserId: { type: Schema.Types.ObjectId, ref: "User" },
    role:          { type: String, enum: ["BUYER", "SELLER"], required: true },
    status:        { type: String, enum: ["PENDING", "ACCEPTED", "REJECTED"], default: "PENDING" },
    expiresAt:     { type: Date, required: true },
  },
  {
    _id: false,
    timestamps: { createdAt: true, updatedAt: false }
  }
);

const roomSchema = new Schema(
  {
    buyerId:       { type: Schema.Types.ObjectId, ref: "User", default: null },
    sellerId:      { type: Schema.Types.ObjectId, ref: "User", default: null },
    invitations:   { type: [invitationSchema], default: [] },
    status: {
      type: String,
      enum: [
        "PENDING",
        "ACTIVE",
        "AWAITING_DELIVERY",
        "VERIFICATION",
        "COMPLETED",
        "DISPUTE"
      ],
      default: "PENDING"
    },
    transactionId: { type: Schema.Types.ObjectId, ref: "Transaction", default: null },
    disputeStatus: { type: String, enum: ["NONE", "AI_REVIEW", "AI_DECIDED", "ESCALATED", "RESOLVED"], default: "NONE" },
    aiDecision: {
      result: { type: String, default: null },
      details: { type: String, default: null },
      reviewedAt: { type: Date, default: null }
    },
    aiAcceptedBy: { type: [Schema.Types.ObjectId], ref: "User", default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", roomSchema);