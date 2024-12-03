const express = require("express");
const badgeController = require("../controllers/badgeController");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

// Create a new badge (Admin only)
router.post("/create", verifyToken, badgeController.createBadge);

// Get all badges
router.get("/get", verifyToken, badgeController.getAllBadges);

module.exports = router;
