const cron = require("node-cron");
const Event = require("../models/Event");

// Run every day at midnight server time
cron.schedule("0 0 * * *", async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset to local midnight

    // Add "archived" field to events where it doesn't exist
    const addArchivedFieldResult = await Event.updateMany(
      { archived: { $exists: false } },
      { $set: { archived: false } }
    );
    console.log(`${addArchivedFieldResult.modifiedCount} events updated with 'archived' field.`);

    // Archive past events
    const archivePastEventsResult = await Event.updateMany(
      { date: { $lt: today }, archived: false },
      { $set: { archived: true } }
    );
    console.log(`${archivePastEventsResult.modifiedCount} past events archived successfully.`);
  } catch (error) {
    console.error("Error processing events in cron job:", error);
  }
});
