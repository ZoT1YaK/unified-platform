const mongoose = require("mongoose");

const teamEmployeeSchema = new mongoose.Schema({
  team_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Team", 
    required: true 
  },
  emp_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Employee", 
    required: true 
  },
});

teamEmployeeSchema.index({ team_id: 1, emp_email: 1 }, { unique: true });

module.exports = mongoose.model("TeamEmployee", teamEmployeeSchema);