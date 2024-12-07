const express = require("express");
const { verifyToken } = require("../middleware/authMiddleware");
const { getEmployeeAnalytics } = require("../controllers/analyticsController");

const router = express.Router();

router.get("/analytics", verifyToken, getEmployeeAnalytics);

module.exports = router;
