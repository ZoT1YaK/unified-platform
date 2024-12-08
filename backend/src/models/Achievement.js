const mongoose = require("mongoose");

const achievementSchema = new mongoose.Schema({
  emp_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Employee", 
    required: true 
  },
  badge_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Badge", 
    required: true 
  },
  task_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Task", 
    required: true 
  },
  visibility: { 
    type: Boolean, 
    default: true 
  },
  achievement_date: { 
    type: Date, 
    default: Date.now 
  },
});

achievementSchema.index({ emp_id: 1, task_id: 1 }, { unique: true });

module.exports = mongoose.model("Achievement", achievementSchema);