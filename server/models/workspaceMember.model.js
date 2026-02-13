const mongoose = require("mongoose");

const workspaceMemberSchema = new mongoose.Schema({
  userId: {
    type: String,
    ref: "User",
    required: true
  },
  workspaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Workspace",
    required: true
  },
  message: {
    type: String,
    default: ""
  },
  role: {
    type: String,
    enum: ["ADMIN", "MEMBER"],
    default: "MEMBER"
  }
}, {
  timestamps: true
});

workspaceMemberSchema.index({ userId: 1, workspaceId: 1 }, { unique: true });

module.exports = mongoose.model("WorkspaceMember", workspaceMemberSchema);
