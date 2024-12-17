import React, { useState, useEffect, useMemo } from "react";
import { fetchEmployeeTasks, editOwnTask, createTask, deleteTask, toggleTaskStatus } from "../../services/taskService";
import "./EmployeeTasks.css";
import TaskStatus from "../TaskStatus/TaskStatus";
import useDebounce from "../../hooks/useDebounce";

const EmployeeTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filter, setFilter] = useState("All");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    useEffect(() => {
        const loadTasks = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("token");
                const tasks = await fetchEmployeeTasks(token, debouncedSearchQuery);
                setTasks(tasks);
            } catch (err) {
                console.error("Error fetching tasks:", err);
                setError("Failed to fetch tasks. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        loadTasks();
    }, [debouncedSearchQuery]);

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
        const token = localStorage.getItem("token");
        try {
            setLoading(true);
            if (editingTask) {
                await editOwnTask(token, {
                    task_id: editingTask._id,
                    ...task,
                });
            } else {
                const newTask = await createTask(token, {
                    ...task,
                    type: "Self-Created",
                });
                setTasks((prevTasks) => [...prevTasks, newTask]);
            }
        } catch (err) {
            console.error("Error saving task:", err);
            setError("Failed to save task. Please try again.");
        } finally {
            setLoading(false);
            setIsModalOpen(false);
            setEditingTask(null);
        }
    };

    const handleDeleteTask = async (taskId) => {
        const token = localStorage.getItem("token");
        try {
            setLoading(true);
            await deleteTask(token, taskId);
            setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));
        } catch (err) {
            console.error("Error deleting task:", err);
            setError("Failed to delete task. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (taskId, currentStatus) => {
        const token = localStorage.getItem("token");
        const newStatus = currentStatus === "Completed" ? "Pending" : "Completed";
        try {
            await toggleTaskStatus(token, taskId, newStatus);
            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task._id === taskId ? { ...task, status: newStatus } : task
                )
            );
        } catch (err) {
            console.error("Error updating status:", err);
            setError("Failed to update task status. Please try again.");
        }
    };

    // Filter tasks based on the selected filter
    const filteredTasks = useMemo(() => {
        let filtered = tasks;
        if (filter === "Completed") {
            filtered = tasks.filter((task) => task.status === "Completed" && !task.archived);
        } else if (filter === "Incomplete") {
            filtered = tasks.filter((task) => task.status !== "Completed");
        } else if (filter === "Archived") {
            filtered = tasks.filter((task) => task.archived); // Show only archived tasks
        }
        return filtered.filter((task) =>
            task.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [tasks, filter, searchQuery]);

    const visibleTasks = filteredTasks.slice(0, 20);



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
                <div className="event-search-wrapper">
                    <img
                        src="/magnifying-glass 1.png"
                        alt="Search Icon"
                        className="search-icon"
                    />
                    <input
                        type="text"
                        placeholder="Search for an event..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="event-search"
                    />
                </div>
                <button className="add-task-button" onClick={() => openModal()}>
                    <img src="more.png" alt="Add" className="icon" />
                </button>
            </div>

            <div className="employee-tasks-filter-buttons">
                {["All", "Completed", "Incomplete"].map((status) => (
                    <button
                        key={status}
                        className={`filter-button ${filter === status ? "active" : ""}`}
                        onClick={() => setFilter(status)}
                    >
                        {status}
                    </button>
                ))}
            </div>

            <ul className="task-list" >
                {visibleTasks.map((task) => (
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
                            onChange={() => handleToggleStatus(task._id, task.status)}
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