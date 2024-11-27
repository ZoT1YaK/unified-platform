const jwt = require("jsonwebtoken");
const Employee = require("../models/Employee");
const Department = require("../models/Department");

// Employee login
exports.loginEmployee = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find employee and populate references
    const employee = await Employee.findOne({ email })
      .populate("dep_num", "number name") // Populate department details
      .populate("people_leader", "f_name l_name email"); // Populate leader details

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
      { id: employee._id, position: employee.position },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Send response
    res.status(200).json({
      message: "Login successful",
      token,
      employee: {
        id: employee._id,
        email: employee.email,
        f_name: employee.f_name,
        l_name: employee.l_name,
        position: employee.position,
        department: employee.dep_num ? { number: employee.dep_num.number, name: employee.dep_num.name } : null,
        people_leader: employee.people_leader
          ? {
              id: employee.people_leader._id,
              email: employee.people_leader.email,
              name: `${employee.people_leader.f_name} ${employee.people_leader.l_name}`,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Error in loginEmployee:", error.stack);
    res.status(500).json({ message: "Server error" });
  }
};