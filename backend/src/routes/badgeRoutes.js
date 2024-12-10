const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const upload = require("../middleware/upload");
const badgeController = require("../controllers/badgeController");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

// Create a new badge (Admin only)
router.post("/create", verifyToken, badgeController.createBadge);

// Get all badges
router.get("/get", verifyToken, badgeController.getAllBadges);

// Upload badges
router.post("/upload", verifyToken, upload.single("file"), badgeController.uploadBadges);

// Route to clear all badges (only accessible to admins)
router.delete("/clear-badges", verifyToken, badgeController.clearBadges);
module.exports = router;
