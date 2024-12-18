import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import {fetchDataMindType, fetchEmployeeProfile, fetchEmployees, loginEmployee} from "../../services/employeeService";

describe("employeeService", () => {
    let mock;

    beforeEach(() => {
        mock = new MockAdapter(axios);
    });

    afterEach(() => {
        mock.restore();
    });

    describe("fetchEmployeeProfile", () => {
        it("should fetch the employee profile for 'own' mode", async () => {
            const token = "test-token";
            const profile = {id: 1, name: "John Doe"};
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/employees/profile`;
            mock.onGet(endpoint).reply(config => {
                if (config.headers.Authorization === `Bearer ${token}`) {
                    return [200, {profile}];
                }
                return [404];
            });

            const result = await fetchEmployeeProfile(token);
            expect(result).toEqual(profile);
        });

        it("should fetch the employee profile for 'visited' mode", async () => {
            const token = "test-token";
            const empId = "123";
            const profile = {id: 123, name: "Jane Doe"};
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/employees/profile/${empId}`;
            mock.onGet(endpoint).reply(config => {
                if (config.headers.Authorization === `Bearer ${token}`) {
                    return [200, {profile}];
                }
                return [404];
            });

            const result = await fetchEmployeeProfile(token, empId, "visited");
            expect(result).toEqual(profile);
        });
    });

    describe("fetchDataMindType", () => {
        it("should fetch the employee's Datamind type", async () => {
            const token = "test-token";
            const employeeDatamind = {id: 1, type: "Type A"};
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/employees/get-data-mind-type`;
            mock.onGet(endpoint).reply(config => {
                if (config.headers.Authorization === `Bearer ${token}`) {
                    return [200, {employeeDatamind}];
                }
                return [404];
            });

            const result = await fetchDataMindType(token);
            expect(result).toEqual(employeeDatamind);
        });
    });

    describe("fetchEmployees", () => {
        it("should fetch all employees", async () => {
            const token = "test-token";
            const employees = [{id: 1, name: "John Doe"}, {id: 2, name: "Jane Doe"}];
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/employees/all`;
            mock.onGet(endpoint).reply(config => {
                if (config.headers.Authorization === `Bearer ${token}`) {
                    return [200, {employees}];
                }
                return [404];
            });

            const result = await fetchEmployees(token);
            expect(result).toEqual(employees);
        });
    });

    describe("loginEmployee", () => {
        it("should log in an employee and return token and profile", async () => {
            const email = "test@example.com";
            const password = "password";
            const responseData = {token: "test-token", employee: {id: 1, name: "John Doe"}};
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/employees/login`;
            mock.onPost(endpoint).reply(config => {
                if (config.data === JSON.stringify({email, password})) {
                    return [200, responseData];
                }
                return [404];
            });

            const result = await loginEmployee(email, password);
            expect(result).toEqual(responseData);
        });
    });
});
