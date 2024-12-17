import axios from "axios";

/**
 * Fetch events from the backend.
 * @param {string} token - Authentication token.
 * @param {string} searchQuery - Optional search query for filtering events.
 * @returns {Promise<Array>} - List of events.
 */
export const fetchEvents = async (token, searchQuery = "") => {
    const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/events/get`,
        {
            headers: { Authorization: `Bearer ${token}` },
            params: { search: searchQuery },
        }
    );
    return response.data.events;
};

/**
 * Update RSVP status for an event.
 * @param {string} token - Authentication token.
 * @param {string} eventId - ID of the event.
 * @param {string} response - RSVP response ("Accepted" or "Declined").
 * @returns {Promise<void>}
 */
export const updateRSVP = async (token, eventId, response) => {
    await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/events/response`,
        { event_id: eventId, response },
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );
};

/**
 * Delete an event.
 * @param {string} token - Authentication token.
 * @param {string} eventId - ID of the event to delete.
 * @returns {Promise<void>}
 */
export const deleteEvent = async (token, eventId) => {
    await axios.delete(
        `${process.env.REACT_APP_BACKEND_URL}/api/events/delete/${eventId}`,
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );
};

/**
 * Fetch event resources (departments, teams, locations).
 * @param {string} token - Authentication token.
 * @returns {Promise<Object>} - Event resources.
 */
export const fetchEventResources = async (token) => {
    const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/events/resources`,
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );
    return response.data;
};

/**
 * Create a new event.
 * @param {string} token - Authentication token.
 * @param {Object} payload - Event data.
 * @returns {Promise<Object>} - Created event.
 */
export const createEvent = async (token, payload) => {
    const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/events/create`,
        payload,
        {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return response.data;
};