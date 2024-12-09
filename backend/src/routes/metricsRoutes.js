const express = require("express");
const router = express.Router();
const metricsController = require("../controllers/metricsController");
const { verifyToken } = require("../middleware/authMiddleware");

// Generate metrics report
router.post("/report", verifyToken, metricsController.generateManualMetricsReport);

// Download a metrics report
router.get("/report/download/:report_id", verifyToken, metricsController.downloadMetricsReport);

module.exports = router;