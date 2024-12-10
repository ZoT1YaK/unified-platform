import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Datamind.css";

const Datamind = () => {
  const [dataMind, setDatamind] = useState(""); 
  const [dataMindOptions, setDatamindOptions] = useState([]); 
  const [message, setMessage] = useState("");

  // Fetch available Datamind options and current employee's Datamind on mount
  useEffect(() => {
    const fetchDatamind = async () => {
      try {
        // Fetch available Datamind options
        const optionsResponse = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/datamind/get`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setDatamindOptions(optionsResponse.data.dataMinds.map((item) => item.data_mind_type));

        // Fetch the current employee's Datamind
        const profileResponse = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/employees/profile`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setDatamind(profileResponse.data.profile.data_mind_type || "");
      } catch (error) {
        console.error("Error fetching Datamind data:", error);
        setMessage("Error fetching Datamind data. Please try again later.");
      }
    };

    fetchDatamind();
  }, []);

  

  const handleDatamindChange = async (event) => {
    const selectedDatamind = event.target.value;
    try {
      // Update the dataMind type for the employee
      await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/employees/data-mind-type`,
        { data_mind_type: selectedDatamind },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setDatamind(selectedDatamind);
      setMessage(`Datamind updated to ${selectedDatamind}`);
    } catch (error) {
      console.error("Error updating Datamind:", error);
      setMessage("Error updating Datamind. Please try again.");
    }
  };

  const generateRandomDatamind = async () => {
    if (dataMindOptions.length === 0) {
      setMessage("No Datamind options available.");
      return;
    }
  
    const randomIndex = Math.floor(Math.random() * dataMindOptions.length);
    const randomDatamind = dataMindOptions[randomIndex];

    try {
      await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/employees/data-mind-type`,
        { data_mind_type: randomDatamind },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setDatamind(randomDatamind); 
    } catch (error) {
      console.error("Error generating random Datamind:", error.response || error);
      setMessage("Error generating random Datamind. Please try again.");
    }
  };
  

  return (
    <div className="datamind-container">
      {/* Overlay Heading */}
      <h2 className="datamind-heading">#IAm{dataMind || "X"}Datamind</h2>

      {/* Controls */}
      <div className="datamind-controls">
        <select
          value={dataMind || ""}
          onChange={handleDatamindChange}
          className="datamind-dropdown"
        >
          <option disabled value="">
            What is your Data Mind?
          </option>
          {dataMindOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <button onClick={generateRandomDatamind} className="datamind-button">
          Generate
        </button>
      </div>

      {/* Message */}
      {message && <p className="datamind-message">{message}</p>}
    </div>
  );
};

export default Datamind;
