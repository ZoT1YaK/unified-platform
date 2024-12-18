const express = require("express");
const router = express.Router();
const metricsController = require("../controllers/metricsController");
const { verifyToken, verifyPeopleLeader } = require("../middleware/authMiddleware");

// Generate metrics report
router.post("/report", verifyToken, verifyPeopleLeader, metricsController.generateManualMetricsReport);

// Get reports by date filter
router.get("/reports", verifyToken, verifyPeopleLeader, metricsController.getReportsByDate);

// Download a metrics report
router.get("/report/download/:report_id", verifyToken, metricsController.downloadMetricsReport);

// Get employees metrics by People Leader
router.get("/metrics", verifyToken, verifyPeopleLeader, metricsController.getMetricsByPeopleLeader);

// Get task metrics for tasks assigned by the leader
router.get("/team-tasks", verifyToken, verifyPeopleLeader, metricsController.getTeamTasksMetrics);

// Get event participation metrics
router.get("/team-events", verifyToken, verifyPeopleLeader, metricsController.getTeamEventMetrics);

module.exports = router;