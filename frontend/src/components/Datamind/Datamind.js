import React from 'react';
import './Datamind.css';

const Datamind = ({ dataMind, dataMindOptions, handleDataMindChange, generateRandomDataMind }) => {
    return (
        <div className="datamind-container">
            {/* Overlay Heading */}
            <h2 className="datamind-heading">#IAm{dataMind}DataMind</h2>

            {/* Controls */}
            <div className="datamind-controls">
                <select
                    value={dataMind}
                    onChange={handleDataMindChange}
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
                <button onClick={generateRandomDataMind} className="datamind-button">
                    Generate
                </button>
            </div>
        </div>
    );
};

export default Datamind;
