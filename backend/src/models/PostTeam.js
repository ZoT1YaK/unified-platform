const mongoose = require("mongoose");

const postTeamSchema = new mongoose.Schema({
  post_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Post", 
    required: true 
  },
  team_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Team", 
    required: true 
  },
});

postTeamSchema.index({ post_id: 1, team_id: 1 }, { unique: true });

module.exports = mongoose.model("PostTeam", postTeamSchema);