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
    price:         { type: Number, default: null },
    description:   { type: String, default: null },
    completionDate: { type: Date, default: null },
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
    
    // Work Status Tracking
    workStatus: {
      currentPhase: { 
        type: String, 
        enum: ["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "UNDER_REVIEW", "APPROVED", "REJECTED", "DISPUTED"],
        default: "NOT_STARTED"
      },
      sellerUpdates: [{
        updateId: { type: String, required: true },
        message: { type: String, required: true },
        attachments: [{
          filename: { type: String, required: true },
          originalName: { type: String, required: true },
          mimeType: { type: String, required: true },
          size: { type: Number, required: true },
          path: { type: String, required: true },
          url: { type: String, required: true }
        }],
        timestamp: { type: Date, default: Date.now },
        status: { 
          type: String, 
          enum: ["PENDING", "APPROVED", "REJECTED", "DISPUTED"],
          default: "PENDING"
        }
      }],
      buyerResponses: [{
        responseId: { type: String, required: true },
        updateId: { type: String, required: true }, // Reference to seller update
        action: { 
          type: String, 
          enum: ["APPROVE", "REJECT", "REQUEST_CHANGES", "DISPUTE"],
          required: true
        },
        message: { type: String },
        attachments: [{
          filename: { type: String, required: true },
          originalName: { type: String, required: true },
          mimeType: { type: String, required: true },
          size: { type: Number, required: true },
          path: { type: String, required: true },
          url: { type: String, required: true }
        }],
        timestamp: { type: Date, default: Date.now }
      }],
      disputeDetails: {
        initiatedBy: { type: Schema.Types.ObjectId, ref: "User" },
        reason: { type: String },
        evidence: [{
          filename: { type: String, required: true },
          originalName: { type: String, required: true },
          mimeType: { type: String, required: true },
          size: { type: Number, required: true },
          path: { type: String, required: true },
          url: { type: String, required: true }
        }],
        aiReview: {
          status: { 
            type: String, 
            enum: ["PENDING", "IN_PROGRESS", "COMPLETED"],
            default: "PENDING"
          },
          decision: { type: String },
          reasoning: { type: String },
          reviewedAt: { type: Date }
        },
        adminReview: {
          status: { 
            type: String, 
            enum: ["PENDING", "IN_PROGRESS", "RESOLVED"],
            default: "PENDING"
          },
          adminId: { type: Schema.Types.ObjectId, ref: "User" },
          decision: { type: String },
          resolution: { type: String },
          resolvedAt: { type: Date }
        }
      }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", roomSchema);