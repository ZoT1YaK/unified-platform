import React from 'react';
import './EventCard.css';

const EventCard = ({ thumbnail, date, title, description }) => {
    return (
        <div className="event-card">
            <div className="event-thumbnail">
                <img src={thumbnail} alt={title} />
                <div className="event-date">{date}</div>
            </div>
            <div className="event-details">
                <h3>{title}</h3>
                <p>{description}</p>
            </div>
        </div>
    );
};

export default EventCard;
