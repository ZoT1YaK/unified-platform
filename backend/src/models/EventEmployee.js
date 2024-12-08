const mongoose = require("mongoose");

const eventEmployeeSchema = new mongoose.Schema({
  event_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  emp_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  response: {
    type: String,
    enum: ["Accepted", "Declined", "Pending"],
    default: "Pending",
  },
});

eventEmployeeSchema.index({ event_id: 1, emp_id: 1 }, { unique: true });

module.exports = mongoose.model("EventEmployee", eventEmployeeSchema);