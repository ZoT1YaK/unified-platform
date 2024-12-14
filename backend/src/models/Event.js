const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  created_by_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: false,
  },
  location: {
    type: String,
    default: "Online",
  },

  badge_id: { type: mongoose.Schema.Types.ObjectId, ref: "Badge", required: false },

  archived: {
    type: Boolean,
    default: false,
  }

});

module.exports = mongoose.model("Event", eventSchema);