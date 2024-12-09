import React, { useState, useEffect } from "react";
import axios from "axios";
import "./EventCard.css";

const EventCard = ({ isLeader }) => {
  const [events, setEvents] = useState([]);
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);


  // Fetch events on component mount
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/events/get`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        // Standardize "Accepted" to "Joined"
        const standardizedEvents = response.data.events.map((event) => ({
          ...event,
          response: event.response === "Accepted" ? "Joined" : event.response,
        }));

        setEvents(standardizedEvents);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Failed to fetch events. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Handle RSVP updates
  const handleRSVP = async (eventId, response) => {
    try {
      const currentEvent = events.find((event) => event._id === eventId);

      // Skip update if response is unchanged
      if (currentEvent.response === response) {
        console.log("No change in response; skipping update.");
        return;
      }

      // Send update request to the backend
      await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/events/response`,
        { event_id: eventId, response },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const updatedResponse =
        response === "Accepted" ? "Joined" : response === "Declined" ? "Declined" : response;

      // Update state with the new response
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event._id === eventId ? { ...event, response: updatedResponse } : event
        )
      );
    } catch (err) {
      console.error("Error updating RSVP:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to update RSVP. Please try again.");
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_BACKEND_URL}/api/events/delete/${eventId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Update the event list after deletion
      setEvents((prevEvents) =>
        prevEvents.filter((event) => event._id !== eventId)
      );
      console.log("Event deleted successfully.");
    } catch (err) {
      console.error("Error deleting event:", err);
      alert("Failed to delete the event. Please try again.");
    }
  };


  // Render the component
  if (loading) return <p>Loading events...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="event-list">
      <h2>Upcoming Events</h2>
      {events.map((event) => (
        <div
          key={event._id}
          onMouseEnter={() => setHoveredEvent(event._id)}
          onMouseLeave={() => setHoveredEvent(null)}
        >
          <div className="event-main">
            <div className="event-info">
              <h3>{event.title}</h3>
              <p>Date: {new Date(event.date).toLocaleDateString()}</p>
              <p>Time: {event.time || "N/A"}</p>
              <p>Location: {event.location || "Online"}</p>
            </div>
            {isLeader && (
              <div className="event-actions">
                <button
                  className="delete-button"
                  onClick={() => handleDeleteEvent(event._id)}
                >
                  Delete
                </button>
              </div>
            )}
            <div className="event-rsvp">
              <button
                className={`rsvp-btn accept ${event.response === "Joined" ? "active" : ""}`}
                onClick={() => handleRSVP(event._id, "Accepted")}
              >
                {event.response === "Joined" ? "Joined" : "Accept"}
              </button>
              <button
                className={`rsvp-btn decline ${event.response === "Declined" ? "active" : ""}`}
                onClick={() => handleRSVP(event._id, "Declined")}
              >
                {event.response === "Declined" ? "Declined" : "Decline"}
              </button>
            </div>
          </div>
          {hoveredEvent === event._id && (
            <div className="event-description">
              <p>{event.description || "No additional details available."}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default EventCard;
