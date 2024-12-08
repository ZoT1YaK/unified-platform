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
  const { task_id } = req.body;
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

    if (task.status === "Completed") {
      return res.status(400).json({ message: "Task is already completed." });
    }

    task.status = "Completed";
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
const handleSaveTask = async (e) => {
  e.preventDefault();

  // Map the form data to the backend payload structure
  const badge_id = availableBadges.find((b) => b.name === formData.badge)?._id || null;
  const assigned_to_id = availableEmployees.find((emp) => emp.email === formData.assignedTo)?._id || null;

  // Prepare the updated task payload
  const updatedTask = {
      task_id: editingTask._id, // Ensure task_id is explicitly sent
      title: formData.title,
      description: formData.description,
      deadline: formData.deadline || null,
      badge_id: badge_id || null, // Include null if no badge is selected
      assigned_to_id: assigned_to_id || null, // Include null if no employee is selected
  };

  try {
      setLoading(true);

      // Log the payload for debugging
      console.log("Payload being sent to /edit-assigned:", updatedTask);

      // Send the update to the backend
      const response = await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/tasks/edit-assigned`, updatedTask, {
          headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
      });

      // Handle successful update
      alert("Task updated successfully!");
      console.log("Response from backend:", response.data);

      // Close the edit modal
      closeEditModal();

      // Refresh the tasks list
      const tasksRes = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/tasks/leader`, {
          headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
      });
      setTasks(tasksRes.data.tasks || []);
  } catch (err) {
      console.error("Error updating task:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to update task. Please try again.");
  } finally {
      setLoading(false);
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