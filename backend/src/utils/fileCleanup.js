const cron = require('node-cron');
const fs = require("fs");
const path = require("path");

cron.schedule('0 0 1 * *', () => { // Runs at midnight on the 1st day of every month
  console.log("Cleaning old reports...");

  const reportsDir = path.resolve(__dirname, '../reports');
  const now = Date.now();

  fs.readdir(reportsDir, (err, files) => {
    if (err) {
      console.error("Error reading reports directory:", err);
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(reportsDir, file);
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error("Error reading file stats:", err);
          return;
        }
        // Delete files older than 6 months (in milliseconds)
        const sixMonths = 6 * 30 * 24 * 60 * 60 * 1000;
        if (now - stats.ctimeMs > sixMonths) {
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error("Error deleting file:", err);
            } else {
              console.log(`Deleted old report: ${file}`);
            }
          });
        }
      });
    });
  });
});
  
module.exports = {};