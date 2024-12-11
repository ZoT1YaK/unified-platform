const mongoose = require("mongoose");

const badgeSchema = new mongoose.Schema({
  created_by_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  img_link: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: (v) => /^(http|https):\/\/[^ "]+$/.test(v),
      message: "Invalid URL format for img_link",
    },
  },

    is_archived: {
    type: Boolean,
    default: false, 
  },
  created_at: {
    type: Date,
    default: Date.now,
  },


  
});

module.exports = mongoose.model("Badge", badgeSchema);
