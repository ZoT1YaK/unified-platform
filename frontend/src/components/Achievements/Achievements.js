import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Achievements.css";
import { useFilterAndSearch } from "../../hooks/useFilterAndSearch";
import useDebounce from "../../hooks/useDebounce";

const Achievements = ({ empId, simpleMode = false, onAchievementsFetched }) => {
    const [achievements, setAchievements] = useState([]);
    const [filter, setFilter] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");

    const debouncedEmpId = useDebounce(empId, 500);
    const debouncedSearchQuery = useDebounce(searchQuery, 500);
    const filteredAchievements = useFilterAndSearch(
        achievements,
        filter,
        debouncedSearchQuery,
        "visibility",
        "badge_id.name"
    );

    useEffect(() => {
        const fetchAchievements = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("No token found. Skipping fetch.");
                return;
            }

            const loggedInUser = JSON.parse(localStorage.getItem("employee"));
            const fallbackEmpId = debouncedEmpId || loggedInUser?._id; // Default to logged-in user's ID if empId is missing

            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_BACKEND_URL}/api/achievements/get`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        params: {
                            emp_id: fallbackEmpId, 
                        },
                    }
                );

                const data = response.data;
                const filteredData = simpleMode
                    ? data.achievements.filter((achievement) => achievement.visibility)
                    : data.achievements;

                setAchievements(filteredData);

                if (onAchievementsFetched) {
                    onAchievementsFetched(filteredData);
                }
            } catch (error) {
                console.error("Error fetching achievements:", error.response?.data?.message || error.message);
            }
        };

        fetchAchievements();
    }, [debouncedEmpId, simpleMode, onAchievementsFetched]);



    const toggleVisibility = async (id) => {
        if (simpleMode) return;

        try {
            const token = localStorage.getItem("token");
            const achievement = achievements.find((a) => a._id === id);

            const response = await axios.put(
                `${process.env.REACT_APP_BACKEND_URL}/api/achievements/visibility`,
                {
                    achievement_id: id,
                    visibility: !achievement.visibility,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const updatedAchievement = response.data;
            setAchievements((prevAchievements) =>
                prevAchievements.map((item) =>
                    item._id === updatedAchievement.achievement._id
                        ? { ...item, visibility: updatedAchievement.achievement.visibility }
                        : item
                )
            );
        } catch (error) {
            console.error(
                "Error updating achievement visibility:",
                error.response?.data?.message || error.message
            );
        }
    };


    // Simplified layout for simpleMode or visited profiles
    if (simpleMode) {
        return (
            <div className="achievements-section">
                <p>You've collected {filteredAchievements.length} achievements</p>
                {achievements.length > 0 ? (
                    <ul className="achievements-simple-list">
                        {achievements.map((achievement) => (
                            <li key={achievement._id} className="achievement-item">
                                <img
                                    className="achievement-icon"
                                    src={achievement.badge_id?.img_link || "Ach-badge1.png"}
                                    alt={achievement.badge_id?.name || "Achievement Badge"}
                                />
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No achievements available.</p>
                )}
            </div>
        );
    }


    return (
        <div className="achievements-section">
            <h2>Achievements</h2>
            <div className="achievements-header">
                {/* <p>You've gained {achievements.length} achievements</p> */}
                <div className="achievements-filters">
                    <div className="event-search-wrapper">
                        <img
                            src="/magnifying-glass 1.png"
                            alt="Search Icon"
                            className="search-icon"
                        />
                        <input
                            type="text"
                            placeholder="Search for an achievement..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="event-search"
                        />
                    </div>
                    <div className="ach-filters">
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
            <div className="achievements-list">
                {filteredAchievements.map((achievement) => (
                    <div key={achievement._id} className="achievement-row">
                        <img
                            className="achievement-icon"
                            src={achievement.badge_id?.img_link || "Ach-badge1.png"}
                            alt={achievement.badge_id?.name || "Achievement Badge"}
                        />
                        <div className="achievement-details">
                            <h3>{achievement.badge_id?.name}</h3>
                            <p>{achievement.badge_id?.description}</p>
                        </div>
                        <img
                            className="visibility-icon"
                            src={achievement.visibility ? "/eye-icon.png" : "/eye-off-icon.png"}
                            alt="Toggle visibility"
                            onClick={() => toggleVisibility(achievement._id)}
                        />
                        <p className="achievement-date">
                            Unlocked on{" "}
                            {achievement.achievement_date
                                ? new Date(achievement.achievement_date).toLocaleDateString()
                                : "Unknown Date"}
                        </p>
                    </div>
                ))}
                {filteredAchievements.length === 0 && <p>No achievements found.</p>}
            </div>
        </div>
    );
};

export default Achievements;
