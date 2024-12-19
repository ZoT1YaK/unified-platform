const Achievement = require("../models/Achievement");
const Milestone = require("../models/Milestone");
const Post = require("../models/Post");
const analyticsController = require("../controllers/analyticsController");

jest.mock("../models/Achievement");
jest.mock("../models/Milestone");
jest.mock("../models/Post");

describe("Analytics Controller", () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console.error
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getEmployeeAnalytics", () => {
    it("should fetch analytics for the logged-in employee", async () => {
      Achievement.countDocuments.mockResolvedValueOnce(5);
      Post.countDocuments.mockResolvedValueOnce(10);
      Milestone.countDocuments.mockResolvedValueOnce(3);

      const req = { params: {}, user: { id: "employee_id" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await analyticsController.getEmployeeAnalytics(req, res);

      expect(Achievement.countDocuments).toHaveBeenCalledWith({ emp_id: "employee_id" });
      expect(Post.countDocuments).toHaveBeenCalledWith({ emp_id: "employee_id" });
      expect(Milestone.countDocuments).toHaveBeenCalledWith({ emp_id: "employee_id" });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        achievementsCount: 5,
        postsCount: 10,
        milestonesCount: 3,
      });
    });

    it("should fetch analytics for a specific employee if empId is provided", async () => {
      Achievement.countDocuments.mockResolvedValueOnce(2);
      Post.countDocuments.mockResolvedValueOnce(7);
      Milestone.countDocuments.mockResolvedValueOnce(1);

      const req = { params: { empId: "other_employee_id" }, user: { id: "logged_in_id" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await analyticsController.getEmployeeAnalytics(req, res);

      expect(Achievement.countDocuments).toHaveBeenCalledWith({ emp_id: "other_employee_id" });
      expect(Post.countDocuments).toHaveBeenCalledWith({ emp_id: "other_employee_id" });
      expect(Milestone.countDocuments).toHaveBeenCalledWith({ emp_id: "other_employee_id" });

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        achievementsCount: 2,
        postsCount: 7,
        milestonesCount: 1,
      });
    });

    it("should handle errors gracefully", async () => {
      Achievement.countDocuments.mockRejectedValueOnce(new Error("Database error"));

      const req = { params: {}, user: { id: "employee_id" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await analyticsController.getEmployeeAnalytics(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });
});
