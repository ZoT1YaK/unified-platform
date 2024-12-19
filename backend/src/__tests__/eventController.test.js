const mongoose = require("mongoose");
const Event = require("../models/Event");
const EventDepartment = require("../models/EventDepartment");
const EventTeam = require("../models/EventTeam");
const EventLocation = require("../models/EventLocation");
const EventEmployee = require("../models/EventEmployee");
const Employee = require("../models/Employee");
const Department = require("../models/Department");
const Team = require("../models/Team");
const TeamEmployee = require("../models/TeamEmployee");
const NotificationType = require("../models/NotificationType");
const NotificationController = require("../controllers/notificationController");
const eventController = require("../controllers/eventController");

jest.mock("../models/Event");
jest.mock("../models/EventDepartment");
jest.mock("../models/EventTeam");
jest.mock("../models/EventLocation");
jest.mock("../models/EventEmployee");
jest.mock("../models/Employee");
jest.mock("../models/Department");
jest.mock("../models/Team");
jest.mock("../models/TeamEmployee");
jest.mock("../models/NotificationType");
jest.mock("../controllers/notificationController");

describe("Event Controller", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {}); // Suppress console.error
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createEvent", () => {
    it("should create a new event successfully", async () => {
      const mockEvent = { _id: new mongoose.Types.ObjectId(), title: "Test Event" };
      Event.create.mockResolvedValue(mockEvent);
      EventEmployee.create.mockResolvedValue({});

      const req = {
        user: { id: "creator_id" },
        body: {
          title: "Test Event",
          date: "2023-12-25",
          target_departments: [],
          target_teams: [],
          target_locations: [],
          target_employees: [],
        },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await eventController.createEvent(req, res);

      expect(Event.create).toHaveBeenCalledWith(expect.objectContaining({ title: "Test Event" }));
      expect(EventEmployee.create).toHaveBeenCalledWith(
        expect.objectContaining({ emp_id: "creator_id", response: "Accepted" })
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Event created successfully" }));
    });

    it("should return an error if title or date is missing", async () => {
      const req = { user: { id: "creator_id" }, body: {} };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await eventController.createEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Title and date are required." });
    });
  });

  describe("getEventsForEmployee", () => {
    it("should fetch events for a logged-in employee", async () => {
      const mockEmployee = {
        _id: "employee_id",
        dep_id: { _id: "department_id", name: "Department A" },
        location: "location_1",
      };
    
      const mockDepartmentEvents = [{ event_id: "event_1" }];
      const mockTeamEvents = [{ event_id: "event_2" }];
      const mockLocationEvents = [{ event_id: "event_3" }];
      const mockDirectEvents = [{ event_id: "event_4", response: "Accepted" }];
      const mockLeaderCreatedEvents = [{ _id: "event_5", title: "Leader Event" }];
      const mockFinalEvents = [
        { _id: "event_1", title: "Department Event", created_by_id: "another_user_id", response: null },
        { _id: "event_2", title: "Team Event", created_by_id: "another_user_id", response: null },
        { _id: "event_3", title: "Location Event", created_by_id: "another_user_id", response: null },
        { _id: "event_4", title: "Direct Event", created_by_id: "another_user_id", response: "Accepted" },
        { _id: "event_5", title: "Leader Event", created_by_id: "employee_id", response: "Pending" },
      ];
      
      
    
      // Mock Employee.findById().populate()
      const mockEmployeeFind = {
        populate: jest.fn().mockResolvedValue(mockEmployee),
      };
      Employee.findById.mockReturnValue(mockEmployeeFind);
    
      // Mock TeamEmployee.find().select()
      const mockTeamFind = {
        select: jest.fn().mockResolvedValue([{ team_id: "team_id_1" }]),
      };
      TeamEmployee.find.mockReturnValue(mockTeamFind);
    
      // Mock EventDepartment.find()
      EventDepartment.find.mockResolvedValue(mockDepartmentEvents);
    
      // Mock EventTeam.find()
      EventTeam.find.mockResolvedValue(mockTeamEvents);
    
      // Mock EventLocation.find()
      EventLocation.find.mockResolvedValue(mockLocationEvents);
    
      // Mock EventEmployee.find()
      EventEmployee.find.mockResolvedValue(mockDirectEvents);
    
      // Mock Event.find() for leader-created events and final events
      Event.find
        .mockResolvedValueOnce(mockLeaderCreatedEvents) // For leader-created events
        .mockReturnValue({ sort: jest.fn().mockReturnThis(), lean: jest.fn().mockResolvedValue(mockFinalEvents) });
    
      const req = { user: { id: "employee_id" }, query: {} };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    
      await eventController.getEventsForEmployee(req, res);
    
      // Assertions for each mock
      expect(Employee.findById).toHaveBeenCalledWith("employee_id");
      expect(mockEmployeeFind.populate).toHaveBeenCalledWith("dep_id", "name");
    
      expect(TeamEmployee.find).toHaveBeenCalledWith({ emp_id: "employee_id" });
      expect(mockTeamFind.select).toHaveBeenCalledWith("team_id");
    
      // Use the mockEmployee.dep_id._id
      expect(EventDepartment.find).toHaveBeenCalledWith({ dep_id: mockEmployee.dep_id });
      expect(EventTeam.find).toHaveBeenCalledWith({ team_id: { $in: ["team_id_1"] } });
      expect(EventLocation.find).toHaveBeenCalledWith({ location: "location_1" });
      expect(EventEmployee.find).toHaveBeenCalledWith({ emp_id: "employee_id" });
      expect(Event.find).toHaveBeenCalledWith(expect.objectContaining({ created_by_id: "employee_id" }));
    
      // Assertions for the final query
      expect(Event.find).toHaveBeenCalledWith(
        expect.objectContaining({ _id: { $in: ["event_1", "event_2", "event_3", "event_4", "event_5"] } })
      );
    
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        events: [
          { _id: "event_1", title: "Department Event", created_by_id: "another_user_id", response: null },
          { _id: "event_2", title: "Team Event", created_by_id: "another_user_id", response: null },
          { _id: "event_3", title: "Location Event", created_by_id: "another_user_id", response: null },
          { _id: "event_4", title: "Direct Event", created_by_id: "another_user_id", response: "Accepted" },
          { _id: "event_5", title: "Leader Event", created_by_id: "employee_id", response: "Pending" },
        ],
      });
    });
  
    it("should return an error if employee is not found", async () => {
      const mockEmployeeFind = {
        populate: jest.fn().mockResolvedValue(null), 
      };
      Employee.findById.mockReturnValue(mockEmployeeFind);
    
      const req = { user: { id: "employee_id" }, query: {} };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    
      await eventController.getEventsForEmployee(req, res);
    
      expect(Employee.findById).toHaveBeenCalledWith("employee_id");
      expect(mockEmployeeFind.populate).toHaveBeenCalledWith("dep_id", "name");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Employee not found." });
    });
  
    it("should handle server errors gracefully", async () => {
      const mockEmployeeFind = {
        populate: jest.fn().mockRejectedValue(new Error("Database error")),
      };
      Employee.findById.mockReturnValue(mockEmployeeFind);
    
      const req = { user: { id: "employee_id" }, query: {} };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    
      await eventController.getEventsForEmployee(req, res);
    
      // Assertions
      expect(Employee.findById).toHaveBeenCalledWith("employee_id");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
    
  });  

  describe("updateEventResponse", () => {
    it("should update event response successfully", async () => {
      const mockEventEmployee = { event_id: "event_id", emp_id: "employee_id", response: "Accepted" };

      EventEmployee.findOneAndUpdate.mockResolvedValue(mockEventEmployee);

      const req = {
        user: { id: "employee_id" },
        body: { event_id: "event_id", response: "Accepted" },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await eventController.updateEventResponse(req, res);

      expect(EventEmployee.findOneAndUpdate).toHaveBeenCalledWith(
        { event_id: "event_id", emp_id: "employee_id" },
        { response: "Accepted" },
        { new: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Response updated successfully" }));
    });

    it("should return an error for invalid response value", async () => {
      const req = { user: { id: "employee_id" }, body: { event_id: "event_id", response: "Invalid" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await eventController.updateEventResponse(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Invalid response value." });
    });
  });

  describe("getEventResources", () => {
    it("should fetch resources for event creation", async () => {
      const mockTeams = [{ _id: "team_id", name: "Team A" }];
      const mockDepartments = [{ _id: "department_id", name: "Department A" }];
      const mockLocations = ["Location A", "Location B"];
    
      // Mock the find and distinct methods to return the expected values
      Team.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockTeams), // Mimic the sorting behavior
      });
      Department.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockDepartments), // Mimic the sorting behavior
      });
      Employee.distinct.mockResolvedValue(mockLocations);
    
      const req = {};
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    
      await eventController.getEventResources(req, res);
    
      // Assertions
      expect(Team.find).toHaveBeenCalled();
      expect(Department.find).toHaveBeenCalled();
      expect(Employee.distinct).toHaveBeenCalledWith("location", { location: { $ne: null } });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        teams: mockTeams,
        departments: mockDepartments,
        locations: mockLocations,
      });
    });    
  
    it("should handle server errors", async () => {
      // Mock one of the actual methods used in the controller to throw an error
      Team.find.mockReturnValue({
        sort: jest.fn().mockRejectedValue(new Error("Database error")),
      });
    
      const req = {};
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    
      await eventController.getEventResources(req, res);
    
      // Assertions
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
    
  });  

  describe("deleteEvent", () => {
    it("should delete an event successfully", async () => {
      const mockEvent = { _id: "event_id", created_by_id: "creator_id" };

      Event.findById.mockResolvedValue(mockEvent);
      Event.findByIdAndDelete.mockResolvedValue(mockEvent);

      const req = { user: { id: "creator_id" }, params: { eventId: "event_id" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await eventController.deleteEvent(req, res);

      expect(Event.findById).toHaveBeenCalledWith("event_id");
      expect(Event.findByIdAndDelete).toHaveBeenCalledWith("event_id");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Event deleted successfully." });
    });

    it("should return an error if the event is not found", async () => {
      Event.findById.mockResolvedValue(null);

      const req = { user: { id: "creator_id" }, params: { eventId: "event_id" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await eventController.deleteEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Event not found." });
    });
  });
});