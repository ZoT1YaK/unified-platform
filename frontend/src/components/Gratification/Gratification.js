import React, { useState, useEffect } from "react";
import { fetchBadges, uploadBadges, archiveBadges, activateBadges } from "../../services/badgeService";
import { uploadDatamind, resetDatamind } from "../../services/datamindService";
import "./Gratification.css"

const Gratification = ({ onClose }) => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [selectedBadgeIds, setSelectedBadgeIds] = useState([]);
  const [activeBadges, setActiveBadges] = useState([]);
  const [archivedBadges, setArchivedBadges] = useState([]);
  const [badgeFile, setBadgeFile] = useState(null);

  const token = localStorage.getItem("token");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Fetch badges on mount
  useEffect(() => {
    const loadBadges = async () => {
      try {
        const { activeBadges, archivedBadges } = await fetchBadges(token);
        setActiveBadges(activeBadges);
        setArchivedBadges(archivedBadges);
      } catch (error) {
        console.error("Error fetching badges:", error);
        setMessage("Error fetching badges. Please try again later.");
      }
    };

    loadBadges();
  }, [token]);

  const handleBadgeFileChange = (e) => {
    setBadgeFile(e.target.files[0]);
  };

  const handleUploadBadges = async () => {
    if (!badgeFile) return setMessage("Please select a file.");
    const formData = new FormData();
    formData.append("file", badgeFile);
    try {
      const response = await uploadBadges(token, formData);
      setMessage(response.message);
      const { activeBadges, archivedBadges } = await fetchBadges(token);
      setActiveBadges(activeBadges);
      setArchivedBadges(archivedBadges);
    } catch (error) {
      console.error("Error uploading badges:", error);
      setMessage("Error uploading badges. Please try again.");
    }
  };

  const handleArchiveBadges = async () => {
    try {
      const response = await archiveBadges(token, selectedBadgeIds);
      setMessage(response.message);
      setSelectedBadgeIds([]);
      const { activeBadges, archivedBadges } = await fetchBadges(token);
      setActiveBadges(activeBadges);
      setArchivedBadges(archivedBadges);
    } catch (error) {
      setMessage("Error archiving badges. Please try again.");
    }
  };

  const handleActivateBadges = async () => {
    try {
      const response = await activateBadges(token, selectedBadgeIds);
      setMessage(response.message);
      setSelectedBadgeIds([]);
      const { activeBadges, archivedBadges } = await fetchBadges(token);
      setActiveBadges(activeBadges);
      setArchivedBadges(archivedBadges);
    } catch (error) {
      setMessage("Error activating badges. Please try again.");
    }
  };

  const handleUploadDatamind = async () => {
    if (!file) return setMessage("Please select a file.");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await uploadDatamind(token, formData);
      setMessage(response.message);
    } catch (error) {
      setMessage("Error uploading Datamind values. Please try again.");
    }
  };

  const handleResetDatamind = async () => {
    if (!window.confirm("Are you sure you want to reset all Datamind values?")) return;
    try {
      const response = await resetDatamind(token);
      setMessage(response.message);
    } catch (error) {
      setMessage("Error resetting Datamind values. Please try again.");
    }
  };

  return (
    <div className="gratification-modal-overlay" onClick={onClose}>
      <div className="gratification-modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="gratification-modal-close-button" onClick={onClose}>
          &times;
        </button>
        <div className="gratification-container">
          <div>
            <h2>Badge Management</h2>
            <input
              type="file"
              accept=".xlsx"
              onChange={handleBadgeFileChange}
            />
            <button className="gratification-upload-button" onClick={handleUploadBadges}>Upload New Badges</button>
            <h3>Active Badges</h3>
            <ul>
              {activeBadges.map((badge) => (
                <li key={badge._id}>
                  <input
                    type="checkbox"
                    value={badge._id}
                    onChange={(e) => {
                      const { checked, value } = e.target;
                      setSelectedBadgeIds((prev) =>
                        checked
                          ? [...prev, value]
                          : prev.filter((id) => id !== value)
                      );
                    }}
                  />
                  {badge.name}
                </li>
              ))}
            </ul>
            <h3>Archived Badges</h3>
            <ul>
              {archivedBadges.map((badge) => (
                <li key={badge._id}>
                  <input
                    type="checkbox"
                    value={badge._id}
                    onChange={(e) => {
                      const { checked, value } = e.target;
                      setSelectedBadgeIds((prev) =>
                        checked
                          ? [...prev, value]
                          : prev.filter((id) => id !== value)
                      );
                    }}
                  />
                  {badge.name}
                </li>
              ))}
            </ul>
            <div className="badge-control-buttons">
              <button className="badge-control-button" onClick={handleArchiveBadges}>Archive Selected Badges</button>
              <button className="badge-control-button" onClick={handleActivateBadges}>Activate Selected Badges</button>
              {message && <p>{message}</p>}
            </div>
          </div>
          <div>
            <h2>Datamind Management</h2>
            <button className="gratification-upload-button" onClick={handleResetDatamind} style={{ backgroundColor: "red", color: "white" }}>
              Reset Datamind</button>
            <br />
            <input type="file" accept=".xlsx" onChange={handleFileChange} />
            <button className="gratification-upload-button" onClick={handleUploadDatamind}>Upload Datamind</button>
            {message && <p>{message}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gratification;
