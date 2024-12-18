import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import {
    createTask,
    deleteTask,
    editOwnTask,
    editTask,
    fetchEmployeeTasks,
    fetchTasks,
    toggleTaskStatus
} from "../../services/taskService";

describe("taskService", () => {
    let mock;

    beforeEach(() => {
        mock = new MockAdapter(axios);
    });

    afterEach(() => {
        mock.restore();
    });

    describe("fetchTasks", () => {
        it("should fetch all tasks for the leader", async () => {
            const token = "test-token";
            const tasks = [{id: 1, name: "Task 1"}];
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/tasks/leader`;
            mock.onGet(endpoint).reply(config => {
                if (config.headers.Authorization === `Bearer ${token}`) {
                    return [200, {tasks}];
                }
                return [404];
            });

            const result = await fetchTasks(token);
            expect(result).toEqual(tasks);
        });

        it("should handle network error", async () => {
            const token = "test-token";
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/tasks/leader`;
            mock.onGet(endpoint).networkError();

            await expect(fetchTasks(token)).rejects.toThrow();
        });
    });

    describe("editTask", () => {
        it("should edit an assigned task", async () => {
            const token = "test-token";
            const updatedTask = {id: 1, name: "Updated Task"};
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/tasks/edit-assigned`;
            mock.onPut(endpoint).reply(config => {
                if (config.headers.Authorization === `Bearer ${token}` && config.data === JSON.stringify(updatedTask)) {
                    return [200, updatedTask];
                }
                return [404];
            });

            const result = await editTask(token, updatedTask);
            expect(result).toEqual(updatedTask);
        });

        it("should handle network error", async () => {
            const token = "test-token";
            const updatedTask = {id: 1, name: "Updated Task"};
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/tasks/edit-assigned`;
            mock.onPut(endpoint).networkError();

            await expect(editTask(token, updatedTask)).rejects.toThrow();
        });
    });

    describe("deleteTask", () => {
        it("should delete an assigned task", async () => {
            const token = "test-token";
            const taskId = "1";
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/tasks/delete`;
            mock.onDelete(endpoint).reply(config => {
                if (config.headers.Authorization === `Bearer ${token}` && config.data === JSON.stringify({task_id: taskId})) {
                    return [200];
                }
                return [404];
            });

            await expect(deleteTask(token, taskId)).resolves.toBeUndefined();
        });

        it("should handle network error", async () => {
            const token = "test-token";
            const taskId = "1";
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/tasks/delete`;
            mock.onDelete(endpoint).networkError();

            await expect(deleteTask(token, taskId)).rejects.toThrow();
        });
    });

    describe("fetchEmployeeTasks", () => {
        it("should fetch tasks assigned to the employee", async () => {
            const token = "test-token";
            const tasks = [{id: 1, name: "Task 1"}];
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/tasks/employee`;
            mock.onGet(endpoint).reply(config => {
                if (config.headers.Authorization === `Bearer ${token}`) {
                    return [200, {tasks}];
                }
                return [404];
            });

            const result = await fetchEmployeeTasks(token);
            expect(result).toEqual(tasks);
        });

        it("should handle network error", async () => {
            const token = "test-token";
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/tasks/employee`;
            mock.onGet(endpoint).networkError();

            await expect(fetchEmployeeTasks(token)).rejects.toThrow();
        });
    });

    describe("editOwnTask", () => {
        it("should edit an existing task", async () => {
            const token = "test-token";
            const task = {id: 1, name: "Edited Task"};
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/tasks/edit-own`;
            mock.onPut(endpoint).reply(config => {
                if (config.headers.Authorization === `Bearer ${token}` && config.data === JSON.stringify(task)) {
                    return [200, {task}];
                }
                return [404];
            });

            const result = await editOwnTask(token, task);
            expect(result).toEqual(task);
        });

        it("should handle network error", async () => {
            const token = "test-token";
            const task = {id: 1, name: "Edited Task"};
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/tasks/edit-own`;
            mock.onPut(endpoint).networkError();

            await expect(editOwnTask(token, task)).rejects.toThrow();
        });
    });

    describe("createTask", () => {
        it("should create a new task", async () => {
            const token = "test-token";
            const task = {name: "New Task"};
            const createdTask = {id: 1, name: "New Task"};
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/tasks/create`;
            mock.onPost(endpoint).reply(config => {
                if (config.headers.Authorization === `Bearer ${token}` && config.data === JSON.stringify(task)) {
                    return [200, {task: createdTask}];
                }
                return [404];
            });

            const result = await createTask(token, task);
            expect(result).toEqual(createdTask);
        });

        it("should handle network error", async () => {
            const token = "test-token";
            const task = {name: "New Task"};
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/tasks/create`;
            mock.onPost(endpoint).networkError();

            await expect(createTask(token, task)).rejects.toThrow();
        });
    });

    describe("toggleTaskStatus", () => {
        it("should toggle task status", async () => {
            const token = "test-token";
            const taskId = "1";
            const status = "Completed";
            const updatedTask = {id: 1, status: "Completed"};
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/tasks/complete`;
            mock.onPut(endpoint).reply(config => {
                if (config.headers.Authorization === `Bearer ${token}` && config.data === JSON.stringify({
                    task_id: taskId,
                    status
                })) {
                    return [200, updatedTask];
                }
                return [404];
            });

            const result = await toggleTaskStatus(token, taskId, status);
            expect(result).toEqual(updatedTask);
        });

        it("should handle network error", async () => {
            const token = "test-token";
            const taskId = "1";
            const status = "Completed";
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/tasks/complete`;
            mock.onPut(endpoint).networkError();

            await expect(toggleTaskStatus(token, taskId, status)).rejects.toThrow();
        });
    });
});
