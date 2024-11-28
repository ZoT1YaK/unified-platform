const mongoose = require("mongoose");

const notificationTypeSchema = new mongoose.Schema({
  type_name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String 
  },
});

module.exports = mongoose.model("NotificationType", notificationTypeSchema);