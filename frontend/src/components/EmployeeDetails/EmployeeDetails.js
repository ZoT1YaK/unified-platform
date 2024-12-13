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

                const query = mode === "visited" ? `/${empId}` : "";
                const response = await fetch(
                    `${process.env.REACT_APP_BACKEND_URL}/api/employees/profile${query}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch employee details.");
                }

                const data = await response.json();
                setUser(data.profile);

                console.log("Fetched employee details:", data.profile); // Add this log

                if (mode === "visited") {
                    setDatamind(data.profile.datamind); // Fetch Datamind value for visited profiles
                }
                const storedEmployee = localStorage.getItem('employee');
                if (storedEmployee) {
                    const parsedEmployee = JSON.parse(storedEmployee);
                    setUser(parsedEmployee);
                } else {
                    console.warn('No employee data found in localStorage.');
                    window.location.href = '/login';
                }
            } catch (error) {
                console.error('Failed to parse employee data:', error);
                window.location.href = '/login';
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
                    <h3 className="datamind-header">#{datamind || "No Datamind Generated"}</h3>
                )}
            </div>

            {/* User Avatar and Details */}
            <div className="employee-info">
                <img
                    src={user?.img_link || '/placeholder.png'}
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
