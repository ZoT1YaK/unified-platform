import React from 'react';
import './LeaderHub.css';
import TopBar from '../TopBar/TopBar';
import Header from '../Header/Header';
import EmployeeDetails from '../EmployeeDetails/EmployeeDetails';
import TaskCreator from '../TaskCreation/TaskCreation';

const LeaderHub = () => {

    const handleSaveTask = (task) => {
        console.log('Task saved:', task);
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
                    <p>Left Panel Content</p>
                </div>

                {/* Center Panel */}
                <div className="center-panel">
                    <EmployeeDetails />
                    <div className="task-creator-container">
                        <h2>Create a Task</h2>
                        <TaskCreator
                            badges={["Badge 1", "Badge 2", "Badge 3"]} 
                            onSave={handleSaveTask} 
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
