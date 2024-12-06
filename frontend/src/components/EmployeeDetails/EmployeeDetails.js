import React from 'react';
import './EmployeeDetails.css';

const EmployeeDetails = ({ name, position, location, avatar }) => {
    return (
        <div className="employee-user-container">
            {/* Green Header Section */}
            <div className="employee-user-container-top">
            </div>

            {/* User Avatar and Details */}
            <div className="employee-info">
                <img src={avatar} alt="User Avatar" className="employee-user-avatar" />
                <div className="employee-user-details">
                    <h2>{name}</h2>
                    <p>{position}</p>
                    <p>{location}</p>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDetails;
