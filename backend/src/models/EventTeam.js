const mongoose = require("mongoose");

const eventTeamSchema = new mongoose.Schema({
  event_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  team_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    required: true,
  },
});

eventTeamSchema.index({ event_id: 1, team_id: 1 }, { unique: true });

module.exports = mongoose.model("EventTeam", eventTeamSchema);