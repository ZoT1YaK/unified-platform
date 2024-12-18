import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import {fetchMilestones, toggleMilestoneVisibility} from "../../services/milestoneService";

describe("milestoneService", () => {
    let mock;

    beforeEach(() => {
        mock = new MockAdapter(axios);
    });

    afterEach(() => {
        mock.restore();
    });

    describe("fetchMilestones", () => {
        it("should fetch milestones for a specific employee", async () => {
            const token = "test-token";
            const empId = "123";
            const milestones = [{id: 1, name: "Milestone 1"}];
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/milestones/get`;
            mock.onGet(endpoint).reply(config => {
                if (config.headers.Authorization === `Bearer ${token}` && config.params.emp_id === empId) {
                    return [200, {milestones}];
                }
                return [404];
            });

            const result = await fetchMilestones(token, empId);
            expect(result).toEqual(milestones);
        });

        it("should return 404 for invalid employee ID", async () => {
            const token = "test-token";
            const empId = "invalid-id";
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/milestones/get`;
            mock.onGet(endpoint).reply(config => {
                if (config.headers.Authorization === `Bearer ${token}` && config.params.emp_id === empId) {
                    return [404];
                }
                return [404];
            });

            await expect(fetchMilestones(token, empId)).rejects.toThrow();
        });

        it("should handle network error", async () => {
            const token = "test-token";
            const empId = "123";
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/milestones/get`;
            mock.onGet(endpoint).networkError();

            await expect(fetchMilestones(token, empId)).rejects.toThrow();
        });
    });

    describe("toggleMilestoneVisibility", () => {
        it("should toggle milestone visibility to true", async () => {
            const token = "test-token";
            const milestoneId = "1";
            const visibility = true;
            const updatedMilestone = {id: 1, visibility: true};
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/milestones/visibility`;
            mock.onPut(endpoint).reply(config => {
                if (config.headers.Authorization === `Bearer ${token}` && config.data === JSON.stringify({
                    milestone_id: milestoneId,
                    visibility
                })) {
                    return [200, {milestone: updatedMilestone}];
                }
                return [404];
            });

            const result = await toggleMilestoneVisibility(token, milestoneId, visibility);
            expect(result).toEqual(updatedMilestone);
        });

        it("should handle network error", async () => {
            const token = "test-token";
            const milestoneId = "1";
            const visibility = true;
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/milestones/visibility`;
            mock.onPut(endpoint).networkError();

            await expect(toggleMilestoneVisibility(token, milestoneId, visibility)).rejects.toThrow();
        });
    });
});
