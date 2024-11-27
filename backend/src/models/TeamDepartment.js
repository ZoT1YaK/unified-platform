const mongoose = require("mongoose");

const teamDepartmentSchema = new mongoose.Schema({
  dep_num: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Department", 
    required: true 
  },
  team_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Team", 
    required: true 
  },
});

teamDepartmentSchema.index({ dep_num: 1, team_id: 1 }, { unique: true });

module.exports = mongoose.model("TeamDepartment", teamDepartmentSchema);