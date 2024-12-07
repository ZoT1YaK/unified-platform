import React, { useState } from "react";
import "./AssignedTaskList.css";

const AssignedTaskList = ({ tasks, onEdit, onDelete }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [editingTask, setEditingTask] = useState(null);
    const [formData, setFormData] = useState({
        title: "",
        assignedTo: [],
        badge: "",
        description: "",
        deadline: "",
    });
    const [emailInput, setEmailInput] = useState("");
    const [hoveredTask, setHoveredTask] = useState(null);


    // Handle opening the edit modal
    const openEditModal = (task) => {
        setEditingTask(task);
        setFormData({ ...task }); // Pre-fill the form with the selected task
    };

    // Handle closing the modal
    const closeEditModal = () => {
        setEditingTask(null);
        setFormData({
            title: "",
            assignedTo: [],
            badge: "",
            description: "",
            deadline: "",
        });
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Handle adding an email
    const handleAddEmail = () => {
        if (emailInput.trim() && !formData.assignedTo.includes(emailInput.trim())) {
            setFormData((prev) => ({
                ...prev,
                assignedTo: [...prev.assignedTo, emailInput.trim()],
            }));
        }
        setEmailInput("");
    };

    // Handle removing an email
    const handleRemoveEmail = (email) => {
        setFormData((prev) => ({
            ...prev,
            assignedTo: prev.assignedTo.filter((e) => e !== email),
        }));
    };

    // Handle saving the updated task
    const handleSaveTask = (e) => {
        e.preventDefault();
        onEdit({ ...editingTask, ...formData }); // Call the parent onEdit function with updated task
        closeEditModal();
    };


    // Filter tasks based on the search query
    const filteredTasks = tasks.filter((task) =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="assigned-task-list-container">
            <h3 className="assigned-task-list-title">Assigned Tasks</h3>

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

            {/* Task List */}
            <ul className="assigned-task-list">
            {filteredTasks.map((task, index) => (
                    <li
                        key={index}
                        className="assigned-task-list-item"
                        onMouseEnter={() => setHoveredTask(task)}
                        onMouseLeave={() => setHoveredTask(null)}
                    >
                        <div className="assigned-task-list-item-content">
                            <h4 className="assigned-task-title">{task.title}</h4>
                            <p className="assigned-task-details">
                                {task.deadline
                                    ? `Deadline: ${new Date(task.deadline).toLocaleDateString()}`
                                    : "No deadline"} | Assigned: {task.assignedTo.length}{" "}
                                {task.assignedTo.length > 1 ? "people" : "person"}
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
                                onClick={() => onDelete(task)}
                                title="Delete Task"
                            >
                                <img src="trash.png" alt="Delete" />
                            </button>
                        </div>
                         {/* Tooltip for hover details */}
                         {hoveredTask === task && (
                            <div className="assigned-task-tooltip">
                                <h4>Details:</h4>
                                <p><strong>Description:</strong> {task.description || "No description"}</p>
                                <p><strong>Badge:</strong> {task.badge || "No badge attached"}</p>
                                <p><strong>Assigned To:</strong> {task.assignedTo.join(", ")}</p>
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
                                <label htmlFor="title">
                                    Title <span className="required">*</span>
                                </label>
                                <input
                                    id="title"
                                    type="text"
                                    name="title"
                                    placeholder="Enter task title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="assigned-task-form-row">
                                <label htmlFor="assignedTo">Assigned To</label>
                                <div className="email-input-container">
                                    <input
                                        type="email"
                                        placeholder="Enter email"
                                        value={emailInput}
                                        onChange={(e) => setEmailInput(e.target.value)}
                                    />
                                    <button type="button" onClick={handleAddEmail}>
                                        Add
                                    </button>
                                </div>
                                <ul className="assigned-task-email-list">
                                    {formData.assignedTo.map((email, index) => (
                                        <li key={index}>
                                            {email}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveEmail(email)}
                                            >
                                                Remove
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="assigned-task-form-row">
                                <label htmlFor="badge">Attach a Badge</label>
                                <select
                                    id="badge"
                                    name="badge"
                                    value={formData.badge}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Choose a badge</option>
                                    {["Badge 1", "Badge 2", "Badge 3"].map((badge, index) => (
                                        <option key={index} value={badge}>
                                            {badge}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="assigned-task-form-row">
                                <label htmlFor="description">Description</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    placeholder="Task description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                ></textarea>
                            </div>

                            <div className="assigned-task-form-row">
                                <label htmlFor="deadline">Deadline</label>
                                <input
                                    type="date"
                                    id="deadline"
                                    name="deadline"
                                    value={formData.deadline}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="assigned-task-form-actions">
                                <button type="button" onClick={closeEditModal} className="assigned-task-cancel-button">
                                    Cancel
                                </button>
                                <button type="submit" className="assigned-task-save-button">
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssignedTaskList;
