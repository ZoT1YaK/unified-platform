import axios from "axios";

/**
 * Fetch the employee profile based on mode and ID.
 * @param {string} token - Authentication token.
 * @param {string|null} empId - Employee ID for "visited" mode.
 * @param {string} mode - Mode ("own" or "visited").
 * @returns {Promise<Object>} - Employee profile data.
 */
export const fetchEmployeeProfile = async (token, empId = null, mode = "own") => {
    const query = mode === "visited" ? `/${empId}` : "";
    const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/employees/profile${query}`,
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );
    return response.data.profile;
};


export const fetchDataMindType = async (token) => {
    const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/employees/get-data-mind-type`,
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );
    return response.data.employeeDatamind;
};

/**
 * Fetch all employees.
 * @param {string} token - Authentication token.
 * @returns {Promise<Array>} - List of employees.
 */
export const fetchEmployees = async (token) => {
    const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/employees/all`,
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );
    return response.data.employees || [];
};

/**
 * Log in an employee.
 * @param {string} email - Employee email.
 * @param {string} password - Employee password.
 * @returns {Promise<Object>} - Returns token and employee profile.
 * @throws {Error} - Throws error on failure.
 */
export const loginEmployee = async (email, password) => {
    const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/employees/login`,
        { email, password }
    );
    return response.data; // { token, employee }
};
