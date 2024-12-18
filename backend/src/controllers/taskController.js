const mongoose = require("mongoose");
const Task = require("../models/Task");
const Badge = require("../models/Badge");
const NotificationType = require("../models/NotificationType");
const Achievement = require("../models/Achievement");
const NotificationController = require("./notificationController");

/**
 * @desc    Create a new task.
 *          - Tasks can be "Self-Created" (no badge) or "Leader-Assigned" (with optional badges).
 *          - Sends a notification if the task is assigned to an employee.
 * @route   POST /api/tasks/create
 * @access  Private (Requires token validation)
 */
exports.createTask = async (req, res) => {
  const { title, deadline, type, description, assigned_to_id, badge_id } = req.body;
  const { id } = req.user;

  try {
    if (!title || !type) {
      return res.status(400).json({ message: "Title and type are required." });
    }
    if (type === "Self-Created" && badge_id) {
      return res.status(400).json({ message: "Self-created tasks cannot have badges." });
    }
  
    const task = await Task.create({
      created_by_id: id,
      assigned_to_id,
      badge_id: type === "Leader-Assigned" ? badge_id : null,
      title,
      deadline,
      type,
      description,
    });

    if (assigned_to_id) {
      const notificationType = await NotificationType.findOne({ type_name: "Task Assignment" });
      if (!notificationType) {
        return res.status(404).json({ message: "Notification type not found" });
      }

      await NotificationController.createNotification({
        recipient_id: assigned_to_id,
        noti_type_id: notificationType._id,
        related_entity_id: task._id,
        message: `You have been assigned a task: ${title}`,
      });
    }

    res.status(201).json({ message: "Task created successfully", task });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Fetch tasks assigned to the logged-in employee and their self-created tasks.
 *          - Supports filtering by status and search query.
 * @route   GET /api/tasks/employee
 * @access  Private (Requires token validation)
 */
exports.getEmployeeTasks = async (req, res) => {
  const { id } = req.user;
  const { search } = req.query;

  try {
    const now = new Date();
    const cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); 

    const assignedQuery = {
      assigned_to_id: id,
      $or: [
        { archived: search ? undefined : false }, 
        { status: "Pending" }, 
        {
          status: "Completed",
          completion_date: { $gte: cutoffDate }, 
        }
      ],
    };

   
    const ownQuery = {
      created_by_id: id,
      assigned_to_id: null, 
      $or: [
        { archived: search ? undefined : false },
        { status: "Pending" },
        {
          status: "Completed",
          completion_date: { $gte: cutoffDate },
        },
      ],
    };

    if (search) {
      const searchFilter = { title: { $regex: search, $options: "i" } }; 
      assignedQuery.$or.push(searchFilter);
      ownQuery.$or.push(searchFilter);
    }

    const assignedTasks = await Task.find(assignedQuery).sort({ deadline: 1 }).lean();
    const ownTasks = await Task.find(ownQuery).sort({ deadline: 1 }).lean();

    const tasks = [...assignedTasks, ...ownTasks];

    res.status(200).json({ tasks });
  } catch (error) {
    console.error("Error fetching employee tasks:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Fetch tasks assigned by the People Leader to their employees.
 * @route   GET /api/tasks/leader
 * @access  Private (People Leaders only)
 */
exports.getLeaderAssignedTasks = async (req, res) => {
  const { id } = req.user;

  try {
    const tasks = await Task.find({ created_by_id: id, assigned_to_id: { $ne: null } })
      .populate("assigned_to_id", "f_name l_name position");

    res.status(200).json({ tasks });
  } catch (error) {
    console.error("Error fetching leader-assigned tasks:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Mark a task as completed or pending.
 *          - Updates completion date and handles badge-related achievements.
 * @route   PUT /api/tasks/complete
 * @access  Private (Requires token validation)
 */
exports.completeTask = async (req, res) => {
  const { task_id, status } = req.body;
  const { id } = req.user;

  try {
    if (!mongoose.Types.ObjectId.isValid(task_id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const task = await Task.findById(task_id);

    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    if (
      String(task.assigned_to_id) !== String(id) &&
      String(task.created_by_id) !== String(id)
    ) {
      return res.status(403).json({ message: "Unauthorized to complete this task." });
    }

    task.status = status;
    if (status === "Completed") {
      task.completion_date = new Date();
    } else {
      task.completion_date = null;
    }
    await task.save();

    // If task is marked as completed and has a badge, create an achievement
    if (task.badge_id) {
      if (status === "Completed") {
          // Add badge as an achievement
          const achievementExists = await Achievement.findOne({
              emp_id: id,
              badge_id: task.badge_id,
          });

          if (!achievementExists) {
              await Achievement.create({
                  emp_id: id,
                  badge_id: task.badge_id,
                  related_entity_id: task._id,
                  created_at: new Date(),
              });
          }
      } else if (status === "Pending") {
          // Revoke the badge if status is reverted to "Pending"
          await Achievement.findOneAndDelete({
              emp_id: id,
              badge_id: task.badge_id,
              related_entity_id: task._id,
          });
      }
  }
    res.status(200).json({ message: "Task marked as completed.", task });
  } catch (error) {
    console.error("Error completing task:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Edit a task assigned by a People Leader.
 *          - Allows updates to title, deadline, description, badge, and assignee.
 * @route   PUT /api/tasks/edit-assigned
 * @access  Private (People Leaders only)
 */
exports.editAssignedTask = async (req, res) => {
  const { task_id, title, deadline, description, badge_id, assigned_to_id } = req.body; // Include assigned_to_id if relevant
  const { id } = req.user;

  try {
    // Validate task_id
    if (!mongoose.Types.ObjectId.isValid(task_id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    // Find the task with the provided ID that was created by the leader
    const task = await Task.findOne({ _id: task_id, created_by_id: id, assigned_to_id: { $ne: null } });

    if (!task) {
      return res.status(404).json({ message: "Task not found or not authorized to edit" });
    }

    // Update fields if they are provided
    if (title !== undefined) task.title = title;
    if (deadline !== undefined) task.deadline = deadline;
    if (description !== undefined) task.description = description;
    if (badge_id !== undefined) task.badge_id = badge_id;
    if (assigned_to_id !== undefined) task.assigned_to_id = assigned_to_id;

    // Save the updated task
    const updatedTask = await task.save();

    res.status(200).json({
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.error("Error editing assigned task:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Edit a self-created task by the logged-in employee.
 *          - Allows updates to title, deadline, and description.
 * @route   PUT /api/tasks/edit-own
 * @access  Private (Requires token validation)
 */
exports.editOwnCreatedTask = async (req, res) => {
  const { task_id, title, deadline, description } = req.body;
  const { id } = req.user;

  try {
    if (!mongoose.Types.ObjectId.isValid(task_id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const task = await Task.findOne({ _id: task_id, created_by_id: id, assigned_to_id: null });

    if (!task) {
      return res.status(404).json({ message: "Task not found or not authorized to edit" });
    }

    if (title !== undefined) task.title = title;
    if (deadline !== undefined) task.deadline = deadline;
    if (description !== undefined) task.description = description;

    const updatedTask = await task.save();

    res.status(200).json({
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.error("Error editing self-created task:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Delete a self-created task.
 * @route   DELETE /api/tasks/delete
 * @access  Private (Requires token validation)
 */
exports.deleteTask = async (req, res) => {
  const { task_id } = req.body;
  const { id } = req.user;

  try {
    if (!mongoose.Types.ObjectId.isValid(task_id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const task = await Task.findOneAndDelete({ _id: task_id, created_by_id: id });

    if (!task) {
      return res.status(404).json({ message: "Task not found or not authorized to delete" });
    }

    res.status(200).json({ message: "Task deleted successfully", task });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ message: "Server error" });
  }
};