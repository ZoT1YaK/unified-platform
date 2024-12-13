import React, { useEffect, useState } from "react";
import "./Analytics.css";

const Analytics = ({ empId = null }) => {
    const [analytics, setAnalytics] = useState({
        achievementsCount: 0,
        postsCount: 0,
        milestonesCount: 0,
    });

    useEffect(() => {
        const fetchAnalytics = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("No token found. Skipping analytics fetch.");
                return;
            }

            const endpoint = empId
                ? `${process.env.REACT_APP_BACKEND_URL}/api/analytics/${empId}`
                : `${process.env.REACT_APP_BACKEND_URL}/api/analytics`;

            console.log("Fetching analytics from:", endpoint); // Log the API endpoint

            try {
                const response = await fetch(endpoint, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    console.error("Error fetching analytics:", await response.text());
                    throw new Error(`Failed to fetch analytics: ${response.statusText}`);
                }

                const data = await response.json();
                setAnalytics({
                    achievementsCount: data.achievementsCount || 0,
                    postsCount: data.postsCount || 0,
                    milestonesCount: data.milestonesCount || 0,
                });

                console.log("Fetched analytics data:", data); // Add this log
            } catch (error) {
                console.error("Error fetching analytics:", error.message);
            }
        };

        fetchAnalytics();
    }, [empId]);

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
