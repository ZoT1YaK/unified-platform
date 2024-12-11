import React, { useState, useEffect } from "react";
import axios from "axios";

const Gratification = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [selectedBadgeIds, setSelectedBadgeIds] = useState([]);
  const [activeBadges, setActiveBadges] = useState([]);
  const [archivedBadges, setArchivedBadges] = useState([]);
  const [badgeFile, setBadgeFile] = useState(null);



  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Fetch badges on mount
  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/badges/get`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setActiveBadges(response.data.activeBadges || []);
        setArchivedBadges(response.data.archivedBadges || []);
      } catch (error) {
        console.error("Error fetching badges:", error);
        setMessage("Error fetching badges. Please try again later.");
      }
    };

    fetchBadges();
  }, []);
  const handleBadgeFileChange = (e) => {
    setBadgeFile(e.target.files[0]);
  };

  const handleUploadBadges = async () => {
    if (!badgeFile) {
      setMessage("Please select a file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", badgeFile);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/badges/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setMessage(response.data.message);
      // Refresh the badge list after uploading
      const badgesResponse = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/badges/get`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setActiveBadges(badgesResponse.data.activeBadges || []);
      setArchivedBadges(badgesResponse.data.archivedBadges || []);
    } catch (error) {
      console.error("Error uploading badges:", error);
      setMessage("Error uploading badges. Please try again.");
    }
  };

  const handleArchiveBadges = async () => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/badges/archive`,
        { ids: selectedBadgeIds },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setMessage(response.data.message);
      setSelectedBadgeIds([]); 
    
      const badgesResponse = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/badges/get`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setActiveBadges(badgesResponse.data.activeBadges || []);
      setArchivedBadges(badgesResponse.data.archivedBadges || []);
    } catch (error) {
      console.error("Error archiving badges:", error);
      setMessage("Error archiving badges. Please try again.");
    }
  };
  
  const handleActivateBadges = async () => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/badges/restore`,
        { ids: selectedBadgeIds },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setMessage(response.data.message);
      setSelectedBadgeIds([]); 
      const badgesResponse = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/badges/get`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setActiveBadges(badgesResponse.data.activeBadges || []);
      setArchivedBadges(badgesResponse.data.archivedBadges || []);
    } catch (error) {
      console.error("Error activating badges:", error);
      setMessage("Error activating badges. Please try again.");
    }
  };

  const handleUploadDatamind = async () => {
    if (!file) {
      setMessage("Please select a file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/datamind/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || "Error uploading Datamind values.");
    }
  };

  const handleResetDatamind = async () => {
    if (!window.confirm("Are you sure you want to reset all Datamind values?")) {
      return;
    }

    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_BACKEND_URL}/api/datamind/reset`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setMessage(response.data.message || "All Datamind values have been reset.");
    } catch (error) {
      setMessage(error.response?.data?.message || "Error resetting Datamind values.");
    }
  };

  return (
    <div className="gratification-container">
      <div>
        <h2>Badge Management</h2>
        <input
          type="file"
          accept=".xlsx"
          onChange={handleBadgeFileChange}
        />
        <button onClick={handleUploadBadges}>Upload New Badges</button>
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
        <button onClick={handleArchiveBadges}>Archive Selected Badges</button>
        <button onClick={handleActivateBadges}>Activate Selected Badges</button>
        {message && <p>{message}</p>}
      </div>
      <div>
        <h2>Datamind Management</h2>
        <button onClick={handleResetDatamind} style={{ backgroundColor: "red", color: "white" }}>
          Reset Datamind</button>
        <br />
        <input type="file" accept=".xlsx" onChange={handleFileChange} />
        <button onClick={handleUploadDatamind}>Upload Datamind</button>
        {message && <p>{message}</p>}
      </div>
    </div>

  );
};

export default Gratification;
