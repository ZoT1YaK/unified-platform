const express = require("express");
const employeeController = require("../controllers/employeeController");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

// Login route
router.post("/login", employeeController.loginEmployee);

// Profile route
router.get("/profile", verifyToken, employeeController.getProfile);

// Update preffered language
router.put("/language", verifyToken, employeeController.updateLanguage);

module.exports = router;