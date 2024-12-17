import axios from "axios";

/**
 * Fetch analytics data for the given employee.
 * @param {string} token - Authentication token.
 * @param {string|null} empId - Employee ID (optional).
 * @returns {Promise<Object>} - Analytics data with counts.
 */
export const fetchAnalytics = async (token, empId = null) => {
    const endpoint = empId
        ? `${process.env.REACT_APP_BACKEND_URL}/api/analytics/${empId}`
        : `${process.env.REACT_APP_BACKEND_URL}/api/analytics`;

    const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
};
