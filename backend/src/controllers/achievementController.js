const mongoose = require("mongoose");
const Achievement = require("../models/Achievement");
const Badge = require("../models/Badge");
const Task = require("../models/Task");
const Event = require("../models/Event")

/**
 * @desc    Fetch achievements for an employee.
 *          If emp_id is provided in query params, fetch achievements for that employee.
 *          If emp_id is not provided, fetch achievements for the logged-in user.
 *          - Own profile: fetch all achievements.
 *          - Other profiles: fetch only visible achievements.
 * @route   GET /api/achievements/get?emp_id=<employee_id>
 * @access  Private (Requires token validation)
 */
exports.getAchievementsByEmployee = async (req, res) => {
  const { id: loggedInId } = req.user;
  const { emp_id } = req.query; // Fetch specific employee's achievements if provided
  const targetId = mongoose.Types.ObjectId.isValid(emp_id) ? emp_id : loggedInId; // Fallback to logged-in user's ID

  try {

    let achievements;
    if (loggedInId === targetId) {
      // If viewing own profile, fetch all achievements
      achievements = await Achievement.find({ emp_id: targetId })
        .populate("badge_id", "name description img_link")
        .populate("related_entity_id", "title description")
        .sort({ achievement_date: -1 });
    } else {
      // If visiting another profile, fetch only visible achievements
      achievements = await Achievement.find({ emp_id: targetId, visibility: true })
        .populate("badge_id", "name description img_link")
        .populate("related_entity_id", "title description")
        .sort({ achievement_date: -1 });
    }
    res.status(200).json({ achievements });
  } catch (error) {
    console.error("Error fetching achievements:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Update the visibility of an achievement.
 *          - Only the owner of the achievement can update its visibility.
 * @route   PUT /api/achievements/visibility
 * @access  Private (Requires token validation)
 */
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