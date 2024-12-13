const express = require("express");
const { verifyToken } = require("../middleware/authMiddleware");
const { getEmployeeAnalytics } = require("../controllers/analyticsController");

const router = express.Router();

router.get("/analytics/:empId", verifyToken, getEmployeeAnalytics); // With empId

router.get("/analytics", verifyToken, getEmployeeAnalytics);       // Without empId

module.exports = router;
