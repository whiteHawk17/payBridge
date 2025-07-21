const mongoose = require("mongoose");
const { Schema } = mongoose;

const auditLogSchema = new Schema(
  {
    eventType:     { type: String, required: true },                      // e.g. "ROOM_CREATED"
    performedBy:   { type: Schema.Types.ObjectId, ref: "User", default: null },
    roomId:        { type: Schema.Types.ObjectId, ref: "Room", default: null },
    transactionId: { type: Schema.Types.ObjectId, ref: "Transaction", default: null },
    metadata:      { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);