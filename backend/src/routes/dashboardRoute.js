const express = require("express");
const verifyToken = require("../middleware/authMiddleware");
const { getDashboard } = require("../controllers/dashboardController");

const router = express.Router();

// Protected Route to dashboard
router.get("/", verifyToken, getDashboard);

module.exports = router;
