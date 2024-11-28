const TeamEmployee = require("../models/TeamEmployee");
const Team = require("../models/Team");

exports.getTeamsByEmployee = async (req, res) => {
  const { id } = req.user;

  try {
    const teamEmployees = await TeamEmployee.find({ emp_id: id }).populate("team_id", "name");

    if (!teamEmployees.length) {
      return res.status(404).json({ message: "No teams found for the employee" });
    }

    const teams = teamEmployees.map((te) => te.team_id);

    res.status(200).json({ teams });
  } catch (error) {
    console.error("Error fetching teams:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getTeamMembers = async (req, res) => {
  const { team_id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(team_id)) {
      return res.status(400).json({ message: "Invalid team ID" });
    }

    const teamEmployees = await TeamEmployee.find({ team_id }).populate("emp_id", "f_name l_name position email");

    if (!teamEmployees.length) {
      return res.status(404).json({ message: "No members found for the team" });
    }

    const members = teamEmployees.map((te) => te.emp_id);

    res.status(200).json({ members });
  } catch (error) {
    console.error("Error fetching team members:", error);
    res.status(500).json({ message: "Server error" });
  }
};