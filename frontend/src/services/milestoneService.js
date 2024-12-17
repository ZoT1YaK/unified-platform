import axios from "axios";

/**
 * Fetch milestones for a specific employee.
 * @param {string} token - Authentication token.
 * @param {string} empId - Employee ID.
 * @returns {Promise<Array>} - List of milestones.
 */
export const fetchMilestones = async (token, empId) => {
    const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/milestones/get`,
        {
            headers: { Authorization: `Bearer ${token}` },
            params: { emp_id: empId },
        }
    );
    return response.data.milestones;
};

/**
 * Toggle milestone visibility.
 * @param {string} token - Authentication token.
 * @param {string} milestoneId - Milestone ID.
 * @param {boolean} visibility - New visibility state.
 * @returns {Promise<Object>} - Updated milestone.
 */
export const toggleMilestoneVisibility = async (token, milestoneId, visibility) => {
    const response = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/milestones/visibility`,
        { milestone_id: milestoneId, visibility },
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );
    return response.data.milestone;
};
