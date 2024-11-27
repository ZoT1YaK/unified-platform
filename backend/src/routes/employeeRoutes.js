const express = require("express");
const { loginEmployee } = require("../controllers/employeeController");
const { verifyToken, verifyPeopleLeader } = require("../middleware/authMiddleware");

const router = express.Router();

// Login route
router.post("/login", loginEmployee);

// Profile route
router.get("/profile", verifyToken, getProfile);

module.exports = router;