const express = require("express");
const notificationController = require("../controllers/notificationController");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

// Get notifications for an employee
router.get("/get", verifyToken, notificationController.getNotificationsForEmployee);

// Mark a notification as read
router.put("/read", verifyToken, notificationController.markNotificationAsRead);

// Get notification preferences for an employee
router.get("/preferences", verifyToken, notificationController.getNotificationPreferences);

// Update notification preferences
router.put("/preferences", verifyToken, notificationController.updateNotificationPreference);

module.exports = router;