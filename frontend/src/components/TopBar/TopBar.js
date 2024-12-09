import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './TopBar.css';
import Notification from '../Notifications/Notifications';

const TopBar = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isLeader, setIsLeader] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const [showHistory, setShowHistory] = useState(false);

    useEffect(() => {
        const fetchUserDetails = async () => {
            const storedEmployee = localStorage.getItem('employee');
            if (storedEmployee) {
                const parsedEmployee = JSON.parse(storedEmployee);
                setUser(parsedEmployee);
                setIsLeader(parsedEmployee.is_people_leader || false); // Check if leader
            }
        };
        fetchUserDetails();
    }, []);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const toggleView = () => {
        if (location.pathname === '/leaderhub') {
            navigate('/profile');
        } else {
            navigate('/leaderhub');
        }
    };

    const toggleDropdown = () => {
        setIsDropdownOpen((prev) => !prev);
    };

    const handleViewProfile = () => {
        navigate('/profile');
        setIsDropdownOpen(false);
    };

    const handleLogout = () => {
        // Clear authentication details
        localStorage.removeItem('token');
        localStorage.removeItem('employee');
        setIsDropdownOpen(false); // Close dropdown
        navigate('/login'); // Redirect to login
    };

    const handleNavigateToDashboard = () => {
        navigate('/dashboard');
    };

    return (
        <div className="top-bar">
            {/* Left Icons */}
            <div className="left-icons">
                <img
                    src="/home-icon.png"
                    alt="Home Icon"
                    className="icon"
                    onClick={handleNavigateToDashboard} // Navigate to Dashboard
                />
                <img src="/Screenshot_1.png" alt="icon1" className="icon-peakon" />
                <img src="/Udemy-Emblem.png" alt="icon2" className="icon" />
                <img src="/5019634-middle.png" alt="icon3" className="icon" />
                <img src="/Microsoft_Office_SharePoint_(2019–present).svg.png" alt="icon4" className="icon" />
            </div>

            {/* Center Search Bar */}
            <div className="search-container">
                <input
                    type="text"
                    className="search-input"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search..."
                />
                <img src="/magnifying-glass 2.png" alt="search" className="search-icon" />
            </div>

            {/* Right Icons */}
            <div className="right-icons">
                <img src="/business (1).png" alt="icon6" className="icon" />

                {/* Notification Button */}
                <button
                    className="notification-button"
                    onClick={() => setShowHistory((prev) => !prev)}
                >
                    <img src="/notification.png" alt="Notifications" className="icon" />
                </button>
                {/* Notification Dropdown */}
                <Notification showHistory={showHistory} toggleHistory={() => setShowHistory(false)} />

                <div className="dropdown-user-container">
                    <img
                        src="/cat.png"
                        alt="User Avatar"
                        className="dropdown-user-avatar"
                        onClick={toggleDropdown}
                    />
                    {isDropdownOpen && (
                        <div className="dropdown-user-details">
                            <div className="dropdown-header">
                                <img
                                    src="/cat.png"
                                    alt="User Avatar"
                                    className="dropdown-user-avatar-large"
                                />
                                <div className="dropdown-user-info">
                                    <h2>
                                        {user?.f_name && user?.l_name
                                            ? `${user.f_name} ${user.l_name}`
                                            : 'User'}
                                    </h2>
                                    <p>
                                        {user?.position || 'Role'} | {user?.dep_id?.name || 'Team'}
                                    </p>
                                </div>
                            </div>
                            <hr />
                            <button
                                className="dropdown-view-profile-button"
                                onClick={handleViewProfile}
                            >
                                View Profile
                            </button>
                            <hr />
                            <hr />
                            <div className="dropdown-links">
                                <span className="dropdown-link">Settings</span>
                                <span className="dropdown-link">Help</span>
                                <span
                                    className="dropdown-link logout-link"
                                    onClick={handleLogout}
                                >
                                    Log Out
                                </span>
                            </div>
                        </div>
                    )}
                </div>
                {/* Conditional Button for Leaders */}
                {isLeader && (
                    <button className="leader-button" onClick={toggleView}>
                        <img src="spin.png" alt="switch-button" className="switch-button" />
                        {location.pathname === '/leaderhub' ? 'Profile' : 'Leader Hub'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default TopBar;
