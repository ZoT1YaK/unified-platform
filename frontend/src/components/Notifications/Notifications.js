import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Notifications.css";

const Notification = ({ showHistory, toggleHistory }) => {
    const [notifications, setNotifications] = useState([]);

    // Fetch notifications
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(
                    `${process.env.REACT_APP_BACKEND_URL}/api/notifications/get`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setNotifications(response.data.notifications);
            } catch (error) {
                console.error(
                    "Error fetching notifications:",
                    error.response?.data?.message || error.message
                );
            }
        };

        fetchNotifications();
    }, []);

    // Mark notification as read
    const handleCheckboxChange = async (id) => {
        console.log("Checkbox clicked for notification:", id); // Debug log
        try {
            const token = localStorage.getItem("token");
            await axios.put(
                `${process.env.REACT_APP_BACKEND_URL}/api/notifications/read`,
                { notification_id: id },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log("Notification marked as read:", id); // Debug log
            // Update local state
            setNotifications((prev) =>
                prev.map((notification) =>
                    notification._id === id
                        ? { ...notification, status: "Read" }
                        : notification
                )
            );
        } catch (error) {
            console.error(
                "Error marking notification as read:",
                error.response?.data?.message || error.message
            );
        }
    };

    return (
        showHistory && (
            <div className="notification-history-dropdown">
                {notifications.length === 0 ? (
                    <p>No new notifications</p>
                ) : (
                    notifications.map((notification) => (
                        <div
                            key={notification._id}
                            className={`notification-item ${notification.status === "Read" ? "read" : "unread"
                                }`}
                        >
                            <strong>{notification.title}</strong>
                            <p>{notification.message}</p>
                            <small>
                                {new Date(notification.notification_date).toLocaleString()}
                            </small>
                            <input
                                type="checkbox"
                                checked={notification.status === "Read"}
                                onChange={() => handleCheckboxChange(notification._id)}
                            />
                        </div>
                    ))
                )}
            </div>
        )
    );
};

export default Notification;
