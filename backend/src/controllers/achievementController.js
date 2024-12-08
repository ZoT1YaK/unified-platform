const mongoose = require("mongoose");
const Achievement = require("../models/Achievement");
const Badge = require("../models/Badge");
const Task = require("../models/Task");

exports.getAchievementsByEmployee = async (req, res) => {
  const { id } = req.user;
  
  try {
    const achievements = await Achievement.find({ emp_id: id })
      .populate("badge_id", "name description img_link")
      .populate("task_id", "title description")
      .sort({ achievement_date: -1 });
  
    res.status(200).json({ achievements });
  } catch (error) {
    console.error("Error fetching achievements:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateAchievementVisibility = async (req, res) => {
  const { achievement_id, visibility } = req.body;
  const { id } = req.user;

  try {
    if (!mongoose.Types.ObjectId.isValid(achievement_id)) {
      return res.status(400).json({ message: "Invalid achievement ID" });
    }

    const achievement = await Achievement.findOneAndUpdate(
      { _id: achievement_id, emp_id: id },
      { visibility },
      { new: true }
    );

    if (!achievement) {
      return res.status(404).json({ message: "Achievement not found or not authorized to update" });
    }

    res.status(200).json({
      message: "Achievement visibility updated successfully",
      achievement,
    });
  } catch (error) {
    console.error("Error updating achievement visibility:", error);
    res.status(500).json({ message: "Server error" });
  }
};