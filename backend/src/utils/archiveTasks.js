const cron = require("node-cron");
const Task = require("../models/Task");

// Run every hour to archive tasks completed for more than 24 hours
cron.schedule("0 * * * *", async () => {
  try {
    const addArchivedFieldResult = await Task.updateMany(
      { archived: { $exists: false } }, 
      { $set: { archived: false } }    
    );
    console.log(`${addArchivedFieldResult.modifiedCount} tasks updated with 'archived' field.`);

    const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000); 
    const archiveTasksResult = await Task.updateMany(
      { status: "Completed", completion_date: { $lte: cutoffDate }, archived: false },
      { $set: { archived: true } } 
    );
    console.log(`${archiveTasksResult.modifiedCount} tasks archived.`);
  } catch (error) {
    console.error("Error in cron job for archiving tasks:", error);
  }
});
