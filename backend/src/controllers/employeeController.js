const jwt = require("jsonwebtoken");
const Employee = require("../models/Employee");
const Department = require("../models/Department");

exports.loginEmployee = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const employee = await Employee.findOne({ email }).populate("dep_id", "number name");

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const isMatch = await employee.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: employee._id, is_people_leader: employee.is_people_leader },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Sanitize sensitive fields
    const sanitizedEmployee = {
      _id: employee._id,
      email: employee.email,
      f_name: employee.f_name,
      l_name: employee.l_name,
      position: employee.position,
      hire_date: employee.hire_date,
      location: employee.location,
      is_admin: employee.is_admin,
      is_people_leader: employee.is_people_leader,
      preferred_language: employee.preferred_language,
      dep_id: employee.dep_id ? { number: employee.dep_id.number, name: employee.dep_id.name } : null,
      people_leader_id: employee.people_leader_id,
    };

    res.status(200).json({
      message: "Login successful",
      token,
      employee: sanitizedEmployee,
    });
  } catch (error) {
    console.error("Error logging in employee:", error);
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
        location: employee.location,
        data_mind_type: employee.data_mind_type,
        department: employee.dep_id
          ? { number: employee.dep_id.number, name: employee.dep_id.name }
          : null,
      },
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateLanguage = async (req, res) => {
  const { id } = req.user;
  const { language } = req.body;

  try {
    const employee = await Employee.findByIdAndUpdate(
      { _id: id },
      { preferred_language: language},
      { new: true }
    );

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.status(200).json({ message: "Language updated successfully", language });
  } catch (error) {
    console.error("Error updating language:", error);
    res.status(500).json({ message: "Server error" });
  }
};
exports.getAllEmployees = async (req, res) => {
  try {
      const employees = await Employee.find({}, "f_name l_name email position");
      res.status(200).json({ employees });
  } catch (error) {
      console.error("Error fetching employees:", error);
      res.status(500).json({ message: "Server error" });
  }
};

exports.updateDatamindType = async (req, res) => {
  const { data_mind_type } = req.body;
  const { id } = req.user;

  try {
    if (!data_mind_type) {
      return res.status(400).json({ message: "Data mind type is required." });
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(
      { _id: id },
      { data_mind_type },
      { new: true }
    );

    if (!updatedEmployee) {
      return res.status(404).json({ message: "Employee not found." });
    }

    res.status(200).json({
      message: "Data mind type updated successfully.",
      data_mind_type
    });
  } catch (error) {
    console.error("Error updating data mind type:", error);
    res.status(500).json({ message: "Server error" });
  }
};
