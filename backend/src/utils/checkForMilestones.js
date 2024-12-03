const Employee = require("../models/Employee");
const Milestone = require("../models/Milestone");
const NotificationController = require("../controllers/notificationController");

const milestoneDetails = {
  0.5: {
    name: "Half a year? So quickly?",
    description: "You've been with us for a whole 6 months!",
  },
  1: {
    name: "Going strong!",
    description: "You've been with us for a whole year!",
  },
  5: {
    name: "Reach your goals!",
    description: "You've been with us for a whole 5 years!",
  },
};

const checkForMilestones = async () => {
  try {
    console.log("Running milestone check...");

    const today = new Date();

    // Fetch all employees
    const employees = await Employee.find();
    console.log(`Found ${employees.length} employees.`);

    for (const employee of employees) {
      const yearsWorked =
        Math.round((today - new Date(employee.hire_date)) / (365.25 * 24 * 60 * 60 * 1000) * 2) / 2;

      console.log(`${employee.f_name} ${employee.l_name} has worked ${yearsWorked} years.`);

      // Iterate through all milestones up to the employee's years worked
      for (const [years, milestoneData] of Object.entries(milestoneDetails)) {
        const milestoneYear = parseFloat(years);

        if (milestoneYear <= yearsWorked) {
          console.log(`Checking milestone for ${milestoneYear} years.`);

          // Check if the milestone already exists
          const milestoneExists = await Milestone.findOne({
            emp_id: employee._id,
            years: milestoneYear,
          });

          if (!milestoneExists) {
            console.log(`Milestone for ${milestoneYear} years does not exist. Creating...`);

            const milestone = await Milestone.create({
              emp_id: employee._id,
              name: milestoneData.name,
              description: milestoneData.description,
              years: milestoneYear,
              date_unlocked: today,
            });

            console.log(`Milestone created: ${milestone.name}`);

            // Notify the employee
            const result = await NotificationController.createNotification({
              recipient_id: employee._id,
              noti_type_id: "674e77c3caebf33486b95707", // Replace with actual NotificationType ID
              related_entity_id: milestone._id,
              message: milestoneData.description,
            });

            console.log(`Notification result:`, result);
          } else {
            console.log(`Milestone for ${milestoneYear} years already exists.`);
          }
        }
      }
    }

    console.log("Milestone check completed.");
  } catch (error) {
    console.error("Error in milestone check:", error.message);
  }
};

module.exports = checkForMilestones;