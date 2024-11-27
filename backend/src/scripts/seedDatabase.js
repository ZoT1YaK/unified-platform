const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Employee = require("../models/Employee");
const Department = require("../models/Department");
require("dotenv").config();

const seedData = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Clearing existing data...");
    await Employee.deleteMany({});
    await Department.deleteMany({});

    console.log("Adding new data...");

    // Create departments
    const engineeringDepartment = await Department.create({
      number: "101",
      name: "Engineering",
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(process.env.DEFAULT_EMPLOYEE_PASSWORD, salt);

    // Create the people leader
    const peopleLeader = await Employee.create({
      email: "leader@example.com",
      password: hashedPassword,
      f_name: "Leader",
      l_name: "One",
      position: "Manager",
      hire_date: new Date("2020-01-01"),
      is_people_leader: true,
      dep_num: engineeringDepartment._id,
      people_leader: null, // No one to report to
    });

    // Create the employee who reports to the people leader
    const reportingEmployee = await Employee.create({
      email: "employee@example.com",
      password: hashedPassword,
      f_name: "Employee",
      l_name: "Two",
      position: "Developer",
      hire_date: new Date("2021-01-01"),
      is_people_leader: false,
      dep_num: engineeringDepartment._id,
      people_leader: peopleLeader._id,
    });

    console.log("Employees and departments seeded successfully.");
    console.log("People Leader:", peopleLeader);
    console.log("Reporting Employee:", reportingEmployee);
    process.exit();
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedData();