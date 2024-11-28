const express = require("express");
const { getTeamsByEmployee, getTeamMembers } = require("../controllers/teamController");
const { verifyToken, verifyPeopleLeader } = require("../middleware/authMiddleware");

const router = express.Router();

// People Leader: View managed teams
router.get("/get-teams", verifyToken, verifyPeopleLeader, getTeamsByEmployee);

// View team members
router.get("/get-members", verifyToken, getTeamMembers);

module.exports = router;