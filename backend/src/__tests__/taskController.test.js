const mongoose = require("mongoose");
const Task = require("../models/Task");
const Badge = require("../models/Badge");
const NotificationType = require("../models/NotificationType");
const Achievement = require("../models/Achievement");
const NotificationController = require("../controllers/notificationController");
const taskController = require("../controllers/taskController");

jest.mock("../models/Task");
jest.mock("../models/Badge");
jest.mock("../models/NotificationType");
jest.mock("../models/Achievement");
jest.mock("../controllers/notificationController");

describe("Task Controller", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {}); // Suppress console.error
  });
    
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createTask", () => {
    it("should create a task successfully without a notification", async () => {
      const mockTask = { _id: "task_id", title: "Test Task" };
      Task.create.mockResolvedValue(mockTask);

      const req = {
        user: { id: "creator_id" },
        body: {
          title: "Test Task",
          type: "Self-Created",
          description: "This is a test task.",
        },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await taskController.createTask(req, res);

      expect(Task.create).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Test Task", type: "Self-Created" })
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Task created successfully",
        task: mockTask,
      });
    });

    it("should return an error when title or type is missing", async () => {
      const req = { user: { id: "creator_id" }, body: { description: "No title or type." } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await taskController.createTask(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Title and type are required." });
    });

    it("should return a server error if task creation fails", async () => {
      Task.create.mockRejectedValue(new Error("Database error"));

      const req = {
        user: { id: "creator_id" },
        body: { title: "Test Task", type: "Self-Created" },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await taskController.createTask(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });

  describe("getEmployeeTasks", () => {
    it("should fetch tasks for the logged-in employee", async () => {
        const mockAssignedTasks = [
          { _id: "task_1", title: "Assigned Task 1" },
          { _id: "task_2", title: "Assigned Task 2" },
        ];
        const mockOwnTasks = [
          { _id: "task_3", title: "Own Task 1" },
          { _id: "task_4", title: "Own Task 2" },
        ];
      
        // Mock the chain of calls for the first `Task.find`
        const assignedTasksSortMock = jest.fn().mockReturnThis(); // Mock `.sort`
        const assignedTasksLeanMock = jest.fn().mockResolvedValue(mockAssignedTasks); // Mock `.lean`
      
        // Mock the chain of calls for the second `Task.find`
        const ownTasksSortMock = jest.fn().mockReturnThis(); // Mock `.sort`
        const ownTasksLeanMock = jest.fn().mockResolvedValue(mockOwnTasks); // Mock `.lean`
      
        Task.find = jest.fn()
          .mockReturnValueOnce({ sort: assignedTasksSortMock, lean: assignedTasksLeanMock }) // First call
          .mockReturnValueOnce({ sort: ownTasksSortMock, lean: ownTasksLeanMock }); // Second call
      
        const req = { user: { id: "employee_id" }, query: {} };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      
        // Call the controller
        await taskController.getEmployeeTasks(req, res);
      
        // Assertions for `Task.find` calls
        expect(Task.find).toHaveBeenCalledTimes(2);
      
        // Verify the first call to `Task.find` (assigned tasks)
        expect(Task.find).toHaveBeenNthCalledWith(
          1,
          expect.objectContaining({
            assigned_to_id: "employee_id",
            $or: expect.any(Array),
          })
        );
      
        // Verify the second call to `Task.find` (own tasks)
        expect(Task.find).toHaveBeenNthCalledWith(
          2,
          expect.objectContaining({
            created_by_id: "employee_id",
            assigned_to_id: null,
            $or: expect.any(Array),
          })
        );
      
        // Verify `.sort()` was called with the correct arguments
        expect(assignedTasksSortMock).toHaveBeenCalledWith({ deadline: 1 });
        expect(ownTasksSortMock).toHaveBeenCalledWith({ deadline: 1 });
      
        // Verify `.lean()` was called
        expect(assignedTasksLeanMock).toHaveBeenCalled();
        expect(ownTasksLeanMock).toHaveBeenCalled();
      
        // Verify the response
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          tasks: [...mockAssignedTasks, ...mockOwnTasks],
        });
      });
      
      
    it("should handle server errors gracefully", async () => {
      Task.find.mockImplementation(() => {
        throw new Error("Database error");
      });

      const req = { user: { id: "employee_id" }, query: {} };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await taskController.getEmployeeTasks(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });

  describe("getLeaderAssignedTasks", () => {
    it("should fetch tasks assigned by the leader", async () => {
      const mockTasks = [{ _id: "task_1", assigned_to_id: { f_name: "John", l_name: "Doe" } }];

      const mockFind = {
        populate: jest.fn().mockResolvedValue(mockTasks),
      };
      Task.find.mockReturnValue(mockFind);

      const req = { user: { id: "leader_id" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await taskController.getLeaderAssignedTasks(req, res);

      expect(Task.find).toHaveBeenCalledWith({ created_by_id: "leader_id", assigned_to_id: { $ne: null } });
      expect(mockFind.populate).toHaveBeenCalledWith("assigned_to_id", "f_name l_name position");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ tasks: mockTasks });
    });
  });

  describe("completeTask", () => {
    const validObjectId = "507f191e810c19729de860ea";

    it("should mark a task as completed", async () => {
        const mockTask = {
            _id: validObjectId,
            status: "Pending",
            assigned_to_id: "employee_id",
            created_by_id: "creator_id", // Mock the required fields
            save: jest.fn().mockResolvedValue(),
        };

        Task.findById.mockResolvedValue(mockTask);

        const req = { user: { id: "employee_id" }, body: { task_id: validObjectId, status: "Completed" } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        await taskController.completeTask(req, res);

        // Assertions
        expect(Task.findById).toHaveBeenCalledWith(validObjectId);
        expect(mockTask.save).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: "Task marked as completed.", task: mockTask });
    });


    it("should return an error if task is not found", async () => {
      Task.findById.mockResolvedValue(null);

      const req = { user: { id: "employee_id" }, body: { task_id: validObjectId, status: "Completed" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await taskController.completeTask(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Task not found." });
    });
  });

  describe("deleteTask", () => {
    const validObjectId = "507f191e810c19729de860ea";
    it("should delete a task successfully", async () => {
      const mockTask = { _id: validObjectId };
      Task.findOneAndDelete.mockResolvedValue(mockTask);

      const req = { user: { id: "creator_id" }, body: { task_id: validObjectId } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await taskController.deleteTask(req, res);

      expect(Task.findOneAndDelete).toHaveBeenCalledWith({ _id: validObjectId, created_by_id: "creator_id" });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Task deleted successfully", task: mockTask });
    });
  });
});