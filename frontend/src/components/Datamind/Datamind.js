import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Datamind.css";

const Datamind = () => {
  const [dataMind, setDatamind] = useState(localStorage.getItem("dataMind") || "");
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
        setDatamindOptions(optionsResponse.data.dataMinds);

        // Fetch the current employee's Datamind
        const employeeDatamindResponse = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/employees/get-data-mind-type`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const employeeDatamind = employeeDatamindResponse.data.employeeDatamind?.datamind_id.data_mind_type || "";
        setDatamind(employeeDatamind);
      } catch (error) {
        console.error("Error fetching Datamind data:", error);
        setMessage("Error fetching Datamind data. Please try again later.");
      }
    };

    fetchDatamind();
  }, []);

  

  const handleDatamindChange = async (event) => {
    const selectedId = event.target.value;
    const selectedDatamind = dataMindOptions.find((item) => item._id === selectedId);
    try {
      // Update the dataMind type for the employee
      await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/employees/data-mind-type`,
        { datamind_id: selectedId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setDatamind(selectedDatamind.data_mind_type);
      setMessage(`Datamind updated to ${selectedDatamind.data_mind_type}`);
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
        { datamind_id: randomDatamind._id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setDatamind(randomDatamind.data_mind_type); 
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
            <option key={option._id} value={option._id}>
              {option.data_mind_type}
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
