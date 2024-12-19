const achievementController = require("../controllers/achievementController");
const Achievement = require("../models/Achievement");

jest.mock("../models/Achievement");

describe("Achievement Controller", () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console.error
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAchievementsByEmployee", () => {
    it("should fetch achievements for the logged-in user", async () => {
      const mockAchievements = [
        {
          emp_id: "employee_id",
          badge_id: { name: "Badge Name", description: "Badge Description", img_link: "link" },
          related_entity_id: { title: "Event Title", description: "Event Description" },
          visibility: true,
          achievement_date: new Date(),
        },
      ];

      // Mock the chain: find() -> populate() -> populate() -> sort()
      const mockFind = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockAchievements),
      };

      Achievement.find.mockReturnValue(mockFind);

      const req = { user: { id: "employee_id" }, query: {} }; // No emp_id in query
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await achievementController.getAchievementsByEmployee(req, res);

      expect(Achievement.find).toHaveBeenCalledWith({ emp_id: "employee_id" });
      expect(mockFind.populate).toHaveBeenCalledWith("badge_id", "name description img_link");
      expect(mockFind.populate).toHaveBeenCalledWith("related_entity_id", "title description");
      expect(mockFind.sort).toHaveBeenCalledWith({ achievement_date: -1 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ achievements: mockAchievements });
    });

    it("should return 500 if there is a server error", async () => {
      const mockFind = {
        populate: jest.fn().mockImplementation(() => {
          throw new Error("Database error");
        }),
        sort: jest.fn(),
      };

      Achievement.find.mockReturnValue(mockFind);

      const req = { user: { id: "employee_id" }, query: {} };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await achievementController.getAchievementsByEmployee(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });

  describe("updateAchievementVisibility", () => {
    const validObjectId = "507f191e810c19729de860ea";

    it("should update visibility of an achievement for the logged-in user", async () => {
      const mockUpdatedAchievement = {
        _id: validObjectId,
        emp_id: "employee_id",
        visibility: false,
      };
    
      Achievement.findOneAndUpdate.mockResolvedValue(mockUpdatedAchievement);
    
      const req = {
        user: { id: "employee_id" },
        body: { achievement_id: validObjectId, visibility: false },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    
      await achievementController.updateAchievementVisibility(req, res);
    
      expect(Achievement.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: validObjectId, emp_id: "employee_id" },
        { visibility: false },
        { new: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Achievement visibility updated successfully",
        achievement: mockUpdatedAchievement,
      });
    });

    it("should return 404 if the achievement is not found", async () => {
      Achievement.findOneAndUpdate.mockResolvedValue(null);

      const req = {
        user: { id: "employee_id" },
        body: { achievement_id: validObjectId, visibility: false },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await achievementController.updateAchievementVisibility(req, res);

      expect(Achievement.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: validObjectId, emp_id: "employee_id" },
        { visibility: false },
        { new: true }
      );
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Achievement not found or not authorized to update",
      });
    });

    it("should return 400 for an invalid achievement ID", async () => {
      const req = {
        user: { id: "employee_id" },
        body: { achievement_id: "invalid_id", visibility: false },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await achievementController.updateAchievementVisibility(req, res);

      expect(Achievement.findOneAndUpdate).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Invalid achievement ID" });
    });

    it("should return 500 if there is a server error", async () => {
      Achievement.findOneAndUpdate.mockRejectedValue(new Error("Database error"));

      const req = {
        user: { id: "employee_id" },
        body: { achievement_id: validObjectId, visibility: false },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await achievementController.updateAchievementVisibility(req, res);

      expect(Achievement.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: validObjectId, emp_id: "employee_id" },
        { visibility: false },
        { new: true }
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });
});
