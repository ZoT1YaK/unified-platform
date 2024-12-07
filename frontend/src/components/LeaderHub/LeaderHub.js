import React, { useState } from 'react';
import './LeaderHub.css';
import TopBar from '../TopBar/TopBar';
import Header from '../Header/Header';
import EmployeeDetails from '../EmployeeDetails/EmployeeDetails';
import TaskCreator from '../TaskCreation/TaskCreation';
import AssignedTaskList from '../AssignedTaskList/AssignedTaskList';
import EventCreator from '../EventCreator/EventCreator';

const LeaderHub = () => {

    const [tasks, setTasks] = useState([
        {
            title: "Order necessary hardware",
            deadline: "2024-12-12",
            assignedTo: ["employee1@example.com", "employee2@example.com"],
            badge: "Badge 1",
            description: "Order laptops and monitors for new hires.",
        },
        {
            title: "Plan team event",
            deadline: "2024-12-20",
            assignedTo: ["employee3@example.com"],
            badge: "Badge 2",
            description: "Plan the quarterly team-building event.",
        },
    ]);

    const [events, setEvents] = useState([
        {
            eventName: "Quarterly Meeting",
            date: "2024-12-15",
            time: "10:00",
            location: "Conference Room A",
            participants: ["employee1@example.com", "employee2@example.com"],
            description: "Discuss Q4 results and strategies for next year.",
        },
    ]);

    // Handle saving a new task
    const handleSaveTask = (task) => {
        setTasks((prevTasks) => [...prevTasks, task]);
        console.log('Task saved:', task);
    };

    // Handle editing a task
    const handleEditTask = (taskToEdit) => {
        console.log('Edit task:', taskToEdit);
    };

    // Handle deleting a task
    const handleDeleteTask = (taskToDelete) => {
        setTasks((prevTasks) =>
            prevTasks.filter((task) => task.title !== taskToDelete.title)
        );
        console.log('Deleted task:', taskToDelete);
    };

    // Handle saving a new event
    const handleSaveEvent = (event) => {
        setEvents((prevEvents) => [...prevEvents, event]);
        console.log('Event saved:', event);
    };

    return (
        <div className="leaderhub-page">
            <TopBar />
            <Header />
            {/* Main Content */}
            <div className="content-flex">
                {/* Left Panel */}
                <div className="left-panel">
                    {/* Placeholder for future content */}
                    <AssignedTaskList
                        tasks={tasks}
                        onEdit={handleEditTask}
                        onDelete={handleDeleteTask}
                    />
                    <h3>Scheduled Events</h3>
                    <ul className="event-list">
                        {events.map((event, index) => (
                            <li key={index} className="event-list-item">
                                <h4>{event.eventName}</h4>
                                <p>Date: {event.date}</p>
                                <p>Time: {event.time}</p>
                                <p>Location: {event.location}</p>
                                <p>Participants: {event.participants.join(", ")}</p>
                                <p>Description: {event.description}</p>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Center Panel */}
                <div className="center-panel">
                    <EmployeeDetails />
                    <div className="task-creator-container">
                        <h2><img
                            src="clipboard.png"
                            alt="Clipboard Icon"
                            className="task-creator-title-icon"
                        />Create a Task</h2>
                        <TaskCreator
                            badges={["Badge 1", "Badge 2", "Badge 3"]}
                            onSave={handleSaveTask}
                        />
                    </div>
                    <div className="event-creator-container">
                        <h2><img
                            src="calendar-check.png"
                            alt="Clipboard Icon"
                            className="event-creator-title-icon"
                        />Create an Event</h2>
                        <EventCreator
                            onSave={handleSaveEvent}
                            departments={["Engineering", "HR", "Marketing"]}
                            locations={["New York", "London", "Tokyo"]}
                        />
                    </div>
                </div>

                {/* Right Panel */}
                <div className="right-panel">
                    {/* Placeholder for future content */}
                    <p>Right Panel Content</p>
                </div>
            </div>
        </div>
    );
};

export default LeaderHub;
