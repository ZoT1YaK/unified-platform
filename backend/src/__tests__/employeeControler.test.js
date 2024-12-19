const Employee = require("../models/Employee");
const Datamind = require("../models/Datamind");
const Department = require("../models/Department");
const EmployeeDatamind = require("../models/EmployeeDatamind");
const employeeController = require("../controllers/employeeController");

jest.mock("../models/Employee");
jest.mock("../models/Datamind");
jest.mock("../models/Department");
jest.mock("../models/EmployeeDatamind");

beforeAll(() => {
  process.env.JWT_SECRET = "testsecret"; // Set the JWT_SECRET for the test environment
});
  
afterAll(() => {
  delete process.env.JWT_SECRET; // Clean up the environment variable after tests
});

describe("Employee Controller", () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console.error
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("loginEmployee", () => {
    it("should login an employee successfully and return a token", async () => {
      const mockEmployee = {
        _id: "employee_id",
        email: "test@example.com",
        comparePassword: jest.fn().mockResolvedValue(true),
        is_admin: false,
        is_people_leader: false,
        dep_id: { number: "D001", name: "IT Department" },
      };
  
      // Mock `findOne` to return an object with a `populate` method
      const mockQuery = {
        populate: jest.fn().mockResolvedValue(mockEmployee),
      };
  
      Employee.findOne.mockReturnValue(mockQuery); // Mock findOne to return the query
  
      const req = {
        body: { email: "test@example.com", password: "password123" },
      };
  
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  
      await employeeController.loginEmployee(req, res);
  
      expect(Employee.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
      expect(mockQuery.populate).toHaveBeenCalledWith("dep_id", "number name");
      expect(mockEmployee.comparePassword).toHaveBeenCalledWith("password123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Login successful",
          token: expect.any(String),
          employee: expect.objectContaining({
            _id: "employee_id",
            email: "test@example.com",
          }),
        })
      );
    });
  
    it("should return an error if email or password is missing", async () => {
      const req = { body: {} };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  
      await employeeController.loginEmployee(req, res);
  
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Email and password are required" });
    });
  
    it("should return an error if employee is not found", async () => {
      const mockQuery = {
        populate: jest.fn().mockResolvedValue(null),
      };
  
      Employee.findOne.mockReturnValue(mockQuery);
  
      const req = { body: { email: "test@example.com", password: "password123" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  
      await employeeController.loginEmployee(req, res);
  
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Employee not found" });
    });
  
    it("should return an error if password is incorrect", async () => {
      const mockEmployee = {
        _id: "employee_id",
        comparePassword: jest.fn().mockResolvedValue(false),
      };
  
      const mockQuery = {
        populate: jest.fn().mockResolvedValue(mockEmployee),
      };
  
      Employee.findOne.mockReturnValue(mockQuery);
  
      const req = { body: { email: "test@example.com", password: "wrongpassword" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  
      await employeeController.loginEmployee(req, res);
  
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Invalid email or password" });
    });
  });

  describe("getProfile", () => {
    it("should fetch the logged-in employee's profile successfully", async () => {
      const mockEmployee = {
        _id: "employee_id",
        email: "test@example.com",
        f_name: "John",
        l_name: "Doe",
        position: "Developer",
        language: "English",
        img_link: "http://example.com/image.jpg",
        dep_id: { number: "D001", name: "IT Department" },
      };
  
      // Mock `findById` to return an object with a `populate` method
      const mockQuery = {
        populate: jest.fn().mockResolvedValue(mockEmployee),
      };
  
      Employee.findById.mockReturnValue(mockQuery);
  
      const req = { user: { id: "employee_id" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  
      await employeeController.getProfile(req, res);
  
      expect(Employee.findById).toHaveBeenCalledWith("employee_id");
      expect(mockQuery.populate).toHaveBeenCalledWith("dep_id", "number name");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        profile: {
          id: "employee_id",
          email: "test@example.com",
          f_name: "John",
          l_name: "Doe",
          position: "Developer",
          language: "English",
          img_link: "http://example.com/image.jpg",
          department: { number: "D001", name: "IT Department" },
        },
      });
    });
  
    it("should return an error if employee is not found", async () => {
      // Mock `findById` to return an object with a `populate` method that resolves to `null`
      const mockQuery = {
        populate: jest.fn().mockResolvedValue(null),
      };
  
      Employee.findById.mockReturnValue(mockQuery);
  
      const req = { user: { id: "employee_id" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  
      await employeeController.getProfile(req, res);
  
      expect(Employee.findById).toHaveBeenCalledWith("employee_id");
      expect(mockQuery.populate).toHaveBeenCalledWith("dep_id", "number name");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Employee not found" });
    });
  
    it("should handle errors during fetching profile", async () => {
      Employee.findById.mockImplementationOnce(() => {
        throw new Error("Database error");
      });
  
      const req = { user: { id: "employee_id" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  
      await employeeController.getProfile(req, res);
  
      expect(Employee.findById).toHaveBeenCalledWith("employee_id");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });  

  describe("updateLanguage", () => {
    it("should update the preferred language of an employee", async () => {
      const mockEmployee = {
        _id: "employee_id",
        preferred_language: "fr",
      };

      Employee.findByIdAndUpdate.mockResolvedValueOnce(mockEmployee);

      const req = { user: { id: "employee_id" }, body: { language: "fr" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await employeeController.updateLanguage(req, res);

      expect(Employee.findByIdAndUpdate).toHaveBeenCalledWith(
        { _id: "employee_id" },
        { preferred_language: "fr" },
        { new: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Language updated successfully", language: "fr" });
    });

    it("should handle errors during language update", async () => {
      Employee.findByIdAndUpdate.mockRejectedValueOnce(new Error("Database error"));

      const req = { user: { id: "employee_id" }, body: { language: "fr" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await employeeController.updateLanguage(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });

  describe("updateEmployeeDatamind", () => {
    const validObjectId = "507f191e810c19729de860ea";
    it("should update or create an EmployeeDatamind entry successfully", async () => {
      // Mocking EmployeeDatamind.findOne to resolve to null (no existing entry)
      EmployeeDatamind.findOne.mockResolvedValueOnce(null);
  
      // Mocking EmployeeDatamind.create to resolve successfully
      EmployeeDatamind.create.mockResolvedValueOnce({
        emp_id: "employee_id",
        datamind_id: validObjectId,
      });
  
      const req = {
        user: { id: "employee_id" },
        body: { datamind_id: validObjectId },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  
      // Call the controller
      await employeeController.updateEmployeeDatamind(req, res);
  
      // Assertions
      expect(EmployeeDatamind.findOne).toHaveBeenCalledWith({ emp_id: "employee_id" });
      expect(EmployeeDatamind.create).toHaveBeenCalledWith({
        emp_id: "employee_id",
        datamind_id: validObjectId,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Employee data mind updated successfully.",
      });
    });
  
    it("should handle errors during EmployeeDatamind update", async () => {
      // Mocking EmployeeDatamind.findOne to throw an error
      EmployeeDatamind.findOne.mockRejectedValueOnce(new Error("Database error"));
  
      const req = {
        user: { id: "employee_id" },
        body: { datamind_id: validObjectId },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  
      // Call the controller
      await employeeController.updateEmployeeDatamind(req, res);
  
      // Assertions
      expect(EmployeeDatamind.findOne).toHaveBeenCalledWith({ emp_id: "employee_id" });
      expect(res.status).toHaveBeenCalledWith(500); // Ensure correct error handling
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });  
});