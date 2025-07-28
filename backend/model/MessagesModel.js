const mongoose = require("mongoose");
const { Schema } = mongoose;

const messageSchema = new Schema(
  {
    roomId:      { type: Schema.Types.ObjectId, ref: "Room", required: true, index: true },
    senderId:    { type: Schema.Types.ObjectId, ref: "User", required: true },
    content:     { type: String, required: true, trim: true },
    messageType: { 
      type: String, 
      enum: ["TEXT", "IMAGE", "VIDEO", "AUDIO", "FILE", "DOCUMENT", "WORK_UPDATE", "BUYER_RESPONSE", "DISPUTE_MESSAGE", "AI_RESPONSE", "SYSTEM_MESSAGE"], 
      default: "TEXT" 
    },
    attachments: [{
      filename: { type: String, required: true },
      originalName: { type: String, required: true },
      mimeType: { type: String, required: true },
      size: { type: Number, required: true },
      path: { type: String, required: true },
      url: { type: String, required: true }
    }],
    status: {
      type: String,
      enum: ["SENT", "DELIVERED", "READ"],
      default: "SENT"
    },
    readBy: [{
      userId: { type: Schema.Types.ObjectId, ref: "User" },
      readAt: { type: Date, default: Date.now }
    }],
    flagged: { type: Boolean, default: false },
    type: { type: String, enum: ["CHAT", "EVIDENCE"], default: "CHAT" },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

module.exports = mongoose.model("Message", messageSchema);