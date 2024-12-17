import React, { useEffect, useState } from "react";
import { fetchAchievements, toggleAchievementVisibility } from "../../services/achievementService";
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

    // Fetch achievements
    useEffect(() => {
        const loadAchievements = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("No token found. Skipping fetch.");
                return;
            }

            const loggedInUser = JSON.parse(localStorage.getItem("employee"));
            const fallbackEmpId = debouncedEmpId || loggedInUser?._id;

            try {
                const fetchedData = await fetchAchievements(token, fallbackEmpId);
                const filteredData = simpleMode
                    ? fetchedData.filter((achievement) => achievement.visibility)
                    : fetchedData;

                setAchievements(filteredData);
                if (onAchievementsFetched) onAchievementsFetched(filteredData);
            } catch (error) {
                console.error("Error fetching achievements:", error.message);
            }
        };

        loadAchievements();
    }, [debouncedEmpId, simpleMode, onAchievementsFetched]);

    // Toggle visibility
    const toggleVisibility = async (id) => {
        if (simpleMode) return;

        try {
            const token = localStorage.getItem("token");
            const achievement = achievements.find((a) => a._id === id);

            const updatedAchievement = await toggleAchievementVisibility(
                token,
                id,
                !achievement.visibility
            );

            setAchievements((prevAchievements) =>
                prevAchievements.map((item) =>
                    item._id === updatedAchievement._id
                        ? { ...item, visibility: updatedAchievement.visibility }
                        : item
                )
            );
        } catch (error) {
            console.error("Error updating achievement visibility:", error.message);
        }
    };



    // Simplified layout for simpleMode or visited profiles
    if (simpleMode) {
        return (
            <div className="achievements-section">
                <p className="collected-ach">You've collected {filteredAchievements.length} achievements</p>
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
