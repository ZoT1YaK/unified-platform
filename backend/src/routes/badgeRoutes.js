const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const upload = require("../middleware/upload");
const badgeController = require("../controllers/badgeController");
const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// Create a new badge (Admin only)
router.post("/create", verifyToken, verifyAdmin, badgeController.createBadge);

// Get all badges
router.get("/get", verifyToken, badgeController.getAllBadges);

// Get active badges only
router.get("/get-active", verifyToken, badgeController.getActiveBadges); 

// Upload badges
router.post("/upload", verifyToken, verifyAdmin, upload.single("file"), badgeController.uploadBadges);

// Archive badges
router.put("/archive", verifyToken, verifyAdmin, badgeController.archiveBadges);

// Restore badges
router.put("/restore", verifyToken, verifyAdmin, badgeController.restoreBadges);


module.exports = router;
