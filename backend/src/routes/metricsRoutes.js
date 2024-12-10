const express = require("express");
const router = express.Router();
const metricsController = require("../controllers/metricsController");
const { verifyToken } = require("../middleware/authMiddleware");

// Generate metrics report
router.post("/report", verifyToken, metricsController.generateManualMetricsReport);

// Get reports by date filter
router.get("/reports", verifyToken, metricsController.getReportsByDate);

// Download a metrics report
router.get("/report/download/:report_id", verifyToken, metricsController.downloadMetricsReport);

// Get employees metrics by People Leader
router.get("/metrics", verifyToken, metricsController.getMetricsByPeopleLeader);

// // Generate metrics report (PowerBI)
// router.post("/report/power_bi", verifyToken, metricsController.generateManualPowerBIReport);

// // Download a metrics report (PowerBI)
// router.get("/report/power_bi/download/:report_path", metricsController.downloadPowerBIReport);

module.exports = router;