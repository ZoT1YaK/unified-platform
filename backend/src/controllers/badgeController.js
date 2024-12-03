const Badge = require("../models/Badge");
const Employee = require("../models/Employee");

exports.createBadge = async (req, res) => {
  const { name, description, img_link } = req.body;
  const { id: adminId } = req.user;

  try {
    const admin = await Employee.findById(adminId);
    if (!admin || !admin.is_admin) {
      return res.status(403).json({ message: "You are not authorized to create badges." });
    }

    const badge = await Badge.create({
      created_by_id: adminId,
      name,
      description,
      img_link,
    });

    res.status(201).json({
      message: "Badge created successfully",
      badge,
    });
  } catch (error) {
    console.error("Error creating badge:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllBadges = async (req, res) => {
  try {
    const badges = await Badge.find().populate("created_by_id", "f_name l_name email");
    res.status(200).json({ badges });
  } catch (error) {
    console.error("Error fetching badges:", error);
    res.status(500).json({ message: "Server error" });
  }
};