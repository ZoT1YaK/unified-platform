import React, { useState, useEffect } from 'react';
import './LeaderHub.css';
import { useLocation } from 'react-router-dom';
import TopBar from '../TopBar/TopBar';
import Header from '../Header/Header';
import EmployeeDetails from '../EmployeeDetails/EmployeeDetails';
import TaskCreator from '../TaskCreation/TaskCreation';
import AssignedTaskList from '../AssignedTaskList/AssignedTaskList';
import EventCreator from '../EventCreator/EventCreator';
import EventCard from '../EventCard/EventCard';
import TeamMetrics from '../TeamMetrics/TeamMetrics';
import EventMetricsChart from './EventMetricsChart';
import TaskMetricsChart from './TaskMetricsChart';
import ReportDownloadButton from './ReportDownloadButton';

const LeaderHub = () => {
    const [isLeader, setIsLeader] = useState(false);
    const location = useLocation();

    // Fetch the user data from localStorage
    useEffect(() => {
        const storedEmployee = localStorage.getItem('employee');
        if (storedEmployee) {
            const parsedEmployee = JSON.parse(storedEmployee);
            setIsLeader(parsedEmployee.is_people_leader || false); // Check if the user is a leader
        }
    }, []);

  
    const handleSaveEvent = (newEvent) => {
        console.log("Event saved:", newEvent);
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
                    />
                    <div className="scheduled-event-container">
                        <h3 className="scheduled-event-title">Scheduled Events</h3>
                        <div className="event-grid">
                            <EventCard isLeader={isLeader && location.pathname === "/leaderhub"} // Only leaders see delete buttons

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
                        <EventCreator onSave={handleSaveEvent} />
                    </div>
                </div>

                {/* Right Panel */}
                <div className="right-panel">
                    {/* Metrics Placeholder */}
                    <div className="employee-metrics-container">
                        <div>
                            <EventMetricsChart />
                        </div>
                        <div>
                            <TaskMetricsChart />
                        </div>
                    </div>

                    {/* Download Button */}
                    <div className="report-download-container">
                        <h3>Download Metrics Report</h3>
                        <ReportDownloadButton />
                    </div>

                    {/* Employee Statistics */}
                    <div className="employee-statistics">
                        <TeamMetrics />
                    </div>
                </div>

            </div>

        </div>
    );
};

export default LeaderHub;
