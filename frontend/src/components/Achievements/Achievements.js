import React, { useEffect, useState } from "react";
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
                const response = await fetch(
                    `${process.env.REACT_APP_BACKEND_URL}/api/achievements/get?emp_id=${fallbackEmpId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch achievements");
                }

                const data = await response.json();
                const filteredData = simpleMode
                    ? data.achievements.filter((achievement) => achievement.visibility)
                    : data.achievements;

                setAchievements(filteredData);

                if (onAchievementsFetched) {
                    onAchievementsFetched(filteredData);
                }
            } catch (error) {
                console.error("Error fetching achievements:", error.message);
            }

        };

        fetchAchievements();
    }, [debouncedEmpId, simpleMode, onAchievementsFetched]);


    const toggleVisibility = async (id) => {
        if (simpleMode) return;

        try {
            const token = localStorage.getItem("token");
            const achievement = achievements.find((a) => a._id === id);
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/achievements/visibility`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    achievement_id: id,
                    visibility: !achievement.visibility,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to update visibility");
            }

            const updatedAchievement = await response.json();
            setAchievements((prevAchievements) =>
                prevAchievements.map((item) =>
                    item._id === updatedAchievement.achievement._id
                        ? { ...item, visibility: updatedAchievement.achievement.visibility }
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
                            placeholder="Search achievements..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <img src="/magnifying-glass 2.png" alt="Search" />
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
