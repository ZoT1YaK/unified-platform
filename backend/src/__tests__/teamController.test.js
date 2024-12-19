const mongoose = require("mongoose");
const teamController = require("../controllers/teamController");
const TeamEmployee = require("../models/TeamEmployee");

jest.mock("../models/TeamEmployee");

describe("Team Controller", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {}); // Suppress console.error in tests
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getTeamsByEmployee", () => {
    it("should fetch all teams associated with the logged-in employee", async () => {
      const mockTeams = [
        { _id: "team_id1", name: "Team A" },
        { _id: "team_id2", name: "Team B" },
      ];
      const mockTeamEmployees = [
        { team_id: mockTeams[0] },
        { team_id: mockTeams[1] },
      ];

      // Mock TeamEmployee.find
      const mockFind = {
        populate: jest.fn().mockResolvedValue(mockTeamEmployees),
      };

      TeamEmployee.find.mockReturnValue(mockFind);

      const req = { user: { id: "employee_id" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      // Call the controller
      await teamController.getTeamsByEmployee(req, res);

      // Assertions
      expect(TeamEmployee.find).toHaveBeenCalledWith({ emp_id: "employee_id" });
      expect(mockFind.populate).toHaveBeenCalledWith("team_id", "name");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ teams: mockTeams });
    });

    it("should return 404 if the employee has no teams", async () => {
      // Mock TeamEmployee.find to return an empty array
      const mockFind = {
        populate: jest.fn().mockResolvedValue([]),
      };

      TeamEmployee.find.mockReturnValue(mockFind);

      const req = { user: { id: "employee_id" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      // Call the controller
      await teamController.getTeamsByEmployee(req, res);

      // Assertions
      expect(TeamEmployee.find).toHaveBeenCalledWith({ emp_id: "employee_id" });
      expect(mockFind.populate).toHaveBeenCalledWith("team_id", "name");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "No teams found for the employee" });
    });

    it("should handle server errors gracefully", async () => {
      TeamEmployee.find.mockImplementation(() => {
        throw new Error("Database error");
      });

      const req = { user: { id: "employee_id" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      // Call the controller
      await teamController.getTeamsByEmployee(req, res);

      // Assertions
      expect(TeamEmployee.find).toHaveBeenCalledWith({ emp_id: "employee_id" });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });

  describe("getTeamMembers", () => {
    it("should fetch all members of a specific team", async () => {
      const mockMembers = [
        { _id: "emp_id1", f_name: "John", l_name: "Doe", position: "Developer", email: "john.doe@example.com" },
        { _id: "emp_id2", f_name: "Jane", l_name: "Smith", position: "Manager", email: "jane.smith@example.com" },
      ];
      const mockTeamEmployees = [
        { emp_id: mockMembers[0] },
        { emp_id: mockMembers[1] },
      ];

      // Mock TeamEmployee.find
      const mockFind = {
        populate: jest.fn().mockResolvedValue(mockTeamEmployees),
      };

      TeamEmployee.find.mockReturnValue(mockFind);

      const req = { params: { team_id: "team_id" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      // Call the controller
      await teamController.getTeamMembers(req, res);

      // Assertions
      expect(TeamEmployee.find).toHaveBeenCalledWith({ team_id: "team_id" });
      expect(mockFind.populate).toHaveBeenCalledWith("emp_id", "f_name l_name position email");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ members: mockMembers });
    });

    it("should return 404 if no members are found for the team", async () => {
      // Mock TeamEmployee.find to return an empty array
      const mockFind = {
        populate: jest.fn().mockResolvedValue([]),
      };

      TeamEmployee.find.mockReturnValue(mockFind);

      const req = { params: { team_id: "team_id" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      // Call the controller
      await teamController.getTeamMembers(req, res);

      // Assertions
      expect(TeamEmployee.find).toHaveBeenCalledWith({ team_id: "team_id" });
      expect(mockFind.populate).toHaveBeenCalledWith("emp_id", "f_name l_name position email");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "No members found for the team" });
    });

    it("should handle server errors gracefully", async () => {
      TeamEmployee.find.mockImplementation(() => {
        throw new Error("Database error");
      });

      const req = { params: { team_id: "team_id" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      // Call the controller
      await teamController.getTeamMembers(req, res);

      // Assertions
      expect(TeamEmployee.find).toHaveBeenCalledWith({ team_id: "team_id" });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });
});
