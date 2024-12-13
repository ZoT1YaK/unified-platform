import React, { useEffect, useRef, useState } from "react";
import { Chart, registerables } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import axios from "axios";

Chart.register(...registerables, ChartDataLabels);

const EventMetricsChart = () => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [eventMetrics, setEventMetrics] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEventMetrics = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/metrics/team-events`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`, 
            },
          }
        );
        setEventMetrics(response.data);
      } catch (err) {
        console.error("Error fetching event metrics:", err);
        setError("Failed to fetch event metrics.");
      }
    };

    fetchEventMetrics();
  }, []);

  useEffect(() => {
    if (eventMetrics && chartRef.current) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      const ctx = chartRef.current.getContext("2d");
      const { responseBreakdown } = eventMetrics;

      chartInstanceRef.current = new Chart(ctx, {
        type: "pie",
        data: {
          labels: ["Accepted", "Declined", "Pending"],
          datasets: [
            {
              data: [
                responseBreakdown.Accepted.length,
                responseBreakdown.Declined.length,
                responseBreakdown.Pending.length,
              ],
              backgroundColor: [
                "rgba(75, 192, 192, 0.6)", // Accepted
                "rgba(255, 99, 132, 0.6)", // Declined
                "rgba(255, 206, 86, 0.6)", // Pending
              ],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          aspectRatio: 1.5,
          plugins: {
            legend: {
              display: true,
              position: "top",
            },
            tooltip: {
              callbacks: {
                label: function (tooltipItem) {
                  const category = tooltipItem.label; // Accepted, Declined, Pending
                  const titles =
                    category === "Accepted"
                      ? responseBreakdown.Accepted
                      : category === "Declined"
                      ? responseBreakdown.Declined
                      : responseBreakdown.Pending;

                  const count = titles.length;

                  const detailedTitles = titles
                    .map((title) => `${title} (1)`) 
                    .join("\n");

                  return `${category} (${count} events):\n${detailedTitles}`;
                },
              },
            },
            datalabels: {
              color: "#000", 
              font: {
                size: 14,
              },
              formatter: (value, context) => {
                const category = context.chart.data.labels[context.dataIndex];
                return `${category}: ${value}`;
              },
              anchor: "end",
              align: "start",
              offset: 5,
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
  }, [eventMetrics]);

  if (error) {
    return <p>{error}</p>;
  }

  if (!eventMetrics) {
    return <p>Loading event metrics...</p>;
  }

  return (
    <div className="event-metrics-chart">
      <h3>Event Participation Overview</h3>
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default EventMetricsChart;
