import React from 'react';
import './LeaderHub.css';
import TopBar from '../TopBar/TopBar';
import Header from '../Header/Header';
import EmployeeDetails from '../EmployeeDetails/EmployeeDetails';
import TaskCreator from '../TaskCreation/TaskCreation';
import AssignedTaskList from '../AssignedTaskList/AssignedTaskList';
import EventCreator from '../EventCreator/EventCreator';
import EventCard from '../EventCard/EventCard';

const LeaderHub = () => {


    const employees = [
        {
            id: 1,
            name: 'Ivan Ivanov',
            avatar: 'https://via.placeholder.com/50',
            tasks: 6,
            completedTasks: 2,
            achievements: 12,
            milestones: 2,
            team: 'HR Team',
        },
        {
            id: 2,
            name: 'Aiga Kalneja',
            avatar: 'https://via.placeholder.com/50',
            tasks: 8,
            completedTasks: 6,
            achievements: 10,
            milestones: 3,
            team: 'HR Team',
        },
        {
            id: 3,
            name: 'Roberts Zustars',
            avatar: 'https://via.placeholder.com/50',
            tasks: 5,
            completedTasks: 3,
            achievements: 8,
            milestones: 2,
            team: 'HR Team',
        },
        {
            id: 4,
            name: 'Diana Antoniuc',
            avatar: 'https://via.placeholder.com/50',
            tasks: 4,
            completedTasks: 1,
            achievements: 5,
            milestones: 1,
            team: 'HR Team',
        },
    ];
    

   /* const [events, setEvents] = useState([
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
    ]);*/

    /*const [selectedEvent, setSelectedEvent] = useState(null);

 

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
    };*/

    return (
        <div className="leaderhub-page">
            <TopBar />
            <Header />

            {/* Main Content */}
            <div className="content-flex">
                {/* Left Panel */}
                <div className="left-panel">
                    <AssignedTaskList
                    />
                    <div className="scheduled-event-container">
                        <h3 className="scheduled-event-title">Scheduled Events</h3>
                        <div className="event-grid">
                                <EventCard
                                />
                        </div>
                    </div>
                    
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
                            
                        />
                    </div>
                </div>

                {/* Right Panel */}
                <div className="right-panel">
                    {/* Power BI Placeholder */}
                    <div className="power-bi-placeholder">
                        <h3>Employee Metrics</h3>
                        <img
                            src="https://via.placeholder.com/300x150"
                            alt="Power BI Placeholder"
                            className="power-bi-report"
                        />
                    </div>

                    {/* Employee Statistics */}
                    <div className="employee-statistics">
                        <h4>Team 10 | HR Team</h4>
                        <ul className="employee-list">
                            {employees.map((employee) => (
                                <li key={employee.id} className="employee-item">
                                    <img
                                        src={employee.avatar}
                                        alt={`${employee.name}'s Avatar`}
                                        className="employee-avatar"
                                    />
                                    <div className="employee-details">
                                        <h5>{employee.name}</h5>
                                        <p>Tasks: {employee.tasks} ({employee.completedTasks} done)</p>
                                        <p>Achievements: {employee.achievements}</p>
                                        <p>Milestones: {employee.milestones}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                </div>
            </div>
            );
};

            export default LeaderHub;
