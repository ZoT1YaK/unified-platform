import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import "./EventCard.css";


const EventCard = ({ isLeader }) => {
  const [events, setEvents] = useState([]);
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 5;


  const useFilterAndSearch = (items, filter, searchQuery, filterKey = "response", searchKey = "title") => {
    return useMemo(() => {
      return items
        .filter((item) => {
          if (filter === "All") return true;
          if (filter === "Accepted") return item[filterKey] === "Joined";
          if (filter === "Declined") return item[filterKey] === "Declined";
          return true;
        })
        .filter((item) => {
          const query = searchQuery || ""; // Fallback to empty string
          const searchValue = searchKey.includes(".")
            ? searchKey.split(".").reduce((obj, key) => (obj ? obj[key] : ""), item)
            : item[searchKey];
          return (searchValue || "").toLowerCase().includes(query.toLowerCase());
        });
    }, [items, filter, searchQuery, filterKey, searchKey]);
  };

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

  const filteredAndSearchedEvents = useFilterAndSearch(events, filter, searchQuery);

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


  // Pagination variables
  const totalPages = Math.ceil(filteredAndSearchedEvents.length / eventsPerPage);
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredAndSearchedEvents.slice(indexOfFirstEvent, indexOfLastEvent);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="event-list">
      {/* Search and Filter UI */}
      <div className="filter-search-container">
        <button onClick={() => setFilter('All')} className={filter === 'All' ? 'active' : ''}>
          All
        </button>
        <button onClick={() => setFilter('Accepted')} className={filter === 'Accepted' ? 'active' : ''}>
          Accepted
        </button>
        <button onClick={() => setFilter('Declined')} className={filter === 'Declined' ? 'active' : ''}>
          Declined
        </button>

        <input
          type="text"
          placeholder="Search events..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-bar"
        />
      </div>
      {currentEvents.map((event) => (
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
      {/* Pagination Controls */}
      <div className="pagination">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            className={`pagination-button ${currentPage === index + 1 ? "active" : ""}`}
            onClick={() => handlePageChange(index + 1)}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default EventCard;
