import {  fetchEmployeeProfile } from "../../services/employeeService";
import React, { useEffect, useState } from "react";
import "./EmployeeDetails.css";

const EmployeeDetails = ({ empId, mode = "own", children }) => {
    const [user, setUser] = useState(null);
    const [datamind, setDatamind] = useState(null);

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    console.error("No token found. Redirecting to login.");
                    window.location.href = "/login";
                    return;
                }
    
                const profile = await fetchEmployeeProfile(token, empId, mode);    
                setUser(profile);
    
                if (mode === "visited") {
                    setDatamind(profile.datamind);
                } else {
                    const storedEmployee = JSON.parse(localStorage.getItem("employee"));
                    setDatamind(storedEmployee.data_mind_type);
                }
            } catch (error) {
                console.error("Failed to fetch employee details:", error.message);
            }
        };

        fetchUserDetails();
    }, [empId, mode]);

    if (!user) {
        return <p>Loading employee details...</p>; // Display a loading state
    }

    return (
        <div className="employee-user-container">
            {/* Green Header Section */}
            <div className="employee-user-container-top">
                {mode === "own" ? (
                    children // Render Datamind generator or child components for "own" mode
                ) : (
                    <h3 className="datamind-header">#IAm{datamind ? datamind + "Datamind" : "No Datamind Generated"}</h3>
                )}
            </div>

            {/* User Avatar and Details */}
            <div className="employee-info">
                <img
                    src={`${user?.img_link || `${process.env.PUBLIC_URL || ''}/placeholder.png`}`}
                    alt="User Avatar"
                    className="employee-user-avatar"
                />
                <div className="employee-user-details">
                    <h2>
                        {user?.f_name && user?.l_name
                            ? `${user.f_name} ${user.l_name}`
                            : "User"}
                    </h2>
                    <p>
                        {user?.position || "Role"} | {user?.dep_id?.name || "Team"}
                    </p>
                    <p>{user?.location || "Location"}</p>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDetails;
