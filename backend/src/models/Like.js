const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema({
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
});

likeSchema.index({ post_id: 1, emp_id: 1 }, { unique: true }); 

module.exports = mongoose.model("Like", likeSchema);
