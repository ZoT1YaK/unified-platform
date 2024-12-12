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

// Get all employees
router.get("/all", verifyToken, employeeController.getAllEmployees);

// Update data mind type for employee
router.put("/data-mind-type", verifyToken, employeeController.updateEmployeeDatamind);

// Get employee data mind type
router.get("/get-data-mind-type", verifyToken, employeeController.getEmployeeDatamind);

module.exports = router;

