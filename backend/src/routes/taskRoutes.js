const express = require("express");
const taskController = require("../controllers/taskController");
const { verifyToken, verifyPeopleLeader } = require("../middleware/authMiddleware");

const router = express.Router();

// Task creation
router.post("/create", verifyToken, taskController.createTask);

// Get tasks assigned to an employee and self-created tasks
router.get("/employee", verifyToken, taskController.getEmployeeTasks);

// Get tasks assigned by the people leader
router.get("/leader", verifyToken, taskController.getLeaderAssignedTasks);

// Mark a task as completed
router.put("/complete", verifyToken, taskController.completeTask);

// Edit a task assigned by the people leader
router.put("/edit-assigned", verifyToken, verifyPeopleLeader, taskController.editAssignedTask);

// Edit a self-created task
router.put("/edit-own", verifyToken, taskController.editOwnCreatedTask);

// Delete a self-created task
router.delete("/delete", verifyToken, taskController.deleteTask);

module.exports = router;