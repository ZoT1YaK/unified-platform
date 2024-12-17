import axios from "axios";

/**
 * Fetch achievements for a specific employee.
 * @param {string} token - Authentication token.
 * @param {string} empId - Employee ID.
 * @returns {Promise<Array>} - List of achievements.
 */
export const fetchAchievements = async (token, empId) => {
    const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/achievements/get`,
        {
            headers: { Authorization: `Bearer ${token}` },
            params: { emp_id: empId },
        }
    );
    return response.data.achievements;
};

/**
 * Toggle visibility of an achievement.
 * @param {string} token - Authentication token.
 * @param {string} achievementId - Achievement ID.
 * @param {boolean} visibility - New visibility state.
 * @returns {Promise<Object>} - Updated achievement data.
 */
export const toggleAchievementVisibility = async (token, achievementId, visibility) => {
    const response = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/achievements/visibility`,
        {
            achievement_id: achievementId,
            visibility,
        },
        {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return response.data.achievement;
};
