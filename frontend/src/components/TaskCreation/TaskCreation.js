import React, { useState, useEffect } from "react";
import "./TaskCreation.css";

const TaskCreator = ({ badges, onSave }) => {
    const [formData, setFormData] = useState({
        title: "",
        assignedTo: [],
        badge: "",
        description: "",
        deadline: "",
    });
    const [emailInput, setEmailInput] = useState("");
    const [availableBadges, setAvailableBadges] = useState([]);

    // Fetch badges on component mount
    useEffect(() => {
        // Mock fetch badges from backend or use the passed `badges` prop
        setAvailableBadges(badges || ["Badge 1", "Badge 2", "Badge 3"]);
    }, [badges]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddEmail = () => {
        if (emailInput.trim() && !formData.assignedTo.includes(emailInput.trim())) {
            setFormData((prev) => ({
                ...prev,
                assignedTo: [...prev.assignedTo, emailInput.trim()],
            }));
        }
        setEmailInput("");
    };

    const handleRemoveEmail = (email) => {
        setFormData((prev) => ({
            ...prev,
            assignedTo: prev.assignedTo.filter((e) => e !== email),
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData); // Pass the form data to the parent component
        setFormData({ title: "", assignedTo: [], badge: "", description: "", deadline: "" });
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
                    <div className="email-input-container">
                        <input
                            id="assignedTo"
                            type="email"
                            placeholder="Enter email of the employee"
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                        />
                        <button
                            type="button"
                            className="add-email-button"
                            onClick={handleAddEmail}
                        >
                            Add
                        </button>
                    </div>
                </div>

                {/* Display list of added emails */}
                <div className="form-row">
                    <label></label>
                    <ul className="email-list">
                        {formData.assignedTo.map((email, index) => (
                            <li key={index}>
                                {email}
                                <button
                                    type="button"
                                    className="remove-email-button"
                                    onClick={() => handleRemoveEmail(email)}
                                >
                                    Remove
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="form-row">
                    <label htmlFor="badge">
                        Attach a badge
                    </label>
                    <select
                        id="badge"
                        name="badge"
                        value={formData.badge}
                        onChange={handleInputChange}
                    >
                        <option value="">Choose a badge</option>
                        {availableBadges.map((badge, index) => (
                            <option key={index} value={badge}>
                                {badge}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-row">
                    <label htmlFor="description">
                        Description & resources
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        placeholder="Enter details about your task, resources, etc..."
                        value={formData.description}
                        onChange={handleInputChange}
                    ></textarea>
                </div>

                <div className="form-row">
                    <label htmlFor="deadline">
                        Deadline
                    </label>
                    <input
                        id="deadline"
                        type="date"
                        name="deadline"
                        value={formData.deadline}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="form-actions">
                    <button type="button" className="cancel-button">Cancel</button>
                    <button type="submit" className="save-button">Add Task</button>
                </div>
            </form>

        </div>
    );
};

export default TaskCreator;
