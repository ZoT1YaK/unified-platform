import React, { useEffect, useState } from 'react';
import axios from "axios";
import './Milestones.css';
import { useFilterAndSearch } from '../../hooks/useFilterAndSearch';
import useDebounce from '../../hooks/useDebounce';

const Milestones = ({ empId, simpleMode = false, onMilestonesFetched }) => {
    const [milestones, setMilestones] = useState([]);
    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const debouncedEmpId = useDebounce(empId, 500);
    const debouncedSearchQuery = useDebounce(searchQuery, 500);
    const filteredMilestones = useFilterAndSearch(milestones, filter, debouncedSearchQuery, "visibility", "name");


    useEffect(() => {
        const fetchMilestones = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("No token found. Skipping fetch.");
                return;
            }

            const loggedInUser = JSON.parse(localStorage.getItem("employee"));
            const fallbackEmpId = debouncedEmpId || loggedInUser?._id;

            try {
                const fetchURL = `${process.env.REACT_APP_BACKEND_URL}/api/milestones/get`;
                const response = await axios.get(fetchURL, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { emp_id: fallbackEmpId }, 
                });

                const fetchedMilestones = simpleMode
                    ? response.data.milestones.filter((milestone) => milestone.visibility)
                    : response.data.milestones;

                setMilestones(fetchedMilestones);

                if (onMilestonesFetched) {
                    onMilestonesFetched(fetchedMilestones);
                }
            } catch (error) {
                console.error(
                    "Error fetching milestones:",
                    error.response?.data?.message || error.message
                );
            }

        };

        fetchMilestones();
    }, [debouncedEmpId, simpleMode, onMilestonesFetched]);

    const toggleVisibility = async (id) => {
        if (simpleMode) return; // No visibility toggle in simpleMode
        try {
            const token = localStorage.getItem("token");
            const milestone = milestones.find((m) => m._id === id);

            const response = await axios.put(
                `${process.env.REACT_APP_BACKEND_URL}/api/milestones/visibility`,
                {
                    milestone_id: id,
                    visibility: !milestone.visibility,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const updatedMilestone = response.data;
            setMilestones((prevMilestones) =>
                prevMilestones.map((item) =>
                    item._id === updatedMilestone.milestone._id
                        ? { ...item, visibility: updatedMilestone.milestone.visibility }
                        : item
                )
            );
        } catch (error) {
            console.error(
                "Error updating milestone visibility:",
                error.response?.data?.message || error.message
            );
        }
    };


    if (simpleMode) {
        return (
            <div className="milestones-section">
                <p className='collected-mil'>You've collected {filteredMilestones.length} milestones</p>
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
            <div className="milestones-header">
                {/* <p>You've gained {milestones.length} milestones</p> */}
                <div className="milestones-filters">
                    <div className="event-search-wrapper">
                        <img
                            src="/magnifying-glass 1.png"
                            alt="Search Icon"
                            className="search-icon"
                        />
                        <input
                            type="text"
                            placeholder="Search for a milestone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="event-search"
                        />
                    </div>
                    <div className='mil-filters'>
                        <button onClick={() => setFilter("All")} className={filter === "All" ? "active" : ""}>
                            All
                        </button>
                        <button onClick={() => setFilter("Visible")} className={filter === "Visible" ? "active" : ""}>
                            Visible
                        </button>
                        <button onClick={() => setFilter("Hidden")} className={filter === "Hidden" ? "active" : ""}>
                            Hidden
                        </button>
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
