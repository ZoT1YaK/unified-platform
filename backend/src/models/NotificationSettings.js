const mongoose = require("mongoose");

const notificationSettingsSchema = new mongoose.Schema(
  {
    emp_email: {
      type: String,
      required: true,
      ref: "Employee",
    },
    noti_type_id: {
      type: Number,
      required: true,
      ref: "NotificationType",
    },
    preference: {
      type: String,
      required: true,
      enum: ["Enabled", "Disabled"],
    },
  },
  {
    _id: false, // Composite Primary Key: emp_email + noti_type_id
  }
);

// Composite Key Validation
notificationSettingsSchema.index({ emp_email: 1, noti_type_id: 1 }, { unique: true });

module.exports = mongoose.model("NotificationSettings", notificationSettingsSchema);