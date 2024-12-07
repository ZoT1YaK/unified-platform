import React from "react";
import "./Analytics.css";
import useAnalytics from "../../hooks/useAnalytics"; 

const Analytics = () => {
    const analytics = useAnalytics();

    return (
        <div className="analytics-container">
            <div className="analytics-item">
                <p>{analytics.achievementsCount}</p>
                <span>Achievements</span>
            </div>
            <div className="analytics-item">
                <p>{analytics.postsCount}</p>
                <span>Posts</span>
            </div>
            <div className="analytics-item">
                <p>{analytics.milestonesCount}</p>
                <span>Milestones</span>
            </div>
        </div>
    );
};
export default Analytics;
