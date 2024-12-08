const Event = require("../models/Event");
const EventDepartment = require("../models/EventDepartment");
const EventTeam = require("../models/EventTeam");
const EventLocation = require("../models/EventLocation");
const EventEmployee = require("../models/EventEmployee");
const TeamEmployee = require("../models/TeamEmployee");
const Employee = require("../models/Employee");
const Department = require("../models/Department");
const Team = require("../models/Team");
const NotificationType = require("../models/NotificationType");
const NotificationController = require("./notificationController");

exports.createEvent = async (req, res) => {
  const { title, description, date, time, location, target_departments, target_teams, target_locations, target_employees } = req.body;
  const { id } = req.user;

  try {
    const employee = await Employee.findById(id);
    if (!employee || !employee.is_people_leader) {
      return res.status(403).json({ message: "Only People Leaders can create events." });
    }

    if (!title || !date) {
      return res.status(400).json({ message: "Title and date are required." });
    }

    const event = await Event.create({
      created_by_id: id,
      title,
      description,
      date,
      time,
      location,
    });

    if (target_departments?.length) {
      const departmentData = target_departments.map((dep_id) => ({
        event_id: event._id,
        dep_id,
      }));
      await EventDepartment.insertMany(departmentData);
    }

    if (target_teams?.length) {
      const teamData = target_teams.map((team_id) => ({
        event_id: event._id,
        team_id,
      }));
      await EventTeam.insertMany(teamData);
    }

    if (target_locations?.length) {
      const locationData = target_locations.map((loc) => ({
        event_id: event._id,
        location: loc,
      }));
      await EventLocation.insertMany(locationData);
    }

    if (target_employees?.length) {
      const employeeData = target_employees.map((emp_id) => ({
        event_id: event._id,
        emp_id,
        response: "Pending",
      }));
      await EventEmployee.insertMany(employeeData);

      const notificationType = await NotificationType.findOne({type_name: "Event Invitation"});
      if (!notificationType) {
        return res.status(404).json({ message: "Notification type not found" });
      }

      for (const emp_id of target_employees) {
        await NotificationController.createNotification({
          recipient_id: emp_id,
          noti_type_id: notificationType._id,
          related_entity_id: event._id,
          message: `You have been invited to an event: ${title}`,
        });
      }
    }

    res.status(201).json({ message: "Event created successfully", event });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getEventsForEmployee = async (req, res) => {
  const { id } = req.user;
  
  try {
    const employee = await Employee.findById(id).populate("dep_id", "name");
    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }
  
    const teams = await TeamEmployee.find({ emp_id: id }).select("team_id");
    const teamIds = teams.map((team) => team.team_id);
  
    const departmentEvents = await EventDepartment.find({ dep_id: employee.dep_id });
    const teamEvents = await EventTeam.find({ team_id: { $in: teamIds } });
    const locationEvents = await EventLocation.find({ location: employee.location });
    const directEvents = await EventEmployee.find({ emp_id: id });
    const leaderCreatedEvents = await Event.find({ created_by_id: id });
  
    const eventIds = [
      ...new Set([
        ...departmentEvents.map((event) => event.event_id),
        ...teamEvents.map((event) => event.event_id),
        ...locationEvents.map((event) => event.event_id),
        ...directEvents.map((event) => event.event_id),
        ...leaderCreatedEvents.map((event) => event._id),
      ]),
    ];
  
    const events = await Event.find({ _id: { $in: eventIds } }).sort({ date: 1 });
  
    res.status(200).json({ events });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateEventResponse = async (req, res) => {
  const { event_id, response } = req.body;
  const { id } = req.user;
  
  try {
    if (!["Accepted", "Declined", "Pending"].includes(response)) {
      return res.status(400).json({ message: "Invalid response value." });
    }
  
    const eventEmployee = await EventEmployee.findOneAndUpdate(
      { event_id, emp_id: id },
      { response },
      { new: true }
    );
  
    if (!eventEmployee) {
      return res.status(404).json({ message: "Event or invitation not found." });
    }
  
    res.status(200).json({ message: "Response updated successfully", eventEmployee });
  } catch (error) {
    console.error("Error updating event response:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getEventResources = async (req, res) => {
  try {
    const teams = await Team.find().sort({ name: 1 });

    const departments = await Department.find().sort({ name: 1 });

    const locations = await Employee.distinct("location", { location: { $ne: null } });

    res.status(200).json({
      teams,
      departments,
      locations,
    });
  } catch (error) {
    console.error("Error fetching event resources:", error);
    res.status(500).json({ message: "Server error" });
  }
};