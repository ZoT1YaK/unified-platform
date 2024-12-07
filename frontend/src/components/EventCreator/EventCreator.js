import React, { useState } from "react";
import "./EventCreator.css";

const EventCreator = ({ onSave }) => {
    const [formData, setFormData] = useState({
        eventName: "",
        description: "",
        date: "",
        time: "",
        location: "",
        participants: [],
    });
    const [emailInput, setEmailInput] = useState("");

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Handle adding participants by email
    const handleAddParticipant = () => {
        if (emailInput.trim() && !formData.participants.includes(emailInput.trim())) {
            setFormData((prev) => ({
                ...prev,
                participants: [...prev.participants, emailInput.trim()],
            }));
        }
        setEmailInput("");
    };

    // Handle removing participants
    const handleRemoveParticipant = (email) => {
        setFormData((prev) => ({
            ...prev,
            participants: prev.participants.filter((e) => e !== email),
        }));
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData); // Pass form data to parent component
        setFormData({
            eventName: "",
            description: "",
            date: "",
            time: "",
            location: "",
            participants: [],
        });
    };

    return (
        <div className="event-creator-container">
            <h2>Create an Event</h2>
            <form className="event-creator-form" onSubmit={handleSubmit}>
                {/* Event Name */}
                <div className="event-creator-form-row">
                    <label htmlFor="eventName">
                        Event Name <span className="required">*</span>
                    </label>
                    <input
                        id="eventName"
                        type="text"
                        name="eventName"
                        placeholder="Enter event name"
                        value={formData.eventName}
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

                {/* Location */}
                <div className="event-creator-form-row">
                    <label htmlFor="location">Location</label>
                    <input
                        id="location"
                        type="text"
                        name="location"
                        placeholder="Choose a location"
                        value={formData.location}
                        onChange={handleInputChange}
                    />
                </div>

                {/* Add Participants */}
                <div className="event-creator-form-row">
                    <label htmlFor="participants">Add Participants</label>
                    <div className="event-creator-email-input-container">
                        <input
                            id="participants"
                            type="email"
                            placeholder="Enter participant's email"
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                        />
                        <button
                            type="button"
                            className="event-creator-add-participant-button"
                            onClick={handleAddParticipant}
                        >
                            Add
                        </button>
                    </div>
                    <ul className="event-creator-email-list">
                        {formData.participants.map((email, index) => (
                            <li key={index}>
                                {email}
                                <button
                                    type="button"
                                    className="event-creator-remove-participant-button"
                                    onClick={() => handleRemoveParticipant(email)}
                                >
                                    Remove
                                </button>
                            </li>
                        ))}
                    </ul>
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
