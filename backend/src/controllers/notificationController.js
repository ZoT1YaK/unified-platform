const mongoose = require("mongoose");
const Notification = require("../models/Notification");
const NotificationSettings = require("../models/NotificationSettings");
const NotificationType = require("../models/NotificationType");

exports.createNotification = async (req, res) => {
  const { recipient_id, noti_type_id, related_entity_id, message } = req.body;

  try {
    if (!recipient_id || !notification_type_id || !message) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const recipient = await Employee.findById(recipient_id);
    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    const notificationType = await NotificationType.findById(noti_type_id);
    if (!notificationType) {
      return res.status(404).json({ message: "Notification type not found" });
    }

    const settings = await NotificationSettings.findOne({
      emp_id: recipient_id,
      noti_type_id,
    });

    if (settings && !settings.preference) {
      return res.status(200).json({ message: "Notification is disabled for this recipient." });
    }

    const notification = await Notification.create({
      recipient_id,
      noti_type_id,
      related_entity_id,
      message,
    });

    res.status(201).json({
      message: "Notification created successfully",
      notification,
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getNotificationsForEmployee = async (req, res) => {
  const { id } = req.user;

  try {
    const notifications = await Notification.find({ recipient_id: id })
      .populate("noti_type_id", "type_name description")
      .sort({ notification_date: -1 });

    res.status(200).json({
      notifications,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Server error" });
  }
};  

exports.markNotificationAsRead = async (req, res) => {
  const { notification_id } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(notification_id)) {
      return res.status(400).json({ message: "Invalid notification ID" });
    }

    const notification = await Notification.findByIdAndUpdate(
      notification_id,
      { status: "Read" },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateNotificationPreference = async (req, res) => {
  const { noti_type_id, preference } = req.body;
  const { id } = req.user;

  try {
    if (!noti_type_id || typeof preference !== "boolean") {
      return res.status(400).json({ message: "Invalid request. Missing or incorrect fields." });
    }

    const notificationType = await NotificationType.findById(noti_type_id);
    if (!notificationType) {
      return res.status(404).json({ message: "Notification type not found" });
    }

    const setting = await NotificationSettings.findOneAndUpdate(
      { emp_id: id, noti_type_id },
      { preference },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      message: "Notification preference updated successfully",
      setting,
    });
  } catch (error) {
    console.error("Error updating notification preference:", error);
    res.status(500).json({ message: "Server error" });
  }
};  