import React, { useEffect, useState } from "react";
import axios from "axios";
import { debounce } from "lodash";
import "./Analytics.css";

const Analytics = ({ empId = null }) => {
    const [analytics, setAnalytics] = useState({
        achievementsCount: 0,
        postsCount: 0,
        milestonesCount: 0,
    });

    useEffect(() => {
        const fetchAnalytics = debounce(async () => {
            const token = localStorage.getItem("token");
            if (!token) return;
    
            const endpoint = empId
                ? `${process.env.REACT_APP_BACKEND_URL}/api/analytics/${empId}`
                : `${process.env.REACT_APP_BACKEND_URL}/api/analytics`;
    
            try {
                const response = await axios.get(endpoint, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const data = response.data;
                setAnalytics({
                    achievementsCount: data.achievementsCount || 0,
                    postsCount: data.postsCount || 0,
                    milestonesCount: data.milestonesCount || 0,
                });
            } catch (error) {
                console.error(
                    "Error fetching analytics:",
                    error.response?.data?.message || error.message
                );
            }
        }, 1000); // 1-second debounce
    
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
