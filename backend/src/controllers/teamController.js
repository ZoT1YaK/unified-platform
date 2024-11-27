const TeamEmployee = require("../models/TeamEmployee");
const Team = require("../models/Team");

exports.getTeamsByEmployee = async (req, res) => {
  const { id } = req.user;

  try {
    const teams = await TeamEmployee.find({ emp_id: id }).populate("team_id", "name");

    res.status(200).json({
      teams: teams.map((team) => ({
        id: team.team_id._id,
        name: team.team_id.name,
      })),
    });
  } catch (error) {
    console.error("Error fetching teams:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};