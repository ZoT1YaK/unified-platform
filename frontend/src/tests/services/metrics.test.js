import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import {
    downloadReport,
    fetchEventMetrics,
    fetchReports,
    fetchTaskMetrics,
    fetchTeamMetrics,
    generateReport
} from "../../services/metricsService";

describe("metricsService", () => {
    let mock;

    beforeEach(() => {
        mock = new MockAdapter(axios);
    });

    afterEach(() => {
        mock.restore();
    });

    describe("fetchEventMetrics", () => {
        it("should fetch event metrics successfully", async () => {
            const token = "test-token";
            const metrics = {events: []};
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/metrics/team-events`;
            mock.onGet(endpoint).reply(config => {
                if (config.headers.Authorization === `Bearer ${token}`) {
                    return [200, metrics];
                }
                return [404];
            });

            const result = await fetchEventMetrics(token);
            expect(result).toEqual(metrics);
        });

        it("should handle network error", async () => {
            const token = "test-token";
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/metrics/team-events`;
            mock.onGet(endpoint).networkError();

            await expect(fetchEventMetrics(token)).rejects.toThrow();
        });
    });

    describe("fetchReports", () => {
        it("should fetch reports successfully", async () => {
            const token = "test-token";
            const reports = [{id: 1, name: "Report 1"}];
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/metrics/reports?start_date=2024-01-01&end_date=2024-12-31`;
            mock.onGet(endpoint).reply(config => {
                if (config.headers.Authorization === `Bearer ${token}`) {
                    return [200, {reports}];
                }
                return [404];
            });

            const result = await fetchReports(token);
            expect(result).toEqual(reports);
        });

        it("should handle network error", async () => {
            const token = "test-token";
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/metrics/reports?start_date=2024-01-01&end_date=2024-12-31`;
            mock.onGet(endpoint).networkError();

            await expect(fetchReports(token)).rejects.toThrow();
        });
    });

    describe("downloadReport", () => {
        it("should download report successfully", async () => {
            const token = "test-token";
            const reportId = "1";
            const blob = new Blob(["report content"], {type: "application/pdf"});
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/metrics/report/download/${reportId}`;
            mock.onGet(endpoint).reply(config => {
                if (config.headers.Authorization === `Bearer ${token}`) {
                    return [200, blob];
                }
                return [404];
            });

            const result = await downloadReport(token, reportId);
            expect(result).toEqual(blob);
        });

        it("should handle network error", async () => {
            const token = "test-token";
            const reportId = "1";
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/metrics/report/download/${reportId}`;
            mock.onGet(endpoint).networkError();

            await expect(downloadReport(token, reportId)).rejects.toThrow();
        });
    });

    describe("generateReport", () => {
        it("should generate report successfully", async () => {
            const token = "test-token";
            const response = {message: "Report generated"};
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/metrics/report`;
            mock.onPost(endpoint).reply(config => {
                if (config.headers.Authorization === `Bearer ${token}`) {
                    return [200, response];
                }
                return [404];
            });

            const result = await generateReport(token);
            expect(result).toEqual(response);
        });

        it("should handle network error", async () => {
            const token = "test-token";
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/metrics/report`;
            mock.onPost(endpoint).networkError();

            await expect(generateReport(token)).rejects.toThrow();
        });
    });

    describe("fetchTaskMetrics", () => {
        it("should fetch task metrics successfully", async () => {
            const token = "test-token";
            const taskBreakdown = [{id: 1, task: "Task 1"}];
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/metrics/team-tasks`;
            mock.onGet(endpoint).reply(config => {
                if (config.headers.Authorization === `Bearer ${token}`) {
                    return [200, {taskBreakdown}];
                }
                return [404];
            });

            const result = await fetchTaskMetrics(token);
            expect(result).toEqual(taskBreakdown);
        });

        it("should handle network error", async () => {
            const token = "test-token";
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/metrics/team-tasks`;
            mock.onGet(endpoint).networkError();

            await expect(fetchTaskMetrics(token)).rejects.toThrow();
        });
    });

    describe("fetchTeamMetrics", () => {
        it("should fetch team metrics successfully", async () => {
            const token = "test-token";
            const metrics = {teams: []};
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/metrics/metrics`;
            mock.onGet(endpoint).reply(config => {
                if (config.headers.Authorization === `Bearer ${token}`) {
                    return [200, metrics];
                }
                return [404];
            });

            const result = await fetchTeamMetrics(token);
            expect(result).toEqual(metrics);
        });

        it("should handle network error", async () => {
            const token = "test-token";
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/metrics/metrics`;
            mock.onGet(endpoint).networkError();

            await expect(fetchTeamMetrics(token)).rejects.toThrow();
        });
    });
});
