const cron = require("node-cron");
const Event = require("../models/Event");

// Run every day at midnight
cron.schedule("0 0 * * *", async () => {
  try {
    const now = new Date();

    const addArchivedFieldResult = await Event.updateMany(
      { archived: { $exists: false } }, 
      { $set: { archived: false } }   
    );
    console.log(`${addArchivedFieldResult.modifiedCount} events updated with 'archived' field.`);

    const archivePastEventsResult = await Event.updateMany(
      { date: { $lt: now }, archived: false }, 
      { $set: { archived: true } }  
    );
    console.log(`${archivePastEventsResult.modifiedCount} past events archived successfully.`);
  } catch (error) {
    console.error("Error processing events in cron job:", error);
  }
});
