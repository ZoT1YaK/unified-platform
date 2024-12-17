import React, { useEffect, useState } from "react";
import { fetchTeamMetrics } from "../../services/metricsService";
import "./TeamMetrics.css";

const TeamMetrics = () => {
    const [metrics, setMetrics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const token = localStorage.getItem("token");

    useEffect(() => {
        const loadMetrics = async () => {
            try {
                const data = await fetchTeamMetrics(token);

                // Group metrics by employeeEmail and keep the latest snapshot
                const groupedMetrics = {};
                data.metrics.forEach((metric) => {
                    const key = metric.employeeEmail;
                    if (
                        !groupedMetrics[key] ||
                        new Date(metric.snapshotDate) > new Date(groupedMetrics[key].snapshotDate)
                    ) {
                        groupedMetrics[key] = metric;
                    }
                });

                setMetrics(Object.values(groupedMetrics));
            } catch (err) {
                console.error("Error fetching metrics:", err.message);
                setError("Failed to fetch metrics. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        loadMetrics();
    }, [token]);

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
