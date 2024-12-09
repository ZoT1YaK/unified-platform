const express = require("express");
const router = express.Router();
const metricsController = require("../controllers/metricsController");
const { verifyToken } = require("../middleware/authMiddleware");

// Generate metrics report
router.post("/report", verifyToken, metricsController.generateManualMetricsReport);

// Download a metrics report
router.get("/report/download/:report_id", verifyToken, metricsController.downloadMetricsReport);

// Generate metrics report (PowerBI)
router.post("/report/power_bi", verifyToken, metricsController.generateManualPowerBIReport);

// Download a metrics report (PowerBI)
router.get("/report/power_bi/download/:report_path", metricsController.downloadPowerBIReport);

module.exports = router;