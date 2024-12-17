import axios from "axios";

/**
 * Fetch all tasks for the leader.
 * @param {string} token - Authentication token.
 * @param {string} searchQuery - Optional search query.
 * @returns {Promise<Array>} - List of tasks.
 */
export const fetchTasks = async (token, searchQuery = "") => {
    const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/tasks/leader`,
        {
            headers: { Authorization: `Bearer ${token}` },
            params: { search: searchQuery },
        }
    );
    return response.data.tasks;
};

/**
 * Edit an assigned task.
 * @param {string} token - Authentication token.
 * @param {Object} updatedTask - Task details to update.
 * @returns {Promise<Object>} - Updated task data.
 */
export const editTask = async (token, updatedTask) => {
    const response = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/tasks/edit-assigned`,
        updatedTask,
        {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return response.data;
};

/**
 * Delete an assigned task.
 * @param {string} token - Authentication token.
 * @param {string} taskId - ID of the task to delete.
 * @returns {Promise<void>}
 */
export const deleteTask = async (token, taskId) => {
    await axios.delete(
        `${process.env.REACT_APP_BACKEND_URL}/api/tasks/delete`,
        {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            data: { task_id: taskId }, // DELETE body for Axios
        }
    );
};


/**
 * Fetch tasks assigned to the employee.
 * @param {string} token - Authentication token.
 * @param {string} searchQuery - Optional search query.
 * @returns {Promise<Array>} - List of tasks.
 */
export const fetchEmployeeTasks = async (token, searchQuery = "") => {
    const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/tasks/employee`,
        {
            headers: { Authorization: `Bearer ${token}` },
            params: { search: searchQuery },
        }
    );
    return response.data.tasks;
};

/**
 * Edit an existing task.
 * @param {string} token - Authentication token.
 * @param {Object} task - Task data.
 * @returns {Promise<Object>} - Updated task.
 */
export const editOwnTask = async (token, task) => {
    const response = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/tasks/edit-own`,
        task,
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );
    return response.data.task;
};

/**
 * Create a new task.
 * @param {string} token - Authentication token.
 * @param {Object} task - Task data.
 * @returns {Promise<Object>} - Created task.
 */
export const createTask = async (token, task) => {
    const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/tasks/create`,
        task,
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );
    return response.data.task;
};


/**
 * Toggle task status.
 * @param {string} token - Authentication token.
 * @param {string} taskId - ID of the task.
 * @param {string} status - New status ("Completed" or "Pending").
 * @returns {Promise<Object>} - Updated task.
 */
export const toggleTaskStatus = async (token, taskId, status) => {
    const response = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/tasks/complete`,
        { task_id: taskId, status },
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );
    return response.data;
};
