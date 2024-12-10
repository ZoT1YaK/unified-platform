const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require('fs');
const connectDB = require("./config/db");
require("./utils/scheduledTasks");

const employeeRoutes = require("./routes/employeeRoutes");
const teamRoutes = require("./routes/teamRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const milestoneRoutes = require("./routes/milestoneRoutes");
const badgeRoutes = require("./routes/badgeRoutes");
const postRoutes = require("./routes/postRoutes");
const taskRoutes = require("./routes/taskRoutes");
const achievementRoutes = require("./routes/achievementRoutes");
const eventRoutes = require("./routes/eventRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const datamindRoutes = require("./routes/datamindRoutes");

const app = express();

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON payloads

connectDB();

// Serve Uploads storage


const uploadDir = path.join(__dirname, "src/uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log("Uploads directory ensured at:", uploadDir);
  }

app.use("/uploads", express.static(uploadDir));

// Routes
app.use("/api/employees", employeeRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/milestones", milestoneRoutes);
app.use("/api/badges", badgeRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/analytics",analyticsRoutes);
app.use("/api/datamind", datamindRoutes);


module.exports = app;