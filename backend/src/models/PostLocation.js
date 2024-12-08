const mongoose = require("mongoose");

const postLocationSchema = new mongoose.Schema({
  post_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Post", 
    required: true 
  },
  location: { 
    type: String, 
    required: true 
  },
});

postLocationSchema.index({ post_id: 1, location: 1 }, { unique: true });

module.exports = mongoose.model("PostLocation", postLocationSchema);