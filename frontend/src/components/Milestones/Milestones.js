import React, { useEffect, useState } from 'react';
import './Milestones.css';
import { useFilterAndSearch } from '../../hooks/useFilterAndSearch';

let fetchTimeout; 

const Milestones = ({ simpleMode = false, onMilestonesFetched }) => {
    const [milestones, setMilestones] = useState([]);
    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredMilestones = useFilterAndSearch(milestones, filter, searchQuery, "visibility", "name");

    useEffect(() => {
        const fetchMilestones = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("No token found. Skipping fetch.");
                return;
            }

            if (fetchTimeout) clearTimeout(fetchTimeout);

            fetchTimeout = setTimeout(async () => {
                try {
                    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/milestones/get`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    if (!response.ok) {
                        throw new Error("Failed to fetch milestones");
                    }

                    const data = await response.json();
                    const fetchedMilestones = simpleMode
                        ? data.milestones.filter((milestone) => milestone.visibility)
                        : data.milestones;

                    setMilestones(fetchedMilestones);

                    if (onMilestonesFetched) {
                        onMilestonesFetched(fetchedMilestones);
                    }
                } catch (error) {
                    console.error("Error fetching milestones:", error.message);
                }
            }, 300); // Throttle API calls (300ms delay)
        };

        fetchMilestones();
    }, [simpleMode, onMilestonesFetched]); // Dependencies remain unchanged

    const toggleVisibility = async (id) => {
        if (simpleMode) return; // No visibility toggle in simpleMode

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

    if (simpleMode) {
        return (
            <div className="milestones-section">
                <h2>Milestones</h2>
                {filteredMilestones.length > 0 ? (
                    <ul className="milestones-list">
                        {filteredMilestones.map((milestone) => (
                            <li key={milestone._id} className="milestone-item">
                                {milestone.name}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No milestones available.</p>
                )}
            </div>
        );
    }

    return (
        <div className="milestones-section">
            <h2>Milestones</h2>
            <div className='milestones-header'>
                <p>You've gained {milestones.length} milestones</p>
                <div className="milestones-filters">
                    <button onClick={() => setFilter('All')} className={filter === 'All' ? 'active' : ''}>
                        All
                    </button>
                    <button onClick={() => setFilter('Visible')} className={filter === 'Visible' ? 'active' : ''}>
                        Visible
                    </button>
                    <button onClick={() => setFilter('Hidden')} className={filter === 'Hidden' ? 'active' : ''}>
                        Hidden
                    </button>
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Search milestones..."
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
                        <div className="milestone-details">
                            <h3>{milestone.name}</h3>
                            <p>{milestone.description}</p>
                        </div>
                        <img
                            className="visibility-icon"
                            src={milestone.visibility ? "/eye-icon.png" : "/eye-off-icon.png"}
                            alt="Toggle visibility"
                            onClick={() => toggleVisibility(milestone._id)}
                        />
                        <p className="milestone-date">
                            Unlocked on {new Date(milestone.date_unlocked).toLocaleDateString()}
                        </p>
                    </div>
                ))}
                {filteredMilestones.length === 0 && <p>No milestones found.</p>}
            </div>
        </div>
    );
};

export default Milestones;
