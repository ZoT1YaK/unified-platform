import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AssignedTaskList.css";

const AssignedTaskList = () => {
    const [tasks, setTasks] = useState([]);
    const [availableBadges, setAvailableBadges] = useState([]);
    const [availableEmployees, setAvailableEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState("All");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [editingTask, setEditingTask] = useState(null);
    const [hoveredTask, setHoveredTask] = useState(null);
    const [formData, setFormData] = useState({
        title: "",
        assignedTo: "",
        badge: "",
        description: "",
        deadline: "",
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch tasks, badges, and employees
                const [tasksRes, badgesRes, employeesRes] = await Promise.all([
                    axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/tasks/leader`, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }),
                    axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/badges/get`, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }),
                    axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/employees/all`, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }),
                ]);

                setTasks(tasksRes.data.tasks || []);
                setAvailableBadges(badgesRes.data.badges || []);
                setAvailableEmployees(employeesRes.data.employees || []);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to fetch data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Handle employee selection
    const handleEmployeeChange = (e) => {
        setSelectedEmployee(e.target.value);
    };

    // Filter tasks based on selected employee and search query
    const filteredTasks = tasks.filter((task) => {
        const matchesEmployee =
            selectedEmployee === "All" || task.assigned_to_id?._id === selectedEmployee;
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesEmployee && matchesSearch;
    });


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const openEditModal = (task) => {
        setEditingTask(task);
        setFormData({
            title: task.title,
            assignedTo: task.assigned_to_id?.email || "",
            badge: availableBadges.find((b) => b._id === task.badge_id)?.name || "",
            description: task.description || "",
            deadline: task.deadline ? task.deadline.split("T")[0] : "",
        });
    };

    const closeEditModal = () => {
        setEditingTask(null);
        setFormData({
            title: "",
            assignedTo: "",
            badge: "",
            description: "",
            deadline: "",
        });
    };

    const handleSaveTask = async (e) => {
        e.preventDefault();

        // Map the form data to the backend payload structure
        const badge_id = availableBadges.find((b) => b.name === formData.badge)?._id || null;

        // Prepare the updated task payload
        const updatedTask = {
            task_id: editingTask._id, // Ensure task_id is explicitly sent
            title: formData.title,
            description: formData.description,
            deadline: formData.deadline || null,
            badge_id: badge_id || null, // Include null if no badge is selected
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

    const handleDeleteTask = async (task) => {
        if (!window.confirm(`Are you sure you want to delete the task "${task.title}"?`)) {
            return; // Exit if user cancels
        }

        try {
            setLoading(true);

            // Call the delete API
            await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/tasks/delete`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                data: { task_id: task._id }, // Axios requires `data` field for DELETE body
            });

            alert("Task deleted successfully!");

            // Refresh the task list
            const tasksRes = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/tasks/leader`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            setTasks(tasksRes.data.tasks || []);
        } catch (err) {
            console.error("Error deleting task:", err.response?.data || err.message);
            setError(err.response?.data?.message || "Failed to delete task. Please try again.");
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="assigned-task-list-container">
            <h3 className="assigned-task-list-title">Assigned Tasks</h3>
            <div className="assigned-task-controls">
                {/* Employee Dropdown */}
                <select
                    className="assigned-task-employee-filter"
                    value={selectedEmployee}
                    onChange={handleEmployeeChange}
                >
                    <option value="All">All Employees</option>
                    {availableEmployees.map((emp) => (
                        <option key={emp._id} value={emp._id}>
                            {emp.f_name} {emp.l_name}
                        </option>
                    ))}
                </select>
                {/* Search Bar */}
                <div className="assigned-task-search-container">
                    <input
                        type="text"
                        className="assigned-task-search-bar"
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                {loading && <p>Loading tasks...</p>}
                {error && <p className="error-message">{error}</p>}

                {/* Task List */}
                <ul className="assigned-task-list">
                    {filteredTasks.map((task) => (
                        <li
                            key={task._id}
                            className="assigned-task-list-item"
                            onMouseEnter={() => setHoveredTask(task)}
                            onMouseLeave={() => setHoveredTask(null)}
                        >
                            <div className="assigned-task-list-item-content">
                                <h4 className="assigned-task-title">{task.title}</h4>
                                <p className="assigned-task-details">
                                    Deadline: {task.deadline ? new Date(task.deadline).toLocaleDateString() : "No deadline"}
                                </p>
                                <p className="assigned-task-details">
                                    Assigned to: {task.assigned_to_id?.f_name} {task.assigned_to_id?.l_name}
                                </p>
                            </div>
                            <div className="assigned-task-list-item-actions">
                                <button
                                    className="assigned-edit-task-button"
                                    onClick={() => openEditModal(task)}
                                    title="Edit Task"
                                >
                                    <img src="/edit.png" alt="Edit" />

                                </button>
                                <button
                                    className="assigned-delete-task-button"
                                    onClick={() => handleDeleteTask(task)}
                                    title="Delete Task"
                                >
                                    <img src="trash.png" alt="Delete" />
                                </button>

                            </div>

                            {/* Tooltip on hover */}
                            {hoveredTask === task && (
                                <div className="assigned-task-tooltip">
                                    <h4>Details:</h4>
                                    <p><strong>Description:</strong> {task.description || "No description"}</p>
                                    <p><strong>Badge:</strong> {availableBadges.find((b) => b._id === task.badge_id)?.name || "No badge attached"}</p>
                                    <p><strong>Assigned To:</strong> {task.assigned_to_id?.email || "Unassigned"}</p>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
                {/* Edit Modal */}
                {editingTask && (
                    <div className="assigned-task-modal-overlay">
                        <div className="assigned-task-modal-content">
                            <h3>Edit Task</h3>
                            <form onSubmit={handleSaveTask}>
                                <div className="assigned-task-form-row">
                                    <label htmlFor="title">Title</label>
                                    <input
                                        id="title"
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="assigned-task-form-row">
                                    <label htmlFor="assignedTo">Assigned To</label>
                                    <select
                                        id="assignedTo"
                                        name="assignedTo"
                                        value={formData.assignedTo}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Choose an employee</option>
                                        {availableEmployees.map((emp) => (
                                            <option key={emp._id} value={emp.email}>
                                                {emp.f_name} {emp.l_name} ({emp.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="assigned-task-form-row">
                                    <label htmlFor="badge">Badge</label>
                                    <select
                                        id="badge"
                                        name="badge"
                                        value={formData.badge}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Choose a badge</option>
                                        {availableBadges.map((badge) => (
                                            <option key={badge._id} value={badge.name}>
                                                {badge.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="assigned-task-form-row">
                                    <label htmlFor="description">Description</label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="assigned-task-form-row">
                                    <label htmlFor="deadline">Deadline</label>
                                    <input
                                        id="deadline"
                                        type="date"
                                        name="deadline"
                                        value={formData.deadline}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="assigned-task-form-actions">
                                    <button type="button" onClick={closeEditModal} className="assigned-task-cancel-button">
                                        Cancel
                                    </button>
                                    <button type="submit" className="assigned-task-save-button">Save</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
            </div>
            );
};

            export default AssignedTaskList;
