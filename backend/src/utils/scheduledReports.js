const cron = require('node-cron');
const MetricsController = require('../controllers/metricsController');
const Employee = require('../models/Employee');

cron.schedule('0 0 1 * *', async () => { // Runs at midnight on the 1st day of every month
  console.log("Generating monthly metrics reports...");

  try {
    // Get all People Leaders
    const leaders = await Employee.find({ is_people_leader: true }).select("_id");

    for (const leader of leaders) {
      // Trigger the metrics report generation for each People Leader
      await MetricsController.generateMonthlyMetricsReports({ user: { id: leader._id } });
    }

    console.log("Monthly metrics reports generated successfully.");
  } catch (error) {
    console.error("Error generating monthly metrics reports:", error);
  }
});

module.exports = {};