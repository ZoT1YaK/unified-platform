import React from 'react';
import './Analytics.css';

const Analytics = ({ achievementsCount, postsCount, milestonesCount }) => {
    return (
        <div className="analytics-container">
            <div className="analytics-stat">
                <p>{achievementsCount}</p>
                <span>Achievements</span>
            </div>
            <div className="analytics-stat">
                <p>{postsCount}</p>
                <span>Posts</span>
            </div>
            <div className="analytics-stat">
                <p>{milestonesCount}</p>
                <span>Milestones</span>
            </div>
        </div>
    );
};

export default Analytics;
