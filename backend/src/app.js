const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();
connectDB();

app.use(cors());
// Middleware
app.use(express.json());

// Routes
app.use("/api/users", require("./routes/userRoute"));
app.use("/api/dashboard", require("./routes/dashboardRoute"));

module.exports = app;
