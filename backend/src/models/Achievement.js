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
  related_entity_id: { // ID of related entity (e.g., Event_ID, Task_ID)
    type: String, 
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

achievementSchema.index({ emp_id: 1, related_entity_id: 1 }, { unique: true });

module.exports = mongoose.model("Achievement", achievementSchema);