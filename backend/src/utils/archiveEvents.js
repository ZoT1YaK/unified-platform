const cron = require("node-cron");
const Event = require("../models/Event");

// Run every day at midnight
cron.schedule("0 0 * * *", async () => {
  try {
    const now = new Date();
    await Event.updateMany({ date: { $lt: now }, archived: false }, { archived: true });
    console.log("Archived past events successfully.");
  } catch (error) {
    console.error("Error archiving past events:", error);
  }
});
