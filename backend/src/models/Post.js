const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  emp_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true
  },
  related_emp_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: false
  },
  content: {
    type: String,
    required: true
  },
  mediaLinks: [{ 
    type: String 
  }],
  likes: {
    type: Number,
    default: 0
  },
  comments: {
    type: Number,
    default: 0
  },
  visibility: {
    type: Boolean,
    default: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
});

module.exports = mongoose.model("Post", postSchema);