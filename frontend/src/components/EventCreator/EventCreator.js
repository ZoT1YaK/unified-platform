import React, { useState, useEffect } from "react";
import axios from "axios";
import "./EventCreator.css";

const EventCreator = ({ onSave, departments, locations, teams, existingEvent }) => {
    const [formData, setFormData] = useState({
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

    const [availableEmployees, setAvailableEmployees] = useState([]);
    const [availableBadges, setAvailableBadges] = useState([]);
    const [availableDepartments, setAvailableDepartments] = useState([]);
    const [availableTeams, setAvailableTeams] = useState([]);
    const [availableLocations, setAvailableLocations] = useState([]);

    // Populate form when editing
    useEffect(() => {
        if (existingEvent) {
            setFormData({
                ...existingEvent,
                target_departments: existingEvent.target_departments || [],
                target_teams: existingEvent.target_teams || [],
                target_locations: existingEvent.target_locations || [],
                target_employees: existingEvent.target_employees || [],
            });
        }
    }, [existingEvent]);

    // Fetch data for employees, badges, departments, teams, and locations
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [employeesRes, activeBadgesRes, resourcesRes] = await Promise.all([
                    axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/employees/all`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                    }),
                    axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/badges/get-active`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                    }),
                    axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/events/resources`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                    }),
                ]);

                setAvailableEmployees(employeesRes.data.employees || []);
                setAvailableBadges(activeBadgesRes.data.badges || []);
                setAvailableDepartments(resourcesRes.data.departments || []);
                setAvailableTeams(resourcesRes.data.teams || []);
                setAvailableLocations(resourcesRes.data.locations || []);
            } catch (err) {
                console.error("Error fetching data:", err);
            }
        };

        fetchData();
    }, []);

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Handle Select All toggle
    const toggleSelectAll = (key, items, isSelectAll) => {
        setFormData((prev) => ({
            ...prev,
            [key]: isSelectAll ? ["ALL"] : [],
        }));
    };
    
    const toggleSelection = (key, value) => {
        setFormData((prev) => ({
            ...prev,
            [key]: prev[key].includes(value)
                ? prev[key].filter((item) => item !== value)
                : [...prev[key], value],
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = { ...formData };

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
                <div className="event-creator-form-row">
                    <label>Target Departments</label>
                    <div className="event-creator-checkbox-group">
                        <div>
                            <input
                                type="checkbox"
                                onChange={(e) =>
                                    toggleSelectAll(
                                        "target_departments",
                                        availableDepartments,
                                        e.target.checked
                                    )
                                }
                            />
                            <span>Select All</span>
                        </div>
                        {availableDepartments.map((dept) => (
                            <div key={dept._id}>
                                <input
                                    type="checkbox"
                                    value={dept._id}
                                    checked={formData.target_departments.includes(dept._id)}
                                    onChange={() => toggleSelection("target_departments", dept._id)}
                                />
                                <span>{dept.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="event-creator-form-row">
                    <label>Target Teams</label>
                    <div className="event-creator-checkbox-group">
                        <div>
                            <input
                                type="checkbox"
                                onChange={(e) =>
                                    toggleSelectAll("target_teams", availableTeams, e.target.checked)
                                }
                            />
                            <span>Select All</span>
                        </div>
                        {availableTeams.map((team) => (
                            <div key={team._id}>
                                <input
                                    type="checkbox"
                                    value={team._id}
                                    checked={formData.target_teams.includes(team._id)}
                                    onChange={() => toggleSelection("target_teams", team._id)}
                                />
                                <span>{team.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="event-creator-form-row">
                    <label>Target Locations</label>
                    <div className="event-creator-checkbox-group">
                        <div>
                            <input
                                type="checkbox"
                                onChange={(e) =>
                                    toggleSelectAll(
                                        "target_locations",
                                        availableLocations,
                                        e.target.checked
                                    )
                                }
                            />
                            <span>Select All</span>
                        </div>
                        {availableLocations.map((loc) => (
                            <div key={loc}>
                                <input
                                    type="checkbox"
                                    value={loc}
                                    checked={formData.target_locations.includes(loc)}
                                    onChange={() => toggleSelection("target_locations", loc)}
                                />
                                <span>{loc}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="event-creator-form-row">
                    <label htmlFor="badge_id">Select a Badge</label>
                    <select
                        id="badge_id"
                        name="badge_id"
                        value={formData.badge_id}
                        onChange={handleInputChange}
                    >
                        <option value="">No Badge</option>
                        {availableBadges.map((badge) => (
                            <option key={badge._id} value={badge._id}>
                                {badge.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="event-creator-form-row">
                    <label>Target Employees</label>
                    <div className="event-creator-checkbox-group">
                        <div>
                            <input
                                type="checkbox"
                                onChange={(e) =>
                                    toggleSelectAll(
                                        "target_employees",
                                        availableEmployees,
                                        e.target.checked
                                    )
                                }
                            />
                            <span>Select All</span>
                        </div>
                        {availableEmployees.map((emp) => (
                            <div key={emp._id}>
                                <input
                                    type="checkbox"
                                    value={emp._id}
                                    checked={formData.target_employees.includes(emp._id)}
                                    onChange={() => toggleSelection("target_employees", emp._id)}
                                />
                                <span>
                                    {emp.f_name} {emp.l_name} ({emp.email})
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="event-creator-form-actions">
                    <button type="button" className="event-creator-cancel-button">
                        Cancel
                    </button>
                    <button type="submit" className="event-creator-save-button">
                        Create Event
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EventCreator;
