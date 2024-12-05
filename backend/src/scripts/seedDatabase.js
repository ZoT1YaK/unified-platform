const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const Employee = require("../models/Employee");
const Department = require("../models/Department");
const Team = require("../models/Team");
const TeamEmployee = require("../models/TeamEmployee");
const Location = require("../models/Location");
const NotificationType = require("../models/NotificationType");
const NotificationSettings = require("../models/NotificationSettings");
const Badge = require("../models/Badge");

const seedData = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Seeding departments...");
    const engineeringDepartment = await Department.create({
      number: "101",
      name: "Engineering",
    });

    console.log("Adding location for the department...");
    const location = await Location.create({
      dep_id: engineeringDepartment._id,
      country: "Denmark",
      city: "Aarhus",
      zip: "8000",
      street: "Example 123",
    });

    console.log("Seeding employees...");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(process.env.DEFAULT_EMPLOYEE_PASSWORD, salt);

    const peopleLeader = await Employee.create({
      email: "leader@example.com",
      password: hashedPassword,
      f_name: "Leader",
      l_name: "One",
      position: "Manager",
      hire_date: new Date("2020-01-01"),
      is_admin: true,
      is_people_leader: true,
      dep_id: engineeringDepartment._id,
      location: "Denmark",
    });

    const employee = await Employee.create({
      email: "employee@example.com",
      password: hashedPassword,
      f_name: "Employee",
      l_name: "Two",
      position: "Developer",
      hire_date: new Date("2021-01-01"),
      is_people_leader: false,
      dep_id: engineeringDepartment._id,
      people_leader_id: peopleLeader._id,
      location: "Poland",
    });

    console.log("Seeding teams...");
    const teamAlpha = await Team.create({ name: "Alpha Team" });

    console.log("Assigning employees to teams...");
    await TeamEmployee.create({ team_id: teamAlpha._id, emp_id: peopleLeader._id });
    await TeamEmployee.create({ team_id: teamAlpha._id, emp_id: employee._id });

    console.log("Seeding notification types...");
    const types = [
      { type_name: "Comment on Post", description: "Notification for comments on posts" },
      { type_name: "Task Assignment", description: "Notification for task assignments" },
      { type_name: "Report Available", description: "Notification for available reports" },
      { type_name: "Milestone Reminder", description: "Notification for employee milestones" },
      { type_name: "Congratulatory Post", description: "Notification for congratulatory posts" },
    ];
    const notificationTypes = await NotificationType.insertMany(types);

    console.log("Seeding notification settings...");
    const defaultSettings = [];

    [peopleLeader, employee].forEach((emp) => {
      notificationTypes.forEach((type) => {
        defaultSettings.push({
          emp_id: emp._id,
          noti_type_id: type._id,
          preference: true, 
        });
      });
    });

    await NotificationSettings.insertMany(defaultSettings);

    console.log("Seeding badges...");
    await Badge.create([
      {
        created_by_id: peopleLeader._id,
        name: "Employee of the Month",
        description: "Awarded to the most outstanding employee of the month.",
        img_link: "https://example.com/badge1.png",
      },
      {
        created_by_id: peopleLeader._id,
        name: "Team Player",
        description: "Recognizing exceptional teamwork and collaboration.",
        img_link: "https://example.com/badge2.png",
      },
    ]);

    console.log("Database seeded successfully.");
    process.exit();
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedData();