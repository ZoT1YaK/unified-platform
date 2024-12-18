import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import {activateBadges, archiveBadges, fetchActiveBadges, fetchBadges, uploadBadges} from "../../services/badgeService";

describe("badgeService", () => {
    let mock;

    beforeEach(() => {
        mock = new MockAdapter(axios);
    });

    afterEach(() => {
        mock.restore();
    });

    describe("fetchActiveBadges", () => {
        it("should fetch active badges", async () => {
            const token = "test-token";
            const badges = [{id: 1, name: "Badge 1"}];
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/badges/get-active`;
            mock.onGet(endpoint).reply(config => {
                if (config.headers.Authorization === `Bearer ${token}`) {
                    return [200, {badges}];
                }
                return [404];
            });

            const result = await fetchActiveBadges(token);
            expect(result).toEqual(badges);
        });
    });

    describe("fetchBadges", () => {
        it("should fetch all badges", async () => {
            const token = "test-token";
            const activeBadges = [{id: 1, name: "Active Badge"}];
            const archivedBadges = [{id: 2, name: "Archived Badge"}];
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/badges/get`;
            mock.onGet(endpoint).reply(config => {
                if (config.headers.Authorization === `Bearer ${token}`) {
                    return [200, {activeBadges, archivedBadges}];
                }
                return [404];
            });

            const result = await fetchBadges(token);
            expect(result).toEqual({activeBadges, archivedBadges});
        });
    });

    describe("uploadBadges", () => {
        it("should upload a new badge file", async () => {
            const token = "test-token";
            const formData = new FormData();
            const responseMessage = {message: "Upload successful"};
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/badges/upload`;
            mock.onPost(endpoint).reply(config => {
                if (config.headers.Authorization === `Bearer ${token}`) {
                    return [200, responseMessage];
                }
                return [404];
            });

            const result = await uploadBadges(token, formData);
            expect(result).toEqual(responseMessage);
        });
    });

    describe("archiveBadges", () => {
        it("should archive selected badges", async () => {
            const token = "test-token";
            const badgeIds = ["1", "2"];
            const responseMessage = {message: "Badges archived"};
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/badges/archive`;
            mock.onPut(endpoint).reply(config => {
                if (config.headers.Authorization === `Bearer ${token}`) {
                    return [200, responseMessage];
                }
                return [404];
            });

            const result = await archiveBadges(token, badgeIds);
            expect(result).toEqual(responseMessage);
        });
    });

    describe("activateBadges", () => {
        it("should activate selected badges", async () => {
            const token = "test-token";
            const badgeIds = ["1", "2"];
            const responseMessage = {message: "Badges activated"};
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/badges/restore`;
            mock.onPut(endpoint).reply(config => {
                if (config.headers.Authorization === `Bearer ${token}`) {
                    return [200, responseMessage];
                }
                return [404];
            });

            const result = await activateBadges(token, badgeIds);
            expect(result).toEqual(responseMessage);
        });
    });
});
