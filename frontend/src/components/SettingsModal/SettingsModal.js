import React, { useState } from "react";
import "./SettingsModal.css";

const SettingsModal = ({ onClose, isLeader }) => {
    const [toggles, setToggles] = useState({
        comments: true,
        tasks: true,
        events: true,
        mentions: false,
    });

    const [leaderToggles, setLeaderToggles] = useState({
        metrics: true,
        milestones: true,
    });

    const handleToggle = (key) => {
        setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const handleLeaderToggle = (key) => {
        setLeaderToggles((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="settings-modal-overlay" onClick={onClose}>
            <div
                className="settings-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <button className="close-button" onClick={onClose}>
                    &times;
                </button>
                <h2>Settings</h2>
                <div className="notification-preferences">
                    <h3>Notification Preferences</h3>
                    {Object.entries(toggles).map(([key, value]) => (
                        <div key={key} className="toggle-container">
                            <label>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                            <div
                                className={`toggle ${value ? "active" : "inactive"}`}
                                onClick={() => handleToggle(key)}
                            >
                                <div className="toggle-ball"></div>
                            </div>
                        </div>
                    ))}
                </div>
                {isLeader && (
                    <>
                        <hr />
                        <div className="leader-notifications">
                            <h3>Leader Notifications</h3>
                            {Object.entries(leaderToggles).map(([key, value]) => (
                                <div key={key} className="toggle-container">
                                    <label>
                                        {key === "metrics" ? "Metrics Report" : "Employee Milestone Reach"}
                                    </label>
                                    <div
                                        className={`toggle ${value ? "active" : "inactive"}`}
                                        onClick={() => handleLeaderToggle(key)}
                                    >
                                        <div className="toggle-ball"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default SettingsModal;
