const cron = require("node-cron");
const MetricsController = require("../controllers/metricsController");

cron.schedule("0 0 1 * *", async () => { // Run at midnight on the 1st day of each month
  console.log("Starting monthly Power BI report generation...");
  await MetricsController.generateMonthlyPowerBIReport();
});