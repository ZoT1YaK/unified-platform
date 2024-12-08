const express = require("express");
const achievementController = require("../controllers/achievementController");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

// Get achievements by employee
router.get("/get", verifyToken, achievementController.getAchievementsByEmployee);

// Update achievement visibility
router.put("/visibility", verifyToken, achievementController.updateAchievementVisibility);

module.exports = router;