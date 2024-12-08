const express = require("express");
const router = express.Router();
const metricsController = require("../controllers/metricsController");
const { verifyToken } = require("../middleware/authMiddleware");

// Calculate metrics dynamically
router.get("/calculate", verifyToken, metricsController.calculateMetrics);

// Save metrics snapshot
router.post("/snapshot", verifyToken, metricsController.saveMetricsSnapshot);

// Generate metrics report
router.post("/report", verifyToken, metricsController.generateMetricsReport);

// Download a metrics report
router.get("/report/download/:report_id", verifyToken, metricsController.downloadMetricsReport);

module.exports = router;