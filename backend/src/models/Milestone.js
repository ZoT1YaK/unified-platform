const mongoose = require("mongoose");

const milestoneSchema = new mongoose.Schema({
  emp_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Employee", 
    required: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  years: { 
    type: Number, 
    required: true 
  }, 
  date_unlocked: { 
    type: Date, 
    required: true 
  },
  visibility: { 
    type: Boolean, 
    default: true 
  },
});

module.exports = mongoose.model("Milestone", milestoneSchema);
