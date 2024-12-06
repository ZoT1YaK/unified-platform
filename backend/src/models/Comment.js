const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  post_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Post", 
    required: true 
  },
  emp_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Employee", 
    required: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  },
});

module.exports = mongoose.model("Comment", commentSchema);