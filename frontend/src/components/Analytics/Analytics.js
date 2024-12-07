import React from "react";
import "./Analytics.css";

const Analytics = ({ achievementsCount, postsCount, milestonesCount }) => {
    return (
        <div className="analytics-container">
            <div className="analytics-item">
                <p>{achievementsCount}</p>
                <span>Achievements</span>
            </div>
            <div className="analytics-item">
                <p>{postsCount}</p>
                <span>Posts</span>
            </div>
            <div className="analytics-item">
                <p>{milestonesCount}</p>
                <span>Milestones</span>
            </div>
        </div>
    );
};

export default Analytics;
