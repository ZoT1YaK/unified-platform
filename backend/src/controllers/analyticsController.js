const Achievement = require("../models/Achievement")
const Milestone = require("../models/Milestone");
const Post = require("../models/Post");

exports.getEmployeeAnalytics = async (req, res) => {
  const { id } = req.user; // Assume `id` is from the verified JWT token

  try {
     // Count achievements
     const achievementsCount = await Achievement.countDocuments({ emp_id: id });

    // Count posts
    const postsCount = await Post.countDocuments({ emp_id: id });

    // Count milestones
    const milestonesCount = await Milestone.countDocuments({ emp_id: id });

    res.status(200).json({
      achievementsCount,
      postsCount,
      milestonesCount,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ message: "Server error" });
  }
};
