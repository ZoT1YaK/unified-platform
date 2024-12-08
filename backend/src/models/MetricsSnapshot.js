const mongoose = require("mongoose");

const metricsSnapshotSchema = new mongoose.Schema({
  emp_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: false,
  },
  team_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    required: false,
  },
  task_completion_rate: {
    type: Number,
    required: true,
  },
  average_task_speed: {
    type: Number,
    required: true,
  },
  milestones_achieved: {
    type: Number,
    required: true,
  },
  engagement_score: {
    type: Number,
    required: true,
  },
  snapshot_date: {
    type: Date,
    default: Date.now,
  },
  start_date: {
    type: Date,
    required: true,
  },
  end_date: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model("MetricsSnapshot", metricsSnapshotSchema);