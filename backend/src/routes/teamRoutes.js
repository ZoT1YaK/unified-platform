const express = require("express");
const teamController = require("../controllers/teamController");
const { verifyToken, verifyPeopleLeader } = require("../middleware/authMiddleware");

const router = express.Router();

// People Leader: View managed teams
router.get("/get-teams", verifyToken, verifyPeopleLeader, teamController.getTeamsByEmployee);

// View team members
router.get("/get-members", verifyToken, teamController.getTeamMembers);

module.exports = router;