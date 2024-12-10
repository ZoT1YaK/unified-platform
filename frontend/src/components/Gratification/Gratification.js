import React, { useState } from "react";
import axios from "axios";

const Gratification = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");


  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/badges/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Ensure the admin token is included
          },
        }
      );
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || "Error uploading badges.");
    }
  };

  const handleResetBadges = async () => {
    if (!window.confirm("Are you sure you want to reset all badges? This cannot be undone.")) {
      return;
    }

    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_BACKEND_URL}/api/badges/clear-badges`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Ensure admin token
          },
        }
      );
      setMessage(response.data.message || "All badges have been reset.");
    } catch (error) {
      setMessage(error.response?.data?.message || "Error resetting badges.");
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
        <button onClick={handleResetBadges} style={{ backgroundColor: "red", color: "white" }}>
          Reset Badges
        </button>
        <br />
        <input type="file" accept=".xlsx" onChange={handleFileChange} />
        <button onClick={handleUpload}>Upload New Badges</button>
        {message && <p>{message}</p>}
      </div>
      <div>
        <h2>Datamind Management</h2>
        <button onClick={handleResetDatamind} style={{ backgroundColor: "red", color: "white" }}>
          Reset Datamind</button>
          <br/>
        <input type="file" accept=".xlsx" onChange={handleFileChange} />
        <button onClick={handleUploadDatamind}>Upload Datamind</button>
        {message && <p>{message}</p>}
      </div>
    </div>

  );
};

export default Gratification;
