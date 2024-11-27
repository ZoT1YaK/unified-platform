const express = require("express");
const { loginEmployee, getProfile } = require("../controllers/employeeController");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

// Login route
router.post("/login", loginEmployee);

// Profile route
router.get("/profile", verifyToken, getProfile);

module.exports = router;