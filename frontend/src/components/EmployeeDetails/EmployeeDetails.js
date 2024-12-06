import React from 'react';
import './EmployeeDetails.css';

const EmployeeDetails = ({ name, position, location, avatar, children }) => {
    return (
        <div className="employee-user-container">
            {/* Green Header Section */}
            <div className="employee-user-container-top">
                {children /* This will render any child component, such as Datamind */}
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
