const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  priority: {
    type: String,
    enum: ["LOW", "MEDIUM", "HIGH"],
    default: "MEDIUM"
  },
  status: {
    type: String,
    enum: ["ACTIVE", "PLANNING", "COMPLETED", "ON_HOLD", "CANCELLED"],
    default: "ACTIVE"
  },
  start_date: Date,
  end_date: Date,
  team_lead: {
    type: String,
    ref: "User",
    required: true
  },
  workspaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Workspace",
    required: true
  },
  progress: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Project", projectSchema);
