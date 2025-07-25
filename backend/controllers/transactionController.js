const RoomsModel = require('../model/RoomsModel');
const MessagesModel = require('../model/MessagesModel');
const UsersModel = require('../model/UsersModel');

// POST /transactions/:transactionId/ai-review
exports.aiReview = async (req, res) => {
  // 1. Fetch all EVIDENCE messages for the room
  // 2. Prepare data for AI (images, text, etc.)
  // 3. Call AI service (mocked for now)
  // 4. Store AI decision in room
  // 5. Set disputeStatus = "AI_DECIDED"
  // 6. Notify both parties (TODO)
  res.json({ message: "AI review complete (mocked)", aiDecision: { result: "release funds", details: "AI judged in favor of seller" } });
};

// POST /transactions/:transactionId/ai-accept
exports.aiAccept = async (req, res) => {
  // 1. Add user to aiAcceptedBy in room
  // 2. If both parties accepted, resolve dispute
  res.json({ message: "AI decision accepted (mocked)" });
};

// POST /transactions/:transactionId/ai-reject
exports.aiReject = async (req, res) => {
  // 1. Escalate dispute to admin (set disputeStatus = "ESCALATED")
  res.json({ message: "AI decision rejected, escalated to admin (mocked)" });
};



