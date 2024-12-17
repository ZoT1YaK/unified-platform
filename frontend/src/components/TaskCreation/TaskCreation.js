import React, { useState, useEffect } from "react";
import { fetchBadges } from "../../services/badgeService";
import { fetchEmployees } from "../../services/employeeService";
import { createTask } from "../../services/taskService";
import "./TaskCreation.css";

const TaskCreator = () => {
    const [formData, setFormData] = useState({
        title: "",
        assignedTo: "",
        badge: "",
        description: "",
        deadline: "",
    });

    const [availableBadges, setAvailableBadges] = useState([]);
    const [availableEmployees, setAvailableEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const token = localStorage.getItem("token");


    useEffect(() => {
        const fetchData = async () => {
            try {
                const [badges, employees] = await Promise.all([
                    fetchBadges(token),
                    fetchEmployees(token),
                ]);

                const currentUserId = JSON.parse(localStorage.getItem("employee"))?._id;
                const filteredEmployees = employees.filter(
                    (emp) => emp._id !== currentUserId
                );

                setAvailableEmployees(filteredEmployees);
                setAvailableBadges(badges.activeBadges || []); 
            } catch (err) {
                console.error("Error fetching data:", err.message);
                setError("Failed to fetch data. Please try again later.");
            }
        };

        fetchData();
    }, [token]);


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        const badge_id =
            (Array.isArray(availableBadges) &&
            availableBadges.find((b) => b.name === formData.badge)?._id) || null;
    
        const assigned_to_id =
            (availableEmployees.find((emp) => emp.email === formData.assignedTo)?._id) || null;
    
        const taskPayload = {
            title: formData.title,
            description: formData.description,
            deadline: formData.deadline,
            badge_id,
            assigned_to_id,
            type: "Leader-Assigned",
        };

        setLoading(true);
        setError(null);

        try {
            await createTask(token, taskPayload);
            alert("Task created successfully!");

            setFormData({
                title: "",
                assignedTo: "",
                badge: "",
                description: "",
                deadline: "",
            });
        } catch (err) {
            console.error("Error creating task:", err.message);
            setError("Failed to create task. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="task-creator-container">
            <form className="task-creator-form" onSubmit={handleSubmit}>
                <div className="form-row">
                    <label htmlFor="title">
                        Title <span className="required">*</span>
                    </label>
                    <input
                        id="title"
                        type="text"
                        name="title"
                        placeholder="Enter a name for your task"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="form-row">
                    <label htmlFor="assignedTo">
                        Assigned To <span className="required">*</span>
                    </label>
                    <select
                        id="assignedTo"
                        name="assignedTo"
                        value={formData.assignedTo}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Choose an employee</option>
                        {availableEmployees.map((emp) => (
                            <option key={emp._id} value={emp.email}>
                                {emp.f_name} {emp.l_name} ({emp.email})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-row">
                    <label htmlFor="badge">Attach a badge</label>
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

                <div className="form-row">
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        placeholder="Enter details about your task"
                        value={formData.description}
                        onChange={handleInputChange}
                    ></textarea>
                </div>

                <div className="form-row">
                    <label htmlFor="deadline">Deadline</label>
                    <input
                        id="deadline"
                        type="date"
                        name="deadline"
                        value={formData.deadline}
                        onChange={handleInputChange}
                    />
                </div>

                {error && <div className="error-message">{error}</div>}
                {loading && <div className="loading-message">Saving...</div>}

                <div className="form-actions">
                    <button type="button" className="cancel-button" disabled={loading}>
                        Cancel
                    </button>
                    <button type="submit" className="save-button" disabled={loading}>
                        {loading ? "Saving..." : "Add Task"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TaskCreator;
