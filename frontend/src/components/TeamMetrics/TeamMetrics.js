import React, { useEffect, useState } from "react";
import axios from "axios";
import "./TeamMetrics.css";

const TeamMetrics = () => {
    const [metrics, setMetrics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_BACKEND_URL}/api/metrics/metrics`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );

                const groupedMetrics = {};
                response.data.metrics.forEach((metric) => {
                    const key = metric.employeeEmail;
                    if (
                        !groupedMetrics[key] ||
                        new Date(metric.snapshotDate) > new Date(groupedMetrics[key].snapshotDate)
                    ) {
                        groupedMetrics[key] = metric;
                    }
                });

                const filteredMetrics = Object.values(groupedMetrics);
                setMetrics(filteredMetrics);
            } catch (err) {
                console.error("Error fetching metrics:", err);
                setError("Failed to fetch metrics. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchMetrics();
    }, []);

    if (loading) {
        return <p>Loading team metrics...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div className="team-metrics">
            <h3>Team Metrics</h3>
            {metrics.length === 0 ? (
                <p>No data available for your team.</p>
            ) : (
                <div className="metrics-container">
                    {metrics.map((metric, index) => (
                        <div className="metric-card" key={index}>
                            <div className="metric-avatar">
                                <img
                                    src={metric.img_link || "/placeholder.png"}
                                    alt={`${metric.employeeName}'s Avatar`}
                                    className="metric-avatar-image"
                                />
                            </div>
                            <div className="metric-details">
                                <h4>{metric.employeeName}</h4>
                                <p>Tasks: {metric.totalTasks} ({metric.completedTasks} done)</p>
                                <p>Achievements: {metric.totalAchievements}</p>
                                <p>Milestones: {metric.milestonesAchieved}</p>
                                <p>Engagement Score: {metric.engagementScore}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TeamMetrics;
