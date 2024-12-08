import React, { useState } from 'react';
import './LeaderHub.css';
import TopBar from '../TopBar/TopBar';
import Header from '../Header/Header';
import EmployeeDetails from '../EmployeeDetails/EmployeeDetails';
import TaskCreator from '../TaskCreation/TaskCreation';
import AssignedTaskList from '../AssignedTaskList/AssignedTaskList';
import EventCreator from '../EventCreator/EventCreator';
import EventCard from '../EventCard/EventCard';

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
            id: 1,
            thumbnail: 'https://via.placeholder.com/300x150',
            date: '12/12/24',
            title: 'The Yearly Big Marathon',
            description: 'Join us for the big yearly marathon...',
        },
        {
            id: 2,
            thumbnail: 'https://via.placeholder.com/300x150',
            date: '10/10/24',
            title: 'Let’s Recycle in the Office!',
            description: 'Learn about sustainability in the office...',
        },
        {
            id: 3,
            thumbnail: 'https://via.placeholder.com/300x150',
            date: '09/09/24',
            title: 'Ugly Sweater Weather',
            description: 'A fun contest for the ugliest sweater...',
        },
    ]);

    const [selectedEvent, setSelectedEvent] = useState(null);

    // Task Handlers
    const handleSaveTask = (task) => {
        setTasks((prevTasks) => [...prevTasks, task]);
        console.log('Task saved:', task);
    };

    const handleEditTask = (taskToEdit) => {
        console.log('Edit task:', taskToEdit);
    };

    const handleDeleteTask = (taskToDelete) => {
        setTasks((prevTasks) =>
            prevTasks.filter((task) => task.title !== taskToDelete.title)
        );
        console.log('Deleted task:', taskToDelete);
    };

    // Event Handlers
    const handleEditEvent = (event) => {
        setSelectedEvent(event);
    };

    const handleSaveEvent = (updatedEvent) => {
        setEvents((prevEvents) =>
            prevEvents.map((event) =>
                event.id === updatedEvent.id ? updatedEvent : event
            )
        );
        setSelectedEvent(null);
    };

    const handleDeleteEvent = (eventId) => {
        setEvents((prevEvents) => prevEvents.filter((event) => event.id !== eventId));
        setSelectedEvent(null);
    };

    return (
        <div className="leaderhub-page">
            <TopBar />
            <Header />

            {/* Main Content */}
            <div className="content-flex">
                {/* Left Panel */}
                <div className="left-panel">
                    <AssignedTaskList
                        tasks={tasks}
                        onEdit={handleEditTask}
                        onDelete={handleDeleteTask}
                    />
                    <div className="scheduled-event-container">
                        <h3 className="scheduled-event-title">Scheduled Events</h3>
                        <div className="event-grid">
                            {events.map((event) => (
                                <EventCard
                                    key={event.id}
                                    thumbnail={event.thumbnail}
                                    date={event.date}
                                    title={event.title}
                                    description={event.description}
                                    onClick={() => handleEditEvent(event)}
                                />
                            ))}
                        </div>
                    </div>
                        {/* Event Modal */}
                        {selectedEvent && (
                            <div className="events-modal-overlay">
                                <div className="events-modal-content">
                                    <h2>Edit Event</h2>
                                    <EventCreator
                                        onSave={(updatedEvent) => handleSaveEvent({ ...selectedEvent, ...updatedEvent })}
                                        departments={["Engineering", "HR", "Marketing"]}
                                        locations={["New York", "London", "Tokyo"]}
                                        teams={["UX Team", "Sales Team"]}
                                        existingEvent={selectedEvent}
                                    />
                                    <div className="events-modal-actions">
                                        <button onClick={() => handleDeleteEvent(selectedEvent.id)}>Delete Event</button>
                                        <button onClick={() => setSelectedEvent(null)}>Close</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Center Panel */}
                    <div className="center-panel">
                        <EmployeeDetails />
                        <div className="task-creator-container">
                            <h2>
                                <img
                                    src="clipboard.png"
                                    alt="Clipboard Icon"
                                    className="task-creator-title-icon"
                                />
                                Create a Task
                            </h2>
                            <TaskCreator
                                badges={["Badge 1", "Badge 2", "Badge 3"]}
                                onSave={handleSaveTask}
                            />
                        </div>
                        <div className="event-creator-container">
                            <h2>
                                <img
                                    src="calendar-check.png"
                                    alt="Clipboard Icon"
                                    className="event-creator-title-icon"
                                />
                                Create an Event
                            </h2>
                            <EventCreator
                                onSave={handleSaveEvent}
                                departments={["Engineering", "HR", "Marketing"]}
                                locations={["New York", "London", "Tokyo"]}
                                teams={["UX Team", "Sales Team"]}
                            />
                        </div>
                    </div>

                    {/* Right Panel */}
                    <div className="right-panel">
                        <p>Right Panel Content</p>
                    </div>
                </div>
            </div>
            );
};

            export default LeaderHub;
