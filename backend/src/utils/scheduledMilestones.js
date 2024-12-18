const cron = require("node-cron");
const checkForMilestones = require("./checkForMilestones");

// Schedule the milestone check to run daily at midnight
cron.schedule("0 0 * * *", async () => {
  console.log("Scheduled milestone check started...");
  await checkForMilestones();
});

module.exports = {};