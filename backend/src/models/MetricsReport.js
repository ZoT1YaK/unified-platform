const mongoose = require("mongoose");

const metricsReportSchema = new mongoose.Schema({
  generated_for: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  report_date: {
    type: Date,
    default: Date.now,
  },
  file_path: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Sent"],
    default: "Pending",
  },
});

module.exports = mongoose.model("MetricsReport", metricsReportSchema);