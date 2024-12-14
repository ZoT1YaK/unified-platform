const mongoose = require("mongoose");
const Milestone = require("../models/Milestone");

exports.getMilestonesByEmployee = async (req, res) => {
  const { id: loggedInId } = req.user; 
  const { emp_id } = req.query; 
  const targetId = mongoose.Types.ObjectId.isValid(emp_id) ? emp_id : loggedInId;

  try {
    if (!targetId) {
      return res.status(400).json({ message: "Invalid or missing emp_id" });
    }

    const milestones = await Milestone.find({
      emp_id: targetId,
    }).sort({ date_unlocked: -1 });

    res.status(200).json({ milestones });
  } catch (error) {
    console.error("Error fetching milestones:", error);
    res.status(500).json({ message: "Server error" });
  }
};


exports.updateMilestoneVisibility = async (req, res) => {
  const { milestone_id, visibility } = req.body;
  const { id } = req.user;

  try {
    if (!mongoose.Types.ObjectId.isValid(milestone_id)) {
      return res.status(400).json({ message: "Invalid milestone ID" });
    }

    const milestone = await Milestone.findOneAndUpdate(
      { _id: milestone_id, emp_id: id },
      { visibility },
      { new: true }
    );

    if (!milestone) {
      return res.status(404).json({ message: "Milestone not found or not authorized to update" });
    }

    res.status(200).json({
      message: "Milestone visibility updated successfully",
      milestone,
    });
  } catch (error) {
    console.error("Error updating milestone visibility:", error);
    res.status(500).json({ message: "Server error" });
  }
};
