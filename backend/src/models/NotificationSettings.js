const mongoose = require("mongoose");

const notificationSettingsSchema = new mongoose.Schema({
  emp_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  noti_type_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "NotificationType",
    required: true,
  },
  preference: {
    type: Boolean,
    required: true,
    default: true
  },
});

notificationSettingsSchema.index({ emp_id: 1, noti_type_id: 1 }, { unique: true });

module.exports = mongoose.model("NotificationSettings", notificationSettingsSchema);