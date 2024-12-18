import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import {
    fetchDatamindOptions,
    resetDatamind,
    updateEmployeeDatamind,
    uploadDatamind
} from "../../services/datamindService";

describe("datamindService", () => {
    let mock;

    beforeEach(() => {
        mock = new MockAdapter(axios);
    });

    afterEach(() => {
        mock.restore();
    });

    describe("fetchDatamindOptions", () => {
        it("should fetch available Datamind options", async () => {
            const token = "test-token";
            const dataMinds = [{id: 1, name: "Datamind 1"}];
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/datamind/get`;
            mock.onGet(endpoint).reply(config => {
                if (config.headers.Authorization === `Bearer ${token}`) {
                    return [200, {dataMinds}];
                }
                return [404];
            });

            const result = await fetchDatamindOptions(token);
            expect(result).toEqual(dataMinds);
        });
    });

    describe("updateEmployeeDatamind", () => {
        it("should update the employee's Datamind", async () => {
            const token = "test-token";
            const datamindId = "1";
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/employees/data-mind-type`;
            mock.onPut(endpoint).reply(config => {
                if (config.headers.Authorization === `Bearer ${token}`) {
                    return [200];
                }
                return [404];
            });

            await expect(updateEmployeeDatamind(token, datamindId)).resolves.toBeUndefined();
        });
    });

    describe("uploadDatamind", () => {
        it("should upload Datamind values", async () => {
            const token = "test-token";
            const formData = new FormData();
            const responseMessage = {message: "Upload successful"};
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/datamind/upload`;
            mock.onPost(endpoint).reply(config => {
                if (config.headers.Authorization === `Bearer ${token}`) {
                    return [200, responseMessage];
                }
                return [404];
            });

            const result = await uploadDatamind(token, formData);
            expect(result).toEqual(responseMessage);
        });
    });

    describe("resetDatamind", () => {
        it("should reset all Datamind values", async () => {
            const token = "test-token";
            const responseMessage = {message: "Reset successful"};
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/datamind/reset`;
            mock.onDelete(endpoint).reply(config => {
                if (config.headers.Authorization === `Bearer ${token}`) {
                    return [200, responseMessage];
                }
                return [404];
            });

            const result = await resetDatamind(token);
            expect(result).toEqual(responseMessage);
        });
    });
});
