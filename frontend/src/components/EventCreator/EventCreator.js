import React, { useState, useEffect } from "react";
import axios from "axios";
import "./EventCreator.css";

const EventCreator = ({ onSave, departments, locations, teams, existingEvent }) => {
    const [formData, setFormData] = useState({
        title: "", // Updated from eventName
        description: "",
        date: "",
        time: "",
        location: "",
        target_departments: [],
        target_teams: [],
        target_locations: [],
        target_employees: [],
        badge_id: "", // Updated from badge
    });

    const [availableEmployees, setAvailableEmployees] = useState([]);
    const [availableBadges, setAvailableBadges] = useState([]);
    const [availableDepartments, setAvailableDepartments] = useState([]);
    const [availableTeams, setAvailableTeams] = useState([]);
    const [availableLocations, setAvailableLocations] = useState([]);


    // Populate form when editing
    useEffect(() => {
        if (existingEvent) {
            setFormData({
                title: existingEvent.title, // Updated from eventName
                description: existingEvent.description,
                date: existingEvent.date,
                time: existingEvent.time || "",
                location: existingEvent.location || "",
                target_departments: existingEvent.target_departments || [],
                target_teams: existingEvent.target_teams || [],
                target_locations: existingEvent.target_locations || [],
                target_employees: existingEvent.target_employees || [],
                badge_id: existingEvent.badge_id || "",
            });
        }
    }, [existingEvent]);

    // Fetch employees and badges
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [employeesRes, badgesRes] = await Promise.all([
                    axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/employees/all`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                    }),
                    axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/badges/get`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                    }),
                ]);

                setAvailableEmployees(employeesRes.data.employees || []);
                setAvailableBadges(badgesRes.data.badges || []);
            } catch (err) {
                console.error("Error fetching data:", err);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const fetchResources = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/events/resources`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                });
    
                setAvailableDepartments(response.data.departments || []);
                setAvailableTeams(response.data.teams || []);
                setAvailableLocations(response.data.locations || []);
            } catch (err) {
                console.error("Error fetching resources:", err);
            }
        };
    
        fetchResources();
    }, []);
    


    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleDepartmentChange = (e) => {
        const { value } = e.target;
        setFormData((prev) => ({
            ...prev,
            target_departments: prev.target_departments.includes(value)
                ? prev.target_departments.filter((dept) => dept !== value)
                : [...prev.target_departments, value],
        }));
    };

    const handleTeamChange = (e) => {
        const { value } = e.target;
        setFormData((prev) => ({
            ...prev,
            target_teams: prev.target_teams.includes(value)
                ? prev.target_teams.filter((team) => team !== value)
                : [...prev.target_teams, value],
        }));
    };

    const handleLocationChange = (e) => {
        const { value } = e.target;
        setFormData((prev) => ({
            ...prev,
            target_locations: prev.target_locations.includes(value)
                ? prev.target_locations.filter((loc) => loc !== value)
                : [...prev.target_locations, value],
        }));
    };


    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            title: formData.title,
            description: formData.description,
            date: formData.date,
            time: formData.time,
            location: formData.location,
            target_departments: formData.target_departments,
            target_teams: formData.target_teams,
            target_locations: formData.target_locations,
            target_employees: formData.target_employees,
            badge_id: formData.badge_id,
        };

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}/api/events/create`,
                payload,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            console.log("Event created successfully:", response.data);

            setFormData({
                title: "",
                description: "",
                date: "",
                time: "",
                location: "",
                target_departments: [],
                target_teams: [],
                target_locations: [],
                target_employees: [],
                badge_id: "",
            });

            onSave(response.data);
        } catch (error) {
            console.error("Error creating event:", error.response?.data || error.message);
            alert("Failed to create the event. Please try again.");
        }
    };

    return (
        <div className="event-creator-container">
            <form className="event-creator-form" onSubmit={handleSubmit}>
                {/* Event Title */}
                <div className="event-creator-form-row">
                    <label htmlFor="title">
                        Event Name <span className="required">*</span>
                    </label>
                    <input
                        id="title"
                        type="text"
                        name="title"
                        placeholder="Enter event name"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                {/* Description */}
                <div className="event-creator-form-row">
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        placeholder="Add a description"
                        value={formData.description}
                        onChange={handleInputChange}
                    ></textarea>
                </div>

                {/* Date and Time */}
                <div className="event-creator-form-row">
                    <label htmlFor="date">
                        Date <span className="required">*</span>
                    </label>
                    <input
                        id="date"
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="event-creator-form-row">
                    <label htmlFor="time">Time</label>
                    <input
                        id="time"
                        type="time"
                        name="time"
                        value={formData.time}
                        onChange={handleInputChange}
                    />
                </div>

                {/* Meeting Place  */}
                <div className="event-creator-form-row">
                    <label htmlFor="location">Meeting Place</label>
                    <input
                        id="location"
                        type="text"
                        name="location"
                        placeholder="Choose a location"
                        value={formData.location}
                        onChange={handleInputChange}
                    />
                </div>
                {/* Department*/}
                <div className="event-creator-form-row">
                    <label>Target Departments</label>
                    <div className="event-creator-checkbox-group">
                        {availableDepartments.map((dept) => (
                            <div key={dept._id} className="event-creator-checkbox-item">
                                <input
                                    type="checkbox"
                                    value={dept._id}
                                    checked={formData.target_departments.includes(dept._id)}
                                    onChange={handleDepartmentChange}
                                />
                                <span>{dept.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Location*/}
                <div className="event-creator-form-row">
                    <label>Target Locations</label>
                    <div className="event-creator-checkbox-group">
                        {availableLocations.map((loc) => (
                            <div key={loc} className="event-creator-checkbox-item">
                                <input
                                    type="checkbox"
                                    value={loc}
                                    checked={formData.target_locations.includes(loc)}
                                    onChange={handleLocationChange}
                                />
                                <span>{loc}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Team*/}
                <div className="event-creator-form-row">
                    <label>Target Teams</label>
                    <div className="event-creator-checkbox-group">
                        {availableTeams.map((team) => (
                            <div key={team._id} className="event-creator-checkbox-item">
                                <input
                                    type="checkbox"
                                    value={team._id}
                                    checked={formData.target_teams.includes(team._id)}
                                    onChange={handleTeamChange}
                                />
                                <span>{team.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Badge Selector */}
                <div className="event-creator-form-row">
                    <label htmlFor="badge">Attach a Badge</label>
                    <select
                        id="badge"
                        name="badge_id"
                        value={formData.badge_id}
                        onChange={handleInputChange}
                    >
                        <option value="">Choose a badge</option>
                        {availableBadges.map((badge) => (
                            <option key={badge._id} value={badge._id}>
                                {badge.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Employees */}
                <div className="event-creator-form-row">
                    <label>Employees</label>
                    <div className="event-creator-checkbox-group">
                        {availableEmployees.map((emp) => (
                            <div key={emp._id} className="event-creator-checkbox-item">
                                <input
                                    type="checkbox"
                                    value={emp._id}
                                    checked={(formData.target_employees || []).includes(emp._id)}
                                    onChange={() =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            target_employees: (prev.target_employees || []).includes(emp._id)
                                                ? (prev.target_employees || []).filter((id) => id !== emp._id)
                                                : [...(prev.target_employees || []), emp._id],
                                        }))
                                    }
                                />
                                <span>
                                    {emp.f_name} {emp.l_name} ({emp.email})
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="event-creator-form-actions">
                    <button type="button" className="event-creator-cancel-button">Cancel</button>
                    <button type="submit" className="event-creator-save-button">Create Event</button>
                </div>
            </form>
        </div>
    );
};

export default EventCreator;
