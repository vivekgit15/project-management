const mongoose = require("mongoose");

const workspaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  settings: {
    type: Object,
    default: {}
  },
  ownerId: {
    type: String,
    ref: "User",
    required: true
  },
  image_url: {
    type: String,
    default: ""
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Workspace", workspaceSchema);
