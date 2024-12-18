import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import {fetchAchievements, toggleAchievementVisibility} from "../../services/achievementService";

describe("achievementService", () => {
    let mock;

    beforeEach(() => {
        mock = new MockAdapter(axios);
    });

    afterEach(() => {
        mock.restore();
    });

    describe("fetchAchievements", () => {
        it("should fetch achievements for a specific employee", async () => {
            const token = "test-token";
            const empId = "123";
            const achievements = [{id: 1, name: "Achievement 1"}];
            mock.onGet(`${process.env.REACT_APP_BACKEND_URL}/api/achievements/get`, {
                params: {emp_id: empId}
            }).reply(200, {achievements});

            const result = await fetchAchievements(token, empId);
            expect(result).toEqual(achievements);
        });

        it("should return an empty array if the employee has no achievements", async () => {
            const token = "test-token";
            const empId = "123";
            mock.onGet(`${process.env.REACT_APP_BACKEND_URL}/api/achievements/get`, {
                params: {emp_id: empId}
            }).reply(200, {achievements: []});

            const result = await fetchAchievements(token, empId);
            expect(result).toEqual([]);
        });

        it("should throw an error if the request fails", async () => {
            const token = "test-token";
            const empId = "123";
            mock.onGet(`${process.env.REACT_APP_BACKEND_URL}/api/achievements/get`, {
                params: {emp_id: empId}
            }).reply(500);

            await expect(fetchAchievements(token, empId)).rejects.toThrow();
        });
    });

    describe("toggleAchievementVisibility", () => {
        it("should toggle visibility of an achievement", async () => {
            const token = "test-token";
            const achievementId = "456";
            const visibility = true;
            const updatedAchievement = {id: 456, visibility: true};
            mock.onPut(`${process.env.REACT_APP_BACKEND_URL}/api/achievements/visibility`, {
                achievement_id: achievementId,
                visibility,
            }).reply(200, {achievement: updatedAchievement});

            const result = await toggleAchievementVisibility(token, achievementId, visibility);
            expect(result).toEqual(updatedAchievement);
        });

        it("should throw an error if the request fails", async () => {
            const token = "test-token";
            const achievementId = "456";
            const visibility = true;
            mock.onPut(`${process.env.REACT_APP_BACKEND_URL}/api/achievements/visibility`, {
                achievement_id: achievementId,
                visibility,
            }, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }).reply(500);

            await expect(toggleAchievementVisibility(token, achievementId, visibility)).rejects.toThrow();
        });
    });
});
