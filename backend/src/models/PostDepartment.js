const mongoose = require("mongoose");

const postDepartmentSchema = new mongoose.Schema({
  post_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Post", 
    required: true 
  },
  dep_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Department", 
    required: true 
  },
});

postDepartmentSchema.index({ post_id: 1, dep_id: 1 }, { unique: true });

module.exports = mongoose.model("PostDepartment", postDepartmentSchema);