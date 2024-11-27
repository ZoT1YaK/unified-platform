const jwt = require("jsonwebtoken");
const Employee = require("../models/Employee");
const Department = require("../models/Department");

exports.loginEmployee = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find employee and populate references
    const employee = await Employee.findOne({ email });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Verify password
    const isMatch = await employee.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: employee._id, is_people_leader: employee.is_people_leader },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Send response
    res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error("Error in loginEmployee:", error.stack);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getProfile = async (req, res) => {
  const { id } = req.user;

  try {
    const employee = await Employee.findById(id)
      .populate("dep_id", "number name");

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.status(200).json({
      profile: {
        id: employee._id,
        email: employee.email,
        f_name: employee.f_name,
        l_name: employee.l_name,
        position: employee.position,
        language: employee.language,
        department: employee.dep_id
          ? { number: employee.dep_id.number, name: employee.dep_id.name }
          : null,
      },
    });
  } catch (error) {
    console.error("Error fetching profile:", error.stack);
    res.status(500).json({ message: "Internal server error" });
  }
};