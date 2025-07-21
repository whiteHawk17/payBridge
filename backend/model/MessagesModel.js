const mongoose = require("mongoose");
const { Schema } = mongoose;

const messageSchema = new Schema(
  {
    roomId:      { type: Schema.Types.ObjectId, ref: "Room", required: true, index: true },
    senderId:    { type: Schema.Types.ObjectId, ref: "User", required: true },
    content:     { type: String, required: true, trim: true },
    attachments: { type: [String], default: [] },
    flagged: { type: Boolean, default: false },
    type: { type: String, enum: ["CHAT", "EVIDENCE"], default: "CHAT" },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

module.exports = mongoose.model("Message", messageSchema);