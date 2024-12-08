const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  created_by_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Employee", 
    required: true 
  },
  assigned_to_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Employee", 
    required: false 
  },
  badge_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Badge", 
    required: false 
  },
  title: { 
    type: String, 
    required: true 
  },
  deadline: { 
    type: Date, 
    required: false
  },
  status: { 
    type: String, 
    enum: ["Pending", "Completed"], 
    default: "Pending" 
  },
  completion_date: { 
    type: Date, 
    default: null 
  },
  type: { 
    type: String, 
    enum: ["Self-Created", "Leader-Assigned"], 
    required: true 
  },
  description: { 
    type: String
  }
});

module.exports = mongoose.model("Task", taskSchema);
