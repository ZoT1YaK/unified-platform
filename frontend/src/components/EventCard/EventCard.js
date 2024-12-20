import React, { useState, useEffect, useMemo } from "react";
import { fetchEvents, updateRSVP, deleteEvent } from "../../services/eventService";
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


  const useFilterAndSearch = (items, filter, searchQuery, filterKey = "response") => {
    return useMemo(() => {
      return items
        .filter((item) => {
          if (filter === "All") return true;
          if (filter === "Accepted") return item[filterKey] === "Joined";
          if (filter === "Declined") return item[filterKey] === "Declined";
          return true;
        })
        .filter((item) => {
          if (searchQuery) return item.title.toLowerCase().includes(searchQuery.toLowerCase());
          return !item.archived;
        });
    }, [items, filter, searchQuery, filterKey]);
  };


  // Fetch events on component mount
  useEffect(() => {
    const loadEvents = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const data = await fetchEvents(token, searchQuery);

            const standardizedEvents = data.map((event) => ({
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

    loadEvents();
}, [searchQuery]);

  const filteredAndSearchedEvents = useFilterAndSearch(events, filter, searchQuery);

  // Handle RSVP updates
  const handleRSVP = async (eventId, response) => {
    try {
        const token = localStorage.getItem("token");
        const currentEvent = events.find((event) => event._id === eventId);

        if (currentEvent.response === response) return;

        await updateRSVP(token, eventId, response);

        const updatedResponse = response === "Accepted" ? "Joined" : response;

        setEvents((prevEvents) =>
            prevEvents.map((event) =>
                event._id === eventId ? { ...event, response: updatedResponse } : event
            )
        );
    } catch (err) {
        console.error("Error updating RSVP:", err);
        setError("Failed to update RSVP. Please try again.");
    }
};
const handleDeleteEvent = async (eventId) => {
  try {
      const token = localStorage.getItem("token");
      await deleteEvent(token, eventId);

      setEvents((prevEvents) => prevEvents.filter((event) => event._id !== eventId));
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
      <div className="event-search-container">
        <div className="event-search-wrapper">
          <img
            src={`${process.env.PUBLIC_URL || ''}/magnifying-glass 1.png`}
            alt="Search Icon"
            className="search-icon"
          />
          <input
            type="text"
            placeholder="Search for an event..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="event-search"
          />
        </div>

        {/* Filter Buttons */}
        <div className="home-event-filter-buttons">
          <button onClick={() => setFilter('All')} className={filter === 'All' ? 'active' : ''}>
            All
          </button>
          <button onClick={() => setFilter('Accepted')} className={filter === 'Accepted' ? 'active' : ''}>
            Accepted
          </button>
          <button onClick={() => setFilter('Declined')} className={filter === 'Declined' ? 'active' : ''}>
            Declined
          </button>
        </div>

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
