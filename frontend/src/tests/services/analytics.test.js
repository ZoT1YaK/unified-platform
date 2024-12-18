import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import {fetchAnalytics} from "../../services/analyticsService";

describe("analyticsService", () => {
    let mock;

    beforeEach(() => {
        mock = new MockAdapter(axios);
    });

    afterEach(() => {
        mock.restore();
    });

    describe("fetchAnalytics", () => {
        it("should fetch analytics data for a specific employee", async () => {
            const token = "test-token";
            const empId = "123";
            const analyticsData = {count: 10};
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/analytics/${empId}`;
            mock.onGet(endpoint).reply(config => {
                if (config.headers.Authorization === `Bearer ${token}`) {
                    return [200, analyticsData];
                }
                return [404];
            });

            const result = await fetchAnalytics(token, empId);
            expect(result).toEqual(analyticsData);
        });

        it("should fetch analytics data for all employees when empId is null", async () => {
            const token = "test-token";
            const analyticsData = {count: 100};
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/analytics`;
            mock.onGet(endpoint).reply(config => {
                if (config.headers.Authorization === `Bearer ${token}`) {
                    return [200, analyticsData];
                }
                return [404];
            });

            const result = await fetchAnalytics(token);
            expect(result).toEqual(analyticsData);
        });

        it("should throw an error if the request fails", async () => {
            const token = "test-token";
            const empId = "123";
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/analytics/${empId}`;
            mock.onGet(endpoint).reply(config => {
                if (config.headers.Authorization === `Bearer ${token}`) {
                    return [500];
                }
                return [404];
            });

            await expect(fetchAnalytics(token, empId)).rejects.toThrow();
        });
    });
});
