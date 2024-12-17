import React, { useEffect, useState } from "react";
import { fetchAnalytics } from "../../services/analyticsService";
import { debounce } from "lodash";
import "./Analytics.css";

const Analytics = ({ empId = null }) => {
    const [analytics, setAnalytics] = useState({
        achievementsCount: 0,
        postsCount: 0,
        milestonesCount: 0,
    });

    useEffect(() => {
        const fetchAnalyticsData = debounce(async () => {
            const token = localStorage.getItem("token");
            if (!token) return;

            try {
                const data = await fetchAnalytics(token, empId);
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

        fetchAnalyticsData();
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
