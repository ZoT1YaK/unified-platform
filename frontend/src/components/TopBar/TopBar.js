import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './TopBar.css';
import Notification from '../Notifications/Notifications';
import SettingsModal from '../SettingsModal/SettingsModal';
import Gratification from '../Gratification/Gratification';


const TopBar = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLeader, setIsLeader] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [showHistory, setShowHistory] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isGratificationModalOpen, setIsGratificationModalOpen] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    const handleOpenSettingsModal = () => setIsSettingsModalOpen(true);
    const handleCloseSettingsModal = () => setIsSettingsModalOpen(false);

    const handleOpenGratificationModal = () => setIsGratificationModalOpen(true);
    const handleCloseGratificationModal = () => setIsGratificationModalOpen(false);

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

    useEffect(() => {
        const fetchEmployees = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found.');
                return;
            }

            try {
                const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/employees/all`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch employees.');
                }

                const data = await response.json();
                setSearchResults(data.employees); // Populate initial list of employees
            } catch (error) {
                console.error('Error fetching employees:', error.message);
            }
        };

        fetchEmployees();
    }, []);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleEmployeeClick = (employeeId) => {
        navigate(`/profile/${employeeId}`);
        setSearchQuery(''); // Clear search input after navigation
    };

    const filteredResults = searchResults.filter((employee) =>
        `${employee.f_name} ${employee.l_name}`.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                    placeholder="Search employees..."
                />
                <img src="/magnifying-glass 2.png" alt="search" className="search-icon" />
                {searchQuery && (
                    <ul className="search-results">
                        {filteredResults.length > 0 ? (
                            filteredResults.map((employee) => (
                                <li
                                    key={employee._id}
                                    onClick={() => handleEmployeeClick(employee._id)}
                                    className="search-result-item"
                                >
                                    {employee.f_name} {employee.l_name}
                                </li>
                            ))
                        ) : (
                            <li className="no-results">No results found.</li>
                        )}
                    </ul>
                )}
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
                        src={user?.img_link || "/placeholder.png"}
                        alt="User Avatar"
                        className="dropdown-user-avatar"
                        onClick={toggleDropdown}
                    />
                    {isDropdownOpen && (
                        <div className="dropdown-user-details">
                            <div className="dropdown-header">
                                <img
                                    src={user?.img_link || "/placeholder.png"}
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
                            <div className="dropdown-links">
                                <button className="settings-button" onClick={handleOpenSettingsModal}>
                                    Settings
                                </button>
                                {isSettingsModalOpen && <SettingsModal onClose={handleCloseSettingsModal} isLeader={isLeader} />}
                                <hr />
                                {user?.is_admin && ( // Only allow access for admin
                                    <>
                                        <button
                                            className="gratification-button"
                                            onClick={() => {
                                                console.log("Opening Gratification Modal");
                                                handleOpenGratificationModal();
                                            }}
                                        >
                                            Gratification System
                                        </button>
                                        {isGratificationModalOpen && (
                                            <Gratification
                                                onClose={() => {
                                                    console.log("Closing Gratification Modal");
                                                    handleCloseGratificationModal();
                                                }}
                                            />
                                        )}
                                        <hr />
                                    </>
                                )}
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
