import React, { useEffect, useState } from "react";
import "./SettingsModal.css";

const SettingsModal = ({ onClose, isLeader }) => {
    const [allToggles, setAllToggles] = useState({});

    // Fetch preferences when modal is opened
    useEffect(() => {
        const fetchPreferences = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/notifications/preferences`, {
                    method: "GET",
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                });
                const data = await response.json();

                // Map backend preferences to state
                const togglesState = {};

                data.forEach((item) => {
                    togglesState[item.type_name] = {
                        id: item.noti_type_id,
                        enabled: item.preference // Assuming the backend provides a 'preference' field
                    };
                });
                console.log(togglesState);
                setAllToggles(togglesState);
            } catch (error) {
                console.error("Error fetching preferences:", error);
            }
        };

        fetchPreferences();
    }, []);

    // Update preference on toggle click
    const updatePreference = async (notiTypeId, preference) => {
        try {
            await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/notifications/preferences`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ noti_type_id: notiTypeId, preference }),
            });
        } catch (error) {
            console.error("Error updating preference:", error);
        }
    };

    const handleToggle = (key) => {
        const updatedValue = !allToggles[key].enabled;
        setAllToggles((prev) => ({
            ...prev,
            [key]: { ...prev[key], enabled: updatedValue }
        }));
        updatePreference(allToggles[key].id, updatedValue);
    };

    return (
        <div className="settings-modal-overlay" onClick={onClose}>
            <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>
                    &times;
                </button>
                <h2>Settings</h2>
                <div className="notification-preferences">
                    <h3>Notification Preferences</h3>
                    {Object.entries(allToggles).map(([key, value]) => {
                        const isLeaderToggle = value.id === "6755dd05a0a0a0f28642923c" || value.id === "6755dd05a0a0a0f28642923d";

                        if (isLeaderToggle && !isLeader) return null;

                        return (
                            <div key={key} className="toggle-container">
                                <label>{key}</label>
                                <div
                                    className={`toggle ${value.enabled ? "active" : "inactive"}`}
                                    onClick={() => handleToggle(key)}
                                >
                                    <div className="toggle-ball"></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
