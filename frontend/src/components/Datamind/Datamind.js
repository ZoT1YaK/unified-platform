import React, { useState, useEffect } from "react";
import { fetchDatamindOptions, updateEmployeeDatamind } from "../../services/datamindService";
import { fetchDataMindType } from "../../services/employeeService";
import "./Datamind.css";

const Datamind = () => {
  const [dataMind, setDatamind] = useState("");
  const [dataMindOptions, setDatamindOptions] = useState([]); 
  const [message, setMessage] = useState("");

    // Fetch available Datamind options and current employee's Datamind on mount
    useEffect(() => {
      const loadDatamindData = async () => {
          const token = localStorage.getItem("token");
          if (!token) return;

          try {
              const options = await fetchDatamindOptions(token);
              setDatamindOptions(options);

              const currentDatamind = await fetchDataMindType(token); // Reusing employeeService
              setDatamind(currentDatamind?.datamind_id?._id || "");
          } catch (error) {
              console.error("Error fetching Datamind data:", error);
              setMessage("Error fetching Datamind data. Please try again later.");
          }
      };

      loadDatamindData();
  }, []);

  const handleDatamindChange = async (event) => {
      const selectedId = event.target.value;
      const selectedDatamind = dataMindOptions.find((item) => item._id === selectedId);

      try {
          const token = localStorage.getItem("token");
          await updateEmployeeDatamind(token, selectedId);
          setDatamind(selectedId);
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
        const token = localStorage.getItem("token");
        await updateEmployeeDatamind(token, randomDatamind._id);
        setDatamind(randomDatamind._id);
        setMessage(`Random Datamind generated: ${randomDatamind.data_mind_type}`);
    } catch (error) {
        console.error("Error generating random Datamind:", error);
        setMessage("Error generating random Datamind. Please try again.");
    }
};

  

  return (
    <div className="datamind-container">
      {/* Overlay Heading */}
      <h2 className="datamind-heading">#IAm{dataMindOptions.find(item => item._id === dataMind)?.data_mind_type || "X"}Datamind</h2>

      {/* Controls */}
      <div className="datamind-controls">
        <select
          value={dataMind}
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
