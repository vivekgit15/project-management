const mongoose = require("mongoose");

const projectMemberSchema = new mongoose.Schema({
  userId: {
    type: String,
    ref: "User",
    required: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true
  }
}, {
  timestamps: true
});

projectMemberSchema.index({ userId: 1, projectId: 1 }, { unique: true });

module.exports = mongoose.model("ProjectMember", projectMemberSchema);
