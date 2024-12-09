const cron = require("node-cron");
const MetricsController = require('../controllers/metricsController');

cron.schedule("0 0 * * *", async () => { // Every day at midnight
  console.log("Updating daily metrics snapshots...");
  await MetricsController.updateDailyMetricsSnapshot();
  console.log("Daily metrics snapshots updated.");
});

module.exports = {};