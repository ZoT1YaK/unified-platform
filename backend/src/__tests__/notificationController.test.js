const mongoose = require("mongoose");
const Notification = require("../models/Notification");
const NotificationSettings = require("../models/NotificationSettings");
const NotificationType = require("../models/NotificationType");
const Employee = require("../models/Employee");
const notificationController = require("../controllers/notificationController");

jest.mock("../models/Notification");
jest.mock("../models/NotificationSettings");
jest.mock("../models/NotificationType");
jest.mock("../models/Employee");

describe("Notification Controller", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {}); // Suppress console.error
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createNotification", () => {
    it("should create a notification for a recipient successfully", async () => {
      const mockRecipient = { _id: "recipient_id", f_name: "John", l_name: "Doe" };
      const mockNotificationType = { _id: "noti_type_id", type_name: "Milestone Reminder" };
      const mockNotification = { _id: "notification_id", message: "Test message" };

      Employee.findById.mockResolvedValue(mockRecipient);
      NotificationType.findById.mockResolvedValue(mockNotificationType);
      Notification.create.mockResolvedValue(mockNotification);

      const result = await notificationController.createNotification({
        recipient_id: "recipient_id",
        noti_type_id: "noti_type_id",
        related_entity_id: "entity_id",
        message: "Test message",
      });

      expect(Employee.findById).toHaveBeenCalledWith("recipient_id");
      expect(NotificationType.findById).toHaveBeenCalledWith("noti_type_id");
      expect(Notification.create).toHaveBeenCalledWith(
        expect.objectContaining({ recipient_id: "recipient_id", message: "Test message" })
      );
      expect(result).toEqual({
        status: "success",
        recipientNotification: mockNotification,
        leaderNotification: null,
      });
    });

    it("should throw an error if required fields are missing", async () => {
      await expect(
        notificationController.createNotification({
          recipient_id: null,
          noti_type_id: null,
          message: null,
        })
      ).rejects.toThrow("Missing required fields: recipient_id, noti_type_id, or message.");
    });

    it("should skip notification if preferences are disabled", async () => {
      NotificationSettings.findOne.mockResolvedValue({ preference: false });

      const result = await notificationController.createNotification({
        recipient_id: "recipient_id",
        noti_type_id: "noti_type_id",
        related_entity_id: "entity_id",
        message: "Test message",
      });

      expect(result).toEqual({
        status: "skipped",
        message: "Notification is disabled for this recipient.",
      });
    });
  });

  describe("getNotificationsForEmployee", () => {
    it("should fetch notifications for the logged-in employee", async () => {
      const mockNotifications = [
        { _id: "noti_1", message: "Test notification 1" },
        { _id: "noti_2", message: "Test notification 2" },
      ];

      const mockFind = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockNotifications),
      };

      Notification.find.mockReturnValue(mockFind);

      const req = { user: { id: "employee_id" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await notificationController.getNotificationsForEmployee(req, res);

      expect(Notification.find).toHaveBeenCalledWith({ recipient_id: "employee_id" });
      expect(mockFind.populate).toHaveBeenCalledWith("noti_type_id", "type_name description");
      expect(mockFind.sort).toHaveBeenCalledWith({ notification_date: -1 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ notifications: mockNotifications });
    });

    it("should handle server errors gracefully", async () => {
      Notification.find.mockImplementation(() => {
        throw new Error("Database error");
      });
      const req = { user: { id: "employee_id" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await notificationController.getNotificationsForEmployee(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });

  describe("markNotificationAsRead", () => {
    const validObjectId = "507f191e810c19729de860ea";
    it("should mark a notification as read", async () => {
        const mockNotification = { _id: validObjectId, status: "Read" };
        
        Notification.findByIdAndUpdate.mockResolvedValue(mockNotification);
      
        const req = { body: { notification_id: validObjectId } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      
        await notificationController.markNotificationAsRead(req, res);
      
        expect(Notification.findByIdAndUpdate).toHaveBeenCalledWith(
            validObjectId ,
          { status: "Read" },
          { new: true }
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          message: "Notification marked as read",
          notification: mockNotification,
        });
      });
      

    it("should return an error for invalid notification ID", async () => {
      const req = { body: { notification_id: "invalid_id" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await notificationController.markNotificationAsRead(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Invalid notification ID" });
    });
  });

  describe("updateNotificationPreference", () => {
    it("should update notification preferences successfully", async () => {
      const mockPreference = { emp_id: "employee_id", noti_type_id: "noti_type_id", preference: true };
      NotificationSettings.findOneAndUpdate.mockResolvedValue(mockPreference);

      const req = {
        user: { id: "employee_id" },
        body: { noti_type_id: "noti_type_id", preference: true },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await notificationController.updateNotificationPreference(req, res);

      expect(NotificationSettings.findOneAndUpdate).toHaveBeenCalledWith(
        { emp_id: "employee_id", noti_type_id: "noti_type_id" },
        { preference: true },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Notification preference updated successfully",
        setting: mockPreference,
      });
    });

    it("should handle missing or invalid fields", async () => {
      const req = { user: { id: "employee_id" }, body: { noti_type_id: null, preference: null } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await notificationController.updateNotificationPreference(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Invalid request. Missing or incorrect fields." });
    });
  });

  describe("getNotificationPreferences", () => {
    it("should fetch notification preferences for the logged-in employee", async () => {
      const mockPreferences = [
        { noti_type_id: { _id: "noti_type_1", type_name: "Type 1" }, preference: true },
        { noti_type_id: { _id: "noti_type_2", type_name: "Type 2" }, preference: false },
      ];

      const mockFind = {
        populate: jest.fn().mockResolvedValue(mockPreferences),
      };

      NotificationSettings.find.mockReturnValue(mockFind);

      const req = { user: { id: "employee_id" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await notificationController.getNotificationPreferences(req, res);

      expect(NotificationSettings.find).toHaveBeenCalledWith({ emp_id: "employee_id" });
      expect(mockFind.populate).toHaveBeenCalledWith("noti_type_id", "type_name");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([
        { noti_type_id: "noti_type_1", type_name: "Type 1", preference: true },
        { noti_type_id: "noti_type_2", type_name: "Type 2", preference: false },
      ]);
    });

    it("should handle server errors gracefully", async () => {
      NotificationSettings.find.mockImplementation(() => {
        throw new Error("Database error");
      });

      const req = { user: { id: "employee_id" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await notificationController.getNotificationPreferences(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });
});
