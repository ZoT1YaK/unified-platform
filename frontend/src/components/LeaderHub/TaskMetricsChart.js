import React, { useEffect, useRef, useState } from "react";
import { Chart, registerables } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { fetchTaskMetrics } from "../../services/metricsService";

Chart.register(...registerables, ChartDataLabels);

const TaskMetricsChart = () => {
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);
    const [taskMetrics, setTaskMetrics] = useState([]);
    const [error, setError] = useState(null);

    const token = localStorage.getItem("token");

    useEffect(() => {
        const loadTaskMetrics = async () => {
            try {
                const metrics = await fetchTaskMetrics(token);
                setTaskMetrics(metrics);
            } catch (err) {
                console.error("Error fetching task metrics:", err);
                setError("Failed to fetch task metrics. Please try again.");
            }
        };

        loadTaskMetrics();
    }, [token]);

    useEffect(() => {
        if (taskMetrics.length && chartRef.current) {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }

            const ctx = chartRef.current.getContext("2d");

            const labels = taskMetrics.map((task) => task.employeeName || "Unknown");
            const totalTasks = taskMetrics.map((task) => task.totalTasks);
            const completedTasks = taskMetrics.map((task) => task.completedTasks);
            const avgTaskSpeeds = taskMetrics.map((task) =>
                parseFloat(task.averageTaskSpeed).toFixed(2)
            );

            chartInstanceRef.current = new Chart(ctx, {
                type: "bar",
                data: {
                    labels,
                    datasets: [
                        {
                            label: "Total Tasks",
                            data: totalTasks,
                            backgroundColor: "rgba(75, 192, 192, 0.6)",
                            stack: "Tasks",
                        },
                        {
                            label: "Completed Tasks",
                            data: completedTasks,
                            backgroundColor: "rgba(54, 162, 235, 0.6)",
                            stack: "Tasks",
                        },
                        {
                            label: "Average Task Speed (days)",
                            data: avgTaskSpeeds,
                            backgroundColor: "rgba(255, 206, 86, 0.6)",
                            type: "line",
                            yAxisID: "y2",
                        },
                    ],
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: true,
                            position: "top",
                        },
                        tooltip: {
                            callbacks: {
                                label: (tooltipItem) => {
                                    const value = tooltipItem.raw;

                                    switch (tooltipItem.datasetIndex) {
                                        case 0:
                                            return `Total Tasks: ${value}`;
                                        case 1:
                                            return `Completed Tasks: ${value}`;
                                        case 2:
                                            return `Avg Task Speed: ${value} days`;
                                        default:
                                            return '';
                                    }
                                },
                                footer: (tooltipItems) => {
                                    const index = tooltipItems[0]?.dataIndex;
                                    const employeeName = taskMetrics[index]?.employeeName || "Unknown";
                                    return `Employee: ${employeeName}`;
                                },
                            },
                        },

                        datalabels: {
                            display: true,
                            color: "#000",
                            font: {
                                size: 12,
                            },
                            formatter: (value, context) => {
                                const datasetIndex = context.datasetIndex;
                                if (datasetIndex === 0) {
                                    return `Total: ${value}`;
                                } else if (datasetIndex === 1) {
                                    return `Completed: ${value}`;
                                } else if (datasetIndex === 2) {
                                    return `${value} days`;
                                }
                                return value;
                            },
                        },
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: "Employees",
                            },
                        },
                        y: {
                            title: {
                                display: true,
                                text: "Number of Tasks",
                            },
                            beginAtZero: true,
                        },
                        y2: {
                            title: {
                                display: true,
                                text: "Avg Task Speed (days)",
                            },
                            position: "right",
                            beginAtZero: true,
                            grid: {
                                drawOnChartArea: false,
                            },
                        },
                    },
                },
            });
        }

        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
        };
    }, [taskMetrics]);

    if (error) {
        return <p>{error}</p>;
    }

    if (!taskMetrics.length) {
        return <p>Loading task metrics...</p>;
    }

    return (
        <div className="task-metrics-chart">
            <h3>Task Metrics Breakdown</h3>
            <canvas ref={chartRef}></canvas>
        </div>
    );
};

export default TaskMetricsChart;
