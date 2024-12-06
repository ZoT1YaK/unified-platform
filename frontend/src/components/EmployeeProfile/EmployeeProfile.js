import React, { useState } from 'react';
import './EmployeeProfile.css';
import TopBar from '../TopBar/TopBar';
import Header from '../Header/Header';
import Achievements from '../Achievements/Achievements'; 
import Milestones from '../Milestones/Milestones'; 


const EmployeeProfile = () => {
    const [filter, setFilter] = useState("All");
    const [searchQuery, setSearchQuery] = useState('');
    const [dataMind, setDataMind] = useState("Curious");

    const dataMindOptions = ["Curious", "Creative", "Innovative", "Resilient", "Collaborative"];

    const generateRandomDataMind = () => {
        const randomIndex = Math.floor(Math.random() * dataMindOptions.length);
        setDataMind(dataMindOptions[randomIndex]);
    };

    const handleDataMindChange = (event) => {
        setDataMind(event.target.value);
    };


    const [achievements, setAchievements] = useState([
        { id: 1, title: "Ach-badge1", description: "Complete the annual biking contest", date: "12/12/2024", visible: true },
        { id: 2, title: "Ach-badge2", description: "Run the yearly marathon", date: "12/12/2024", visible: true },
        { id: 3, title: "Ach-badge3", description: "Recycle 50kg of paper waste", date: "12/12/2024", visible: true },
        { id: 4, title: "Ach-badge4", description: "Join the group cooking activity", date: "12/12/2024", visible: true },
        { id: 5, title: "Ach-badge5", description: "Build bird nests for the coming season", date: "12/12/2024", visible: false },
    ]);

    const [milestones, setMilestones] = useState([
        { id: 1, badge: "5", title: "Mil-badge1", description: "You've been with us for a whole 5 years!", date: "12/12/2024", visible: true },
        { id: 2, badge: "1", title: "Mil-badge2", description: "You've been with us for a whole year!", date: "12/12/2024", visible: true },
        { id: 3, badge: "0.5", title: "Mil-badge3", description: "You've been with us for a whole 6 months!", date: "12/12/2024", visible: true },
    ]);

    const toggleVisibility = (id, type) => {
        if (type === "achievement") {
            setAchievements((prevAchievements) =>
                prevAchievements.map((item) =>
                    item.id === id ? { ...item, visible: !item.visible } : item
                )
            );
        } else if (type === "milestone") {
            setMilestones((prevMilestones) =>
                prevMilestones.map((item) =>
                    item.id === id ? { ...item, visible: !item.visible } : item
                )
            );
        }
    };
   

    return (
        <div className="employee-profile-page">
            <TopBar />  
            <Header />           
            {/* Main Content */}
            <div className="content-flex">
                <div className="left-panel">
                    <Achievements
                        achievements={achievements}
                        filter={filter}
                        searchQuery={searchQuery}
                        toggleVisibility={toggleVisibility}
                        setFilter={setFilter}
                        setSearchQuery={setSearchQuery}
                    />
                    <Milestones
                        milestones={milestones}
                        filter={filter}
                        searchQuery={searchQuery}
                        toggleVisibility={toggleVisibility}
                        setFilter={setFilter}
                        setSearchQuery={setSearchQuery}
                    />
                </div>
                <div className="center-panel">
                    <div className="employee-user-container">
                        {/* Green Header Section */}
                        <div className="employee-user-container-top">
                            <h2>#IAm{dataMind}DataMind</h2>

                        </div>

                        {/* User Avatar and Details */}
                        <div className="employee-info">
                            <img src="/cat.png" alt="User Avatar" className="employee-user-avatar" />
                            <div className="employee-user-details">
                                <h2>Bob Bobrovich</h2>
                                <p>Head of HR | HR Team</p>
                                <p>Vejle, Region of Southern Denmark, Denmark</p>
                            </div>

                            {/* DataMind Controls */}
                            <div className="datamind-controls">
                                <select
                                    value={dataMind}
                                    onChange={handleDataMindChange}
                                    className="datamind-dropdown"
                                >
                                    <option disabled value="">
                                        What is your Data Mind?
                                    </option>
                                    {dataMindOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                                <button onClick={generateRandomDataMind} className="datamind-button">
                                    Generate
                                </button>
                            </div>
                        </div>

                        {/* Analytics Section */}
                        <div className="analytics-container">
                            <div className="analytics-stat">
                                <p>{achievements.length}</p>
                                <span>Achievements</span>
                            </div>
                            <div className="analytics-stat">
                                <p>15</p>
                                <span>Posts</span>
                            </div>
                            <div className="analytics-stat">
                                <p>{milestones.length}</p>
                                <span>Milestones</span>
                            </div>
                        </div>

                        {/* Activity and Events */}
                        <div className="activity-events-container">
                            <div className="activity">
                                <h3>Activity</h3>
                                <p>Most recent to the top</p>
                            </div>
                            <div className="events">
                                <h3>Upcoming Events</h3>
                                <p>Joined and General</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="right-panel">
                    <div className="dashboard">
                        <h2>Dashboard</h2>
                        <p>Overview of completions</p>
                    </div>
                    <div className="tasks">
                        <h2>Tasks</h2>
                        <p>Overview of tasks</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeProfile;