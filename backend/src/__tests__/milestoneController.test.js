const mongoose = require("mongoose");
const Milestone = require("../models/Milestone");
const milestoneController = require("../controllers/milestoneController");

jest.mock("../models/Milestone");

describe("Milestone Controller", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {}); // Suppress console.error
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe("getMilestonesByEmployee", () => {
    it("should fetch milestones for the logged-in employee", async () => {
      const mockMilestones = [
        { _id: "milestone1", name: "Milestone 1", description: "Description 1" },
        { _id: "milestone2", name: "Milestone 2", description: "Description 2" },
      ];

      const mockFind = {
        sort: jest.fn().mockResolvedValue(mockMilestones),
      };

      Milestone.find.mockReturnValue(mockFind);

      const req = { user: { id: "logged_in_user_id" }, query: {} };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await milestoneController.getMilestonesByEmployee(req, res);

      expect(Milestone.find).toHaveBeenCalledWith({
        emp_id: "logged_in_user_id",
      });
      expect(mockFind.sort).toHaveBeenCalledWith({ date_unlocked: -1 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ milestones: mockMilestones });
    });

    it("should handle errors when fetching milestones", async () => {
      Milestone.find.mockImplementation(() => {
        throw new Error("Database error");
      });

      const req = { user: { id: "logged_in_user_id" }, query: {} };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await milestoneController.getMilestonesByEmployee(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });

  describe("updateMilestoneVisibility", () => {
    const validObjectId = "507f191e810c19729de860ea";

    it("should update the visibility of a milestone", async () => {
      const mockUpdatedMilestone = {
        _id: validObjectId,
        visibility: true,
        name: "Milestone Name",
      };

      Milestone.findOneAndUpdate.mockResolvedValue(mockUpdatedMilestone);

      const req = {
        user: { id: "employee_id" },
        body: { milestone_id: validObjectId, visibility: true },
      };

      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await milestoneController.updateMilestoneVisibility(req, res);

      expect(Milestone.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: validObjectId, emp_id: "employee_id" },
        { visibility: true },
        { new: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Milestone visibility updated successfully",
        milestone: mockUpdatedMilestone,
      });
    });

    it("should return 404 if the milestone is not found", async () => {
      Milestone.findOneAndUpdate.mockResolvedValue(null);

      const req = {
        user: { id: "employee_id" },
        body: { milestone_id: validObjectId, visibility: true },
      };

      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await milestoneController.updateMilestoneVisibility(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Milestone not found or not authorized to update",
      });
    });

    it("should return 400 for an invalid milestone ID", async () => {
      const req = {
        user: { id: "employee_id" },
        body: { milestone_id: "invalid_id", visibility: true },
      };

      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await milestoneController.updateMilestoneVisibility(req, res);

      expect(Milestone.findOneAndUpdate).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Invalid milestone ID" });
    });

    it("should return 500 if there is a server error", async () => {
      Milestone.findOneAndUpdate.mockRejectedValue(new Error("Database error"));

      const req = {
        user: { id: "employee_id" },
        body: { milestone_id: validObjectId, visibility: true },
      };

      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await milestoneController.updateMilestoneVisibility(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });
});
