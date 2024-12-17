import React, { useEffect, useState } from "react";
import { updateNotificationPreference, fetchNotificationPreferences } from "../../services/notificationService";
import "./SettingsModal.css";

const SettingsModal = ({ onClose, isLeader }) => {
    const [allToggles, setAllToggles] = useState({});

    // Fetch preferences when modal is opened
    useEffect(() => {
        const fetchPreferences = async () => {
            try {
                const token = localStorage.getItem("token");
                const preferences = await fetchNotificationPreferences(token);

                const togglesState = {};
                preferences.forEach((item) => {
                    togglesState[item.type_name] = {
                        id: item.noti_type_id,
                        enabled: item.preference, // Assuming the backend provides a 'preference' field
                    };
                });

                console.log("Toggles State:", togglesState);
                setAllToggles(togglesState);
            } catch (error) {
                console.error("Error fetching preferences:", error.message);
            }
        };

        fetchPreferences();
    }, []);


    // Update preference on toggle click
    const handleToggle = async (key) => {
        const updatedValue = !allToggles[key].enabled;

        try {
            const token = localStorage.getItem("token");
            await updateNotificationPreference(token, allToggles[key].id, updatedValue);

            // Update the state only if the API call succeeds
            setAllToggles((prev) => ({
                ...prev,
                [key]: { ...prev[key], enabled: updatedValue }
            }));
        } catch (error) {
            console.error("Error updating preference:", error.message);
        }
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
