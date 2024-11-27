const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const Employee = require("../models/Employee");
const Department = require("../models/Department");
const Team = require("../models/Team");
const TeamEmployee = require("../models/TeamEmployee");
const Location = require("../models/Location");

const seedData = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Clearing existing data...");

    await Employee.deleteMany({});
    await Location.deleteMany({});
    await Department.deleteMany({});
    await Team.deleteMany({});
    await TeamEmployee.deleteMany({});
    

    console.log("Seeding departments...");

    const engineeringDepartment = await Department.create({
      number: "101",
      name: "Engineering",
    });

    console.log("Adding location for the department...");
    const location = await Location.create({
      dep_num: engineeringDepartment._id,
      country: "Denmark",
      city: "Aarhus",
      zip: "8000",
      street: "Example 123",
    });

    console.log("Seeding employees...");

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
    });

    // Create the employee who reports to the people leader
    const employee = await Employee.create({
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

    console.log("Seeding teams...");

    const teamAlpha = await Team.create({ name: "Alpha Team" });

    console.log("Assigning employees to teams...");

    await TeamEmployee.create({ team_id: teamAlpha._id, emp_id: peopleLeader._id });
    await TeamEmployee.create({ team_id: teamAlpha._id, emp_id: employee._id });

    console.log("Database seeded successfully.");
    process.exit();
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedData();