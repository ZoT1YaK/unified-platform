const express = require("express");
const milestoneController = require("../controllers/milestoneController");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

// Fetch milestones for an employee
router.get("/get", verifyToken, milestoneController.getMilestonesByEmployee);

// Update milestone visibility
router.put("/visibility", verifyToken, milestoneController.updateMilestoneVisibility);

module.exports = router;
