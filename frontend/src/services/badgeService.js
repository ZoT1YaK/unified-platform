import axios from "axios";

/**
 * Fetch active badges.
 * @param {string} token - Authentication token.
 * @returns {Promise<Array>} - List of active badges.
 */
export const fetchActiveBadges = async (token) => {
    const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/badges/get-active`,
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );
    return response.data.badges || [];
};

/**
 * Fetch all badges (active and archived).
 * @param {string} token - Authentication token.
 * @returns {Promise<Object>} - Active and archived badges.
 */
export const fetchBadges = async (token) => {
    const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/badges/get`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return {
        activeBadges: response.data.activeBadges || [],
        archivedBadges: response.data.archivedBadges || [],
    };
};

/**
 * Upload a new badge file.
 * @param {string} token - Authentication token.
 * @param {FormData} formData - File data.
 * @returns {Promise<Object>} - Upload response message.
 */
export const uploadBadges = async (token, formData) => {
    const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/badges/upload`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

/**
 * Archive selected badges.
 * @param {string} token - Authentication token.
 * @param {Array<string>} badgeIds - List of badge IDs to archive.
 * @returns {Promise<Object>} - Archive response message.
 */
export const archiveBadges = async (token, badgeIds) => {
    const response = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/badges/archive`,
        { ids: badgeIds },
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );
    return response.data;
};

/**
 * Activate selected badges.
 * @param {string} token - Authentication token.
 * @param {Array<string>} badgeIds - List of badge IDs to activate.
 * @returns {Promise<Object>} - Activate response message.
 */
export const activateBadges = async (token, badgeIds) => {
    const response = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/badges/restore`,
        { ids: badgeIds },
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );
    return response.data;
};