const express = require("express");
const { loginEmployee } = require("../controllers/employeeController");

const router = express.Router();

// Login route
router.post("/login", loginEmployee);

module.exports = router;