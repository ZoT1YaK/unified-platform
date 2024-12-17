import axios from "axios";

/**
 * Fetch team event metrics.
 * @param {string} token - Authentication token.
 * @returns {Promise<Object>} - Event metrics data.
 */
export const fetchEventMetrics = async (token) => {
    const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/metrics/team-events`,
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );
    return response.data;
};

/**
 * Fetch available reports.
 * @param {string} token - Authentication token.
 * @returns {Promise<Array>} - List of reports.
 */
export const fetchReports = async (token) => {
    const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/metrics/reports?start_date=2024-01-01&end_date=2024-12-31`,
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );
    return response.data.reports;
};

/**
 * Download a specific report.
 * @param {string} token - Authentication token.
 * @param {string} reportId - ID of the report to download.
 * @returns {Promise<Blob>} - Report file as a Blob.
 */
export const downloadReport = async (token, reportId) => {
    const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/metrics/report/download/${reportId}`,
        {
            responseType: "blob",
            headers: { Authorization: `Bearer ${token}` },
        }
    );
    return response.data;
};

/**
 * Generate a new report.
 * @param {string} token - Authentication token.
 * @returns {Promise<Object>} - Response after generating the report.
 */
export const generateReport = async (token) => {
    const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/metrics/report`,
        {},
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );
    return response.data;
};

/**
 * Fetch team task metrics.
 * @param {string} token - Authentication token.
 * @returns {Promise<Array>} - Breakdown of task metrics by employee.
 */
export const fetchTaskMetrics = async (token) => {
    const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/metrics/team-tasks`,
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );
    return response.data.taskBreakdown || [];
};

/**
 * Fetch team metrics for all employees.
 * @param {string} token - Authentication token.
 * @returns {Promise<Object>} - List of team metrics.
 */
export const fetchTeamMetrics = async (token) => {
    const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/metrics/metrics`,
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );
    return response.data;
};
