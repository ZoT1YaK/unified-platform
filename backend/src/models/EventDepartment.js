const mongoose = require("mongoose");

const eventDepartmentSchema = new mongoose.Schema({
  event_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  dep_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: true,
  },
});

eventDepartmentSchema.index({ event_id: 1, dep_id: 1 }, { unique: true });

module.exports = mongoose.model("EventDepartment", eventDepartmentSchema);