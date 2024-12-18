import {getStoredEmployee, getToken} from "../../services/authService";

describe("authService", () => {
    describe("getStoredEmployee", () => {
        it("should return the stored employee object when it exists", () => {
            const employee = {id: 1, name: "John Doe"};
            localStorage.setItem("employee", JSON.stringify(employee));

            const result = getStoredEmployee();
            expect(result).toEqual(employee);
        });

        it("should return null when no employee is stored", () => {
            localStorage.removeItem("employee");

            const result = getStoredEmployee();
            expect(result).toBeNull();
        });
    });

    describe("getToken", () => {
        it("should return the stored token when it exists", () => {
            const token = "test-token";
            localStorage.setItem("token", token);

            const result = getToken();
            expect(result).toBe(token);
        });

        it("should return null when no token is stored", () => {
            localStorage.removeItem("token");

            const result = getToken();
            expect(result).toBeNull();
        });
    });
});
