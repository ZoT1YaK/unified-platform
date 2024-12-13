import React, { useEffect, useState } from 'react';
import './EmployeeDetails.css';

const EmployeeDetails = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
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
    }, []);

    return (
        <div className="employee-user-container">
            {/* Green Header Section */}
            <div className="employee-user-container-top">
                {children /* Render child component Datamind */}
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
                            : 'User'}
                    </h2>
                    <p>
                        {user?.position || 'Role'} | {user?.dep_id?.name || 'Team'}
                    </p>
                    <p>{user?.location || 'Location'}</p>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDetails;
