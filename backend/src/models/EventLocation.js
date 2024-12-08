const mongoose = require("mongoose");

const eventLocationSchema = new mongoose.Schema({
  event_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
});

eventLocationSchema.index({ event_id: 1, location: 1 }, { unique: true });

module.exports = mongoose.model("EventLocation", eventLocationSchema);