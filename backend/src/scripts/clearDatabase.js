const mongoose = require("mongoose");
const Employee = require("../models/Employee");
const Department = require("../models/Department");
const Team = require("../models/Team");
const TeamEmployee = require("../models/TeamEmployee");
const Location = require("../models/Location");
const NotificationType = require("../models/NotificationType");
const NotificationSettings = require("../models/NotificationSettings");
const Notification = require("../models/Notification");
const Milestone = require("../models/Milestone");
const Badge = require("../models/Badge");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Like = require("../models/Like");
require("dotenv").config();

const clearDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Clearing database...");
    await Employee.deleteMany({});
    await Department.deleteMany({});
    await Team.deleteMany({});
    await TeamEmployee.deleteMany({});
    await Location.deleteMany({});
    await NotificationType.deleteMany({});
    await NotificationSettings.deleteMany({});
    await Notification.deleteMany({});
    await Milestone.deleteMany({});
    await Badge.deleteMany({});
    await Comment.deleteMany({});
    await Like.deleteMany({});
    await Post.deleteMany({});
    console.log("Database cleared.");
    process.exit();
  } catch (error) {
    console.error("Error clearing database:", error);
    process.exit(1);
  }
};

clearDatabase();
