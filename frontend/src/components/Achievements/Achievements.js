import React from 'react';
import './Achievements.css';
import { useFilterAndSearch } from '../../hooks/useFilterAndSearch';


const Achievements = ({ achievements, filter, searchQuery, toggleVisibility, setFilter, setSearchQuery }) => {
    const filteredAchievements = useFilterAndSearch(achievements, filter, searchQuery);

    return (
        <div className="achievements-section">
            <h2>Achievements</h2>
            <div className="achievements-header">
                <p>You've gained {achievements.length} achievements</p>
                <div className="achievements-filters">
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
            <div className="achievements-list">
                {filteredAchievements.map((achievement) => (
                    <div key={achievement.id} className="achievement-row">
                        <img
                            className="achievement-icon"
                            src={`/${achievement.title.toLowerCase().replace(/ /g, "-")}.png`}
                            alt={`Icon for ${achievement.title}`}
                        />
                        <div className="achievement-details">
                            <h3>{achievement.title}</h3>
                            <p>{achievement.description}</p>
                        </div>
                        <img
                            className="visibility-icon"
                            src={achievement.visible ? "/eye-icon.png" : "/eye-off-icon.png"}
                            alt="Visibility toggle"
                            onClick={() => toggleVisibility(achievement.id, "achievement")}
                        />
                        <p className="achievement-date">Unlocked on {achievement.date}</p>
                    </div>
                ))}
                {filteredAchievements.length === 0 && <p>No achievements found.</p>}
            </div>
        </div>
    );
};

export default Achievements;
