import React, { useState } from "react";
import "./EmployeeTasks.css";
import TaskStatus from "../TaskStatus/TaskStatus";

const EmployeeTasks = () => {
    const [tasks, setTasks] = useState([
        { id: 1, title: "Order necessary hardware through Tango", description: "Resources >", deadline: "12/12/2024", completed: false },
        { id: 2, title: "Request access to necessary additional software", description: "Resources >", deadline: "12/12/2024", completed: false },
        { id: 3, title: "Complete the learning path for the first month", description: "Resources >", deadline: "12/12/2024", completed: false },
        { id: 4, title: "Join the mandatory onboarding events", description: "Resources >", deadline: "12/12/2024", completed: true },
    ]);

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((task) => task.completed).length;
    const uncompletedTasks = totalTasks - completedTasks;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    const openModal = (task = null) => {
        setEditingTask(task);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setEditingTask(null);
        setIsModalOpen(false);
    };

    const handleSaveTask = (task) => {
        if (editingTask) {
            setTasks((prevTasks) =>
                prevTasks.map((t) => (t.id === editingTask.id ? task : t))
            );
        } else {
            setTasks((prevTasks) => [
                ...prevTasks,
                { ...task, id: prevTasks.length + 1 },
            ]);
        }
        closeModal();
    };

    const handleDeleteTask = (id) => {
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
    };

    const filteredTasks = tasks.filter((task) =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                        <img
                            src="more.png"
                            alt="Add"
                            className="icon"
                        />
                        </button>
                    </div>
                <ul className="task-list">
                    {filteredTasks.map((task) => (
                        <li key={task.id} className="task-item">
                            <button
                                className="edit-button"
                                onClick={() => openModal(task)}
                            >
                                <img
                                    src="edit.png"
                                    alt="Edit"
                                    className="icon"
                                />
                            </button>
                            <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() =>
                                    setTasks((prevTasks) =>
                                        prevTasks.map((t) =>
                                            t.id === task.id
                                                ? { ...t, completed: !t.completed }
                                                : t
                                        )
                                    )
                                }
                            />
                            <span>{task.title}</span>
                            <span>{task.deadline}</span>

                            <div className="task-actions">

                                <button
                                    className="delete-button"
                                    onClick={() => handleDeleteTask(task.id)}
                                >
                                    <img
                                        src="trash.png"
                                        alt="Delete"
                                        className="icon"
                                    />
                                </button>
                            </div>

                        </li>
                    ))}
                </ul>
                {
        isModalOpen && (
            <TaskModal
                task={editingTask}
                onClose={closeModal}
                onSave={handleSaveTask}

            />
        )
    }
            </div >
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
                            placeholder="Enter a name for your task"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                    </label>
                    <label>
                        Description & resources
                        <textarea
                            name="description"
                            placeholder="Enter details about your task, resources, etc..."
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
