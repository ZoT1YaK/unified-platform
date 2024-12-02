const express = require("express");
const {
  createNotification,
  getNotificationsForEmployee,
  markNotificationAsRead,
  updateNotificationPreference,
} = require("../controllers/notificationController");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

// Create a notification
router.post("/create", verifyToken, createNotification);

// Get notifications for an employee
router.get("/get", verifyToken, getNotificationsForEmployee);

// Mark a notification as read
router.put("/read", verifyToken, markNotificationAsRead);

// Update notification preferences
router.put("/preferences", verifyToken, updateNotificationPreference);

module.exports = router;
