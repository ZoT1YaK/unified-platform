import React, { useState, useEffect } from 'react';
import './Milestones.css';

const Milestones = ({ filter, searchQuery, setFilter, setSearchQuery }) => {
    const [milestones, setMilestones] = useState([]);

    useEffect(() => {
        const fetchMilestones = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/milestones/get`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch milestones");
                }

                const data = await response.json();
                setMilestones(
                    data.milestones.map((milestone) => ({
                        ...milestone,
                        badge: "Mil-badge1.png", 
                    }))
                );
            } catch (error) {
                console.error("Error fetching milestones:", error.message);
            }
        };

        fetchMilestones();
    }, []);

    const toggleVisibility = async (id) => {
        try {
            const token = localStorage.getItem("token");
            const milestone = milestones.find((m) => m._id === id);
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/milestones/visibility`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    milestone_id: id,
                    visibility: !milestone.visibility,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to update visibility");
            }

            const updatedMilestone = await response.json();
            setMilestones((prevMilestones) =>
                prevMilestones.map((item) =>
                    item._id === updatedMilestone.milestone._id
                        ? { ...item, visibility: updatedMilestone.milestone.visibility }
                        : item
                )
            );
        } catch (error) {
            console.error("Error updating milestone visibility:", error.message);
        }
    };

    const filteredMilestones = milestones
        .filter((milestone) => {
            if (filter === "Visible") return milestone.visibility;
            if (filter === "Hidden") return !milestone.visibility;
            return true; 
        })
        .filter((milestone) =>
            milestone.name.toLowerCase().includes(searchQuery?.toLowerCase()|| "")
        );

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
                    <div key={milestone._id} className="milestone-row">
                        <img
                            src={`/assets/images/${milestone.badge}`}
                            alt={`Milestone ${milestone.name}`}
                            className="milestone-badge"
                        />
                        <div className="milestone-details">
                            <h3>{milestone.name}</h3>
                            <p>{milestone.description}</p>
                        </div>
                        <img
                            className="visibility-icon"
                            src={milestone.visibility ? "/eye-icon.png" : "/eye-off-icon.png"}
                            alt="Visibility toggle"
                            onClick={() => toggleVisibility(milestone._id)}
                        />
                        <p className="milestone-date">Unlocked on {new Date(milestone.date_unlocked).toLocaleDateString()}</p>
                    </div>
                ))}
                {filteredMilestones.length === 0 && <p>No milestones found.</p>}
            </div>
        </div>
    );
};

export default Milestones;
