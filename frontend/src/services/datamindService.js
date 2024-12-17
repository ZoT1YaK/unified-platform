import axios from "axios";

/**
 * Fetch available Datamind options.
 * @param {string} token - Authentication token.
 * @returns {Promise<Array>} - List of Datamind options.
 */
export const fetchDatamindOptions = async (token) => {
    const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/datamind/get`,
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );
    return response.data.dataMinds;
};


/**
 * Update the employee's Datamind.
 * @param {string} token - Authentication token.
 * @param {string} datamindId - The selected Datamind ID.
 * @returns {Promise<void>}
 */
export const updateEmployeeDatamind = async (token, datamindId) => {
    await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/employees/data-mind-type`,
        { datamind_id: datamindId },
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );
};

/**
 * Upload Datamind values.
 * @param {string} token - Authentication token.
 * @param {FormData} formData - File data.
 * @returns {Promise<Object>} - Upload response message.
 */
export const uploadDatamind = async (token, formData) => {
    const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/datamind/upload`, formData, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

/**
 * Reset all Datamind values.
 * @param {string} token - Authentication token.
 * @returns {Promise<Object>} - Reset response message.
 */
export const resetDatamind = async (token) => {
    const response = await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/datamind/reset`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};
