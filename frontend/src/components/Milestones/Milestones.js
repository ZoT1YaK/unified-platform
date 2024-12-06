import React from 'react';
import './Milestones.css';
import { useFilterAndSearch } from '../../hooks/useFilterAndSearch';


const Milestones = ({ milestones, filter, searchQuery, toggleVisibility, setFilter, setSearchQuery }) => {
  
    const filteredMilestones = useFilterAndSearch(milestones, filter, searchQuery);

    return (
        <div className="milestones-section">
            <h2>Milestones</h2>
            <div className="milestones-header">
                <p>You've gained {milestones.length} milestones</p>
                <div className="milestones-filters">
                    <button onClick={() => setFilter("All")} className={filter === "All" ? "active" : ""}>
                        All
                    </button>
                    <button onClick={() => setFilter("Visible")} className={filter === "Visible" ? "active" : ""}>
                        Visible
                    </button>
                    <button onClick={() => setFilter("Hidden")} className={filter === "Hidden" ? "active" : ""}>
                        Hidden
                    </button>
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <img src="/magnifying-glass 2.png" alt="Search" />
                    </div>
                </div>
            </div>
            <div className="milestones-list">
                {filteredMilestones.map((milestone) => (
                    <div key={milestone.id} className="milestone-row">
                        <div className="milestone-badge">{milestone.badge}</div>
                        <div className="milestone-details">
                            <h3>{milestone.title}</h3>
                            <p>{milestone.description}</p>
                        </div>
                        <img
                            className="visibility-icon"
                            src={milestone.visible ? "/eye-icon.png" : "/eye-off-icon.png"}
                            alt="Visibility toggle"
                            onClick={() => toggleVisibility(milestone.id, "milestone")}
                        />
                        <p className="milestone-date">Unlocked on {milestone.date}</p>
                    </div>
                ))}
                {filteredMilestones.length === 0 && <p>No milestones found.</p>}
            </div>
        </div>
    );
};

export default Milestones;
