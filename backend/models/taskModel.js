const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: "pending",
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "projects",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    attachments: {
      type: Array,
      default : []
    },
  },
  { timestamps: true }
);


module.exports = mongoose.model("tasks", taskSchema);