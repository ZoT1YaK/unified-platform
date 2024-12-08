import React, { useState, useEffect } from "react";
import axios from "axios";
import "./TaskCard.css";

const TaskCard = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hoveredTask, setHoveredTask] = useState(null);

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

                // Ensure tasks state is replaced, not appended
                setTasks([...assignedTasks, ...ownTasks]);
            } catch (err) {
                console.error("Error fetching tasks:", err);
                setError("Failed to fetch tasks. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, []); // Empty array ensures it runs only once

    const toggleTaskStatus = async (taskId, currentStatus) => {
        const newStatus = currentStatus === "Completed" ? "Pending" : "Completed";
    
        try {
            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task._id === taskId ? { ...task, status: newStatus } : task
                )
            );
    
            // Send the update to the backend
            await axios.put(
                `${process.env.REACT_APP_BACKEND_URL}/api/tasks/complete`,
                { task_id: taskId, status: newStatus }, // Pass the new status explicitly
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
    
            alert(`Task marked as ${newStatus}!`);
        } catch (err) {
            console.error("Error toggling task status:", err.response?.data || err.message);
            setError(err.response?.data?.message || "Failed to update task status. Please try again.");
    
            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task._id === taskId ? { ...task, status: currentStatus } : task
                )
            );
        }
    };
    

    if (loading) return <p>Loading tasks...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="task-list">
            <h2>Your Tasks</h2>
            {tasks.map((task) => (
                <div
                    key={task._id}
                    className="task-card"
                    onMouseEnter={() => setHoveredTask(task)}
                    onMouseLeave={() => setHoveredTask(null)}
                >
                    <div className="task-header">
                        <input
                            type="checkbox"
                            checked={task.status === "Completed"}
                            onChange={() => toggleTaskStatus(task._id, task.status)}
                            className="task-checkbox"
                        />
                        <h3>{task.title}</h3>
                        {task.deadline && (
                            <p className="deadline">
                                {new Date(task.deadline).toLocaleDateString()}
                            </p>
                        )}
                    </div>
                    {task.description && (
                        <button
                            className="resources-btn"
                            onClick={() =>
                                setHoveredTask(
                                    hoveredTask === task ? null : task
                                )
                            }
                        >
                            {hoveredTask === task
                                ? "Hide Resources"
                                : "Show Resources"}
                        </button>
                    )}
                    {hoveredTask === task && task.description && (
                        <div className="resources">
                            <p>{task.description}</p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default TaskCard;
