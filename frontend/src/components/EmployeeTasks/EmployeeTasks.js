import React, { useState, useEffect } from "react";
import axios from "axios";
import "./EmployeeTasks.css";
import TaskStatus from "../TaskStatus/TaskStatus";

const EmployeeTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch tasks from the backend
    useEffect(() => {
        const fetchTasks = async () => {
            try {
                setLoading(true);
                const response = await axios.get(
                    `${process.env.REACT_APP_BACKEND_URL}/api/tasks/employee`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );
                const { assignedTasks, ownTasks } = response.data;
                setTasks([...assignedTasks, ...ownTasks]);
            } catch (err) {
                console.error("Error fetching tasks:", err);
                setError("Failed to fetch tasks. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchTasks();
    }, []);

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((task) => task.status === "Completed").length;
    const uncompletedTasks = totalTasks - completedTasks;

    const openModal = (task = null) => {
        setEditingTask(task);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setEditingTask(null);
        setIsModalOpen(false);
    };

    const handleSaveTask = async (task) => {
        try {
            setLoading(true);
            if (editingTask) {
                // Edit existing task
                await axios.put(
                    `${process.env.REACT_APP_BACKEND_URL}/api/tasks/edit-own`,
                    {
                        task_id: editingTask._id,
                        title: task.title,
                        description: task.description,
                        deadline: task.deadline,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );
                setTasks((prevTasks) =>
                    prevTasks.map((t) =>
                        t._id === editingTask._id ? { ...t, ...task } : t
                    )
                );
            } else {
                // Add new task
                const response = await axios.post(
                    `${process.env.REACT_APP_BACKEND_URL}/api/tasks/create`,
                    {
                        title: task.title,
                        description: task.description,
                        deadline: task.deadline,
                        type: "Self-Created",
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );
                setTasks((prevTasks) => [...prevTasks, response.data.task]);
            }
        } catch (err) {
            console.error("Error saving task:", err);
            setError("Failed to save task. Please try again.");
        } finally {
            setLoading(false);
            closeModal();
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (!window.confirm("Are you sure you want to delete this task?")) return;
        try {
            setLoading(true);
            await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/tasks/delete`, {
                data: { task_id: taskId },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));
        } catch (err) {
            console.error("Error deleting task:", err);
            setError("Failed to delete task. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const toggleTaskStatus = async (taskId, currentStatus) => {
        const newStatus = currentStatus === "Completed" ? "Pending" : "Completed";
        try {
            const response = await axios.put(
                `${process.env.REACT_APP_BACKEND_URL}/api/tasks/complete`,
                { task_id: taskId, status: newStatus },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
    
            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task._id === taskId ? { ...task, status: newStatus } : task
                )
            );
    
            // Notify user if a badge is awarded
            if (newStatus === "Completed" && response.data.task.badge_id) {
                alert("Congratulations! You’ve earned a new achievement!");
            }
        } catch (err) {
            console.error("Error toggling task status:", err);
            setError("Failed to update task status. Please try again.");
        }
    };
    

    const filteredTasks = tasks.filter((task) =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <p>Loading tasks...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="employee-tasks">
            <TaskStatus
                totalTasks={totalTasks}
                completedTasks={completedTasks}
                uncompletedTasks={uncompletedTasks}
            />
            <h2>Assigned Tasks</h2>
            <div className="search-add-container">
                <input
                    type="text"
                    className="task-search-bar"
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="add-task-button" onClick={() => openModal()}>
                    <img src="more.png" alt="Add" className="icon" />
                </button>
            </div>
            <ul className="task-list">
                {filteredTasks.map((task) => (
                    <li key={task._id} className="task-item">
                        {task.type === "Self-Created" && (
                            <button
                                className="edit-button"
                                onClick={() => openModal(task)}
                            >
                                <img src="edit.png" alt="Edit" className="icon" />
                            </button>
                        )}
                        <input
                            type="checkbox"
                            checked={task.status === "Completed"}
                            onChange={() => toggleTaskStatus(task._id, task.status)}
                        />
                        <span>{task.title}</span>
                        <span className="task-deadline">
                            {task.deadline
                                ? new Date(task.deadline).toLocaleDateString("de-DE")
                                : "No deadline"}
                        </span>
                        
                        {task.type === "Self-Created" && (
                            <button
                                className="employee-task-delete-button"
                                onClick={() => handleDeleteTask(task._id)}
                            >
                                <img src="trash.png" alt="Delete" className="icon" />
                            </button>
                        )}
                    </li>
                ))}
            </ul>
            {isModalOpen && (
                <TaskModal
                    task={editingTask}
                    onClose={closeModal}
                    onSave={handleSaveTask}
                />
            )}
        </div>
    );
};

const TaskModal = ({ task, onClose, onSave }) => {
    const [formData, setFormData] = useState(
        task || { title: "", description: "", deadline: "" }
    );

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>{task ? "Edit Task" : "Add Task"}</h3>
                <form className="task-form" onSubmit={handleSubmit}>
                    <label>
                        Title <span className="required">*</span>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                    </label>
                    <label>
                        Description & resources
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </label>
                    <label>
                        Deadline
                        <input
                            type="date"
                            name="deadline"
                            value={formData.deadline}
                            onChange={handleChange}
                        />
                    </label>
                    <div className="form-actions">
                        <button type="button" className="cancel-button" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="save-button">
                            {task ? "Save" : "Add Task"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EmployeeTasks;
