const mongoose = require("mongoose");
const Task = require("../models/Task");
const Badge = require("../models/Badge");
const NotificationType = require("../models/NotificationType");
const Achievement = require("../models/Achievement");
const NotificationController = require("./notificationController");

exports.createTask = async (req, res) => {
  const { title, deadline, type, description, assigned_to_id, badge_id } = req.body;
  const { id } = req.user;

  try {
    if (!title || !type) {
      return res.status(400).json({ message: "Title and type are required." });
    }

    if (badge_id) {
      const badge = await Badge.findById(badge_id);
      if (!badge) {
        return res.status(404).json({ message: "Badge not found." });
      }
    }

    const task = await Task.create({
      created_by_id: id,
      assigned_to_id,
      badge_id,
      title,
      deadline,
      type,
      description,
    });

    if (assigned_to_id) {
      const notificationType = await NotificationType.findOne({type_name: "Task Assignment"});
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

exports.getEmployeeTasks = async (req, res) => {
  const { id } = req.user;
  
  try {
    const assignedTasks = await Task.find({ assigned_to_id: id })
      .sort({ deadline: 1 });
  
    const ownTasks = await Task.find({ created_by_id: id, assigned_to_id: null });
  
    res.status(200).json({
      assignedTasks,
      ownTasks,
    });
  } catch (error) {
    console.error("Error fetching employee tasks:", error);
    res.status(500).json({ message: "Server error" });
  }
};  

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

    if (String(task.assigned_to_id) !== String(id)) {
      return res.status(403).json({ message: "Unauthorized to complete this task." });
    }


    task.status = status;
    task.completion_date = new Date();
    await task.save();

    if (task.badge_id) {
      await Achievement.create({
        emp_id: id,
        badge_id: task.badge_id,
        task_id: task._id,
      });
    }

    res.status(200).json({ message: "Task marked as completed.", task });
  } catch (error) {
    console.error("Error completing task:", error);
    res.status(500).json({ message: "Server error" });
  }    
};
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