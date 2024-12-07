import React from 'react';
import './LeaderHub.css';
import TopBar from '../TopBar/TopBar';
import Header from '../Header/Header';
import EmployeeDetails from '../EmployeeDetails/EmployeeDetails';

const LeaderHub = () => {
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
                    <EmployeeDetails 
                        name="Bob Bobrovich"
                        position="Head of HR | HR Team"
                        location="Vejle, Region of Southern Denmark, Denmark"
                        avatar="/path-to-avatar.jpg" 
                    />
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
