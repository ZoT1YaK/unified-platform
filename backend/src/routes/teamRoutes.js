const express = require("express");
const { getTeamsByEmployee } = require("../controllers/teamController");
const { verifyToken, verifyPeopleLeader } = require("../middleware/authMiddleware");

const router = express.Router();

// People Leader: View managed teams
router.get("/my-teams", verifyToken, verifyPeopleLeader, getTeamsByEmployee);

module.exports = router;