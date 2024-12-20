import React, { useState, useEffect, useMemo } from "react";
import { fetchEmployeeTasks, toggleTaskStatus } from "../../services/taskService";
import "./TaskCard.css";
import useDebounce from "../../hooks/useDebounce";

const TaskCard = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hoveredTask, setHoveredTask] = useState(null);
    const [filter, setFilter] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearchQuery = useDebounce(searchQuery, 500);
    const token = localStorage.getItem("token");


    // Fetch tasks
    useEffect(() => {
        const fetchTasks = async () => {
            setLoading(true);
            try {
                const fetchedTasks = await fetchEmployeeTasks(token, debouncedSearchQuery);
                console.log("Fetched tasks:", fetchedTasks);
                setTasks(fetchedTasks);
            } catch (err) {
                console.error("Error fetching tasks:", err.message);
                setError("Failed to fetch tasks. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, [debouncedSearchQuery, token]);

    // Filter tasks
    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            const matchesSearch = task.title
                .toLowerCase()
                .includes(searchQuery.toLowerCase());
            const matchesFilter =
                filter === "All" ||
                (filter === "Completed" && task.status === "Completed") ||
                (filter === "Incomplete" && task.status !== "Completed");

            return matchesSearch && matchesFilter;
        });
    }, [tasks, searchQuery, filter]);

    // Toggle task status
    const handleToggleStatus = async (taskId, currentStatus) => {
        const newStatus = currentStatus === "Completed" ? "Pending" : "Completed";
        try {
            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task._id === taskId ? { ...task, status: newStatus } : task
                )
            );

            await toggleTaskStatus(token, taskId, newStatus);
            alert(`Task marked as ${newStatus}!`);
        } catch (err) {
            console.error("Error toggling task status:", err.message);
            setError("Failed to update task status. Please try again.");

            // Revert status on failure
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
        <div className="home-task-container">
            <h2>Your Tasks</h2>
            {/* Search input for filtering tasks */}
            <div className="task-search-container">
                <div className="task-search-wrapper">
                    <img
                        src={`${process.env.PUBLIC_URL || ''}/magnifying-glass 1.png`} 
                        alt="Search Icon"
                        className="search-icon"
                    />
                    <input
                        type="text"
                        className="task-search"
                        placeholder="Search for a task..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Filter Buttons */}
                <div className="home-task-filter-buttons">
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
                <div className="task-list" style={{ maxHeight: "600px", overflowY: "auto" }}>
                    {filteredTasks.slice(0, 10).map((task) => (
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
                                    onChange={() => handleToggleStatus(task._id, task.status)}
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
                                        setHoveredTask(hoveredTask === task ? null : task)
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
            </div>
        </div>
    );
};

export default TaskCard;