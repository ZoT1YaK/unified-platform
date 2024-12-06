import React, { useState } from 'react';
import './TaskCard.css';

const TaskCard = ({ title, deadline, resources, isChecked, isAssignedByLeader }) => {
    const [showResources, setShowResources] = useState(false);

    const toggleResources = () => {
        setShowResources(!showResources);  // Toggle the visibility of resources
    };

    return (
        <div className="task-card">
            <div className="task-header">
                {/* Checkbox on the left */}
                <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => { }}
                    className="task-checkbox"
                />
                <h3>{title}</h3>
                {/* Deadline on the right */}
                {deadline && <p className="deadline">{deadline}</p>}
            </div>

            {/* Resources Button */}
            <button className="resources-btn" onClick={toggleResources}>
                Resources
            </button>

            {/* Resources Section */}
            {showResources && (
                <div className="resources">
                    <ul>
                        {resources.map((resource, index) => (
                            <li key={index}>{resource}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default TaskCard;
