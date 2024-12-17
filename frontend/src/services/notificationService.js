import axios from "axios";

/**
 * Fetch notifications for the logged-in user.
 * @param {string} token - Authentication token.
 * @returns {Promise<Array>} - List of notifications.
 */
export const fetchNotifications = async (token) => {
    const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/notifications/get`,
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );
    return response.data.notifications;
};

/**
 * Mark a notification as read.
 * @param {string} token - Authentication token.
 * @param {string} notificationId - Notification ID.
 * @returns {Promise<void>}
 */
export const markNotificationAsRead = async (token, notificationId) => {
    await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/notifications/read`,
        { notification_id: notificationId },
        {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        }
    );
};

/**
 * Fetch notification preferences.
 * @param {string} token - Authentication token.
 * @returns {Promise<Array>} - List of notification preferences.
 */
export const fetchNotificationPreferences = async (token) => {
    const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/notifications/preferences`,
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );
    return response.data;
};

/**
 * Update a notification preference.
 * @param {string} token - Authentication token.
 * @param {string} notiTypeId - Notification type ID.
 * @param {boolean} preference - New preference state (true/false).
 * @returns {Promise<void>}
 */
export const updateNotificationPreference = async (token, notiTypeId, preference) => {
    await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/notifications/preferences`,
        { noti_type_id: notiTypeId, preference },
        {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        }
    );
};
