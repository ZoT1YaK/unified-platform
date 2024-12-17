import React, { useState, useEffect } from "react";
import { fetchNotifications, markNotificationAsRead } from "../../services/notificationService";
import "./Notifications.css";

const Notification = ({ showHistory, toggleHistory }) => {
    const [notifications, setNotifications] = useState([]);

    // Fetch notifications
    useEffect(() => {
        const loadNotifications = async () => {
            try {
                const token = localStorage.getItem("token");
                const fetchedNotifications = await fetchNotifications(token);
                setNotifications(fetchedNotifications);
            } catch (error) {
                console.error(
                    "Error fetching notifications:",
                    error.response?.data?.message || error.message
                );
            }
        };

        loadNotifications();
    }, []);

    // Mark notification as read
    const handleCheckboxChange = async (id) => {
        console.log("Checkbox clicked for notification:", id); // Debug log
        try {
            const token = localStorage.getItem("token");
            await markNotificationAsRead(token, id);

            console.log("Notification marked as read:", id); // Debug log
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
