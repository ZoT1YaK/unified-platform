const Badge = require("../models/Badge");
const badgeController = require("../controllers/badgeController");

jest.mock("../models/Badge");

describe("Badge Controller", () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console.error
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createBadge", () => {
    it("should create a new badge successfully", async () => {
      const mockBadge = {
        _id: "badge_id",
        name: "Badge Name",
        description: "Badge Description",
        img_link: "http://example.com/image.png",
        created_by_id: "admin_id",
      };
  
      Badge.create.mockResolvedValueOnce(mockBadge);
  
      const req = {
        user: { id: "admin_id" },
        body: {
          name: "Badge Name",
          description: "Badge Description",
          img_link: "http://example.com/image.png",
        },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  
      await badgeController.createBadge(req, res);
  
      expect(Badge.create).toHaveBeenCalledWith({
        name: "Badge Name",
        description: "Badge Description",
        img_link: "http://example.com/image.png",
        created_by_id: "admin_id",
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Badge created successfully",
        badge: mockBadge,
      });
    });
  
    it("should handle errors during badge creation", async () => {
      Badge.create.mockRejectedValueOnce(new Error("Database error"));

      const req = {
        user: { id: "admin_id" },
        body: {
          name: "Badge Name",
          description: "Badge Description",
          img_link: "http://example.com/image.png",
        },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await badgeController.createBadge(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
    });
  
  describe("getAllBadges", () => {
    it("should fetch active and archived badges", async () => {
      const mockActiveBadges = [
        { _id: "badge1", name: "Active Badge 1" },
        { _id: "badge2", name: "Active Badge 2" },
      ];
      const mockArchivedBadges = [{ _id: "badge3", name: "Archived Badge 1" }];
  
      Badge.find
        .mockImplementationOnce(() => ({
        populate: jest.fn().mockResolvedValue(mockActiveBadges),
        }))
        .mockImplementationOnce(() => ({
        populate: jest.fn().mockResolvedValue(mockArchivedBadges),
        }));
  
      const req = {};
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  
      await badgeController.getAllBadges(req, res);
  
      expect(Badge.find).toHaveBeenNthCalledWith(1, { is_archived: false });
      expect(Badge.find).toHaveBeenNthCalledWith(2, { is_archived: true });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        activeBadges: mockActiveBadges,
        archivedBadges: mockArchivedBadges,
      });
      });
  
      it("should handle errors during badge retrieval", async () => {
      // Mock the `Badge.find` to throw an error
      Badge.find.mockImplementationOnce(() => {
        throw new Error("Database error");
      });
  
      const req = {};
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  
      await badgeController.getAllBadges(req, res);
  
      expect(Badge.find).toHaveBeenCalledTimes(1); // Called once before throwing the error
      expect(res.status).toHaveBeenCalledWith(500); // Should return server error
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
      });
    });

  describe("getActiveBadges", () => {
    it("should fetch only active badges", async () => {
      const mockActiveBadges = [
      { _id: "badge1", name: "Active Badge 1" },
      { _id: "badge2", name: "Active Badge 2" },
       ];

      Badge.find.mockResolvedValueOnce(mockActiveBadges);

      const req = {};
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await badgeController.getActiveBadges(req, res);

      expect(Badge.find).toHaveBeenCalledWith({ is_archived: false });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ badges: mockActiveBadges });
    });

    it("should handle errors during active badge retrieval", async () => {
      Badge.find.mockRejectedValueOnce(new Error("Database error"));  

      const req = {};
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };  

      await badgeController.getActiveBadges(req, res);  
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });

  describe("archiveBadges", () => {
    it("should archive multiple badges successfully", async () => {
      Badge.updateMany.mockResolvedValueOnce({ nModified: 2 });

      const req = { body: { ids: ["badge1", "badge2"] } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await badgeController.archiveBadges(req, res);

      expect(Badge.updateMany).toHaveBeenCalledWith({ _id: { $in: ["badge1", "badge2"] } }, { is_archived: true });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Badges archived successfully." });
    });

    it("should handle errors during badge archiving", async () => {
      Badge.updateMany.mockRejectedValueOnce(new Error("Database error"));

      const req = { body: { ids: ["badge1", "badge2"] } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await badgeController.archiveBadges(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Failed to archive badges." });
    });
  });

  describe("restoreBadges", () => {
    it("should restore multiple badges successfully", async () => {
      Badge.updateMany.mockResolvedValueOnce({ nModified: 2 });

      const req = { body: { ids: ["badge1", "badge2"] } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await badgeController.restoreBadges(req, res);

      expect(Badge.updateMany).toHaveBeenCalledWith({ _id: { $in: ["badge1", "badge2"] } }, { is_archived: false });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Badges restored successfully." });
    });

    it("should handle errors during badge restoration", async () => {
      Badge.updateMany.mockRejectedValueOnce(new Error("Database error"));

      const req = { body: { ids: ["badge1", "badge2"] } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await badgeController.restoreBadges(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Failed to restore badges." });
    });
  });
});
