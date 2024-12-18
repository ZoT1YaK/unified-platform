const Achievement = require("../models/Achievement")
const Milestone = require("../models/Milestone");
const Post = require("../models/Post");

/**
 * @desc    Fetch analytics for a specific employee.
 *          - Returns counts of achievements, posts, and milestones.
 *          - If empId is provided as a route parameter, fetch analytics for that employee.
 *          - If empId is not provided, fetch analytics for the logged-in user.
 * @route   GET /api/analytics/:empId?
 * @route   GET /api/analytics
 * @access  Private (Requires token validation)
 */
exports.getEmployeeAnalytics = async (req, res) => {
  const id = req.params.empId || req.user.id;
  console.log("Analytics requested for employee ID:", id);

  try {
    const achievementsCount = await Achievement.countDocuments({ emp_id: id });
    const postsCount = await Post.countDocuments({ emp_id: id });
    const milestonesCount = await Milestone.countDocuments({ emp_id: id });

    console.log({ achievementsCount, postsCount, milestonesCount }); // Log counts

    res.status(200).json({ achievementsCount, postsCount, milestonesCount });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ message: "Server error" });
  }
};

