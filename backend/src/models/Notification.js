const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  recipient_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Employee", 
    required: true 
  },
  noti_type_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "NotificationType", 
    required: true 
  }, 
  related_entity_id: { // ID of related entity (e.g., Post_ID, Task_ID)
    type: String, 
    required: true 
  }, 
  notification_date: { 
    type: Date, 
    default: Date.now 
  },
  message: { 
    type: String, 
    required: true 
  },
  status: {
    type: String,
    enum: ["Pending", "Sent", "Read"],
    default: "Pending",},
});

module.exports = mongoose.model("Notification", notificationSchema);