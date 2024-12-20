const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const { verifyToken, verifyPeopleLeader } = require("../middleware/authMiddleware");

// Create an event
router.post("/create", verifyToken, verifyPeopleLeader, eventController.createEvent);

// Get targeted events
router.get("/get", verifyToken, eventController.getEventsForEmployee);

// Update the response of an employee to an event invitation
router.put("/response", verifyToken, eventController.updateEventResponse);

// Get all resources for event creation
router.get("/resources", verifyToken, eventController.getEventResources);

// Delete an event
router.delete("/delete/:eventId", verifyToken, verifyPeopleLeader, eventController.deleteEvent);

module.exports = router;
