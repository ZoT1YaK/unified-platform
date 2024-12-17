import React, { useEffect, useState } from 'react';
import { fetchEmployees } from '../../services/employeeService';
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
        const loadEmployees = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const employees = await fetchEmployees(token); 
                setSearchResults(employees);
            } catch (error) {
                console.error("Error fetching employees:", error.message);
            }
        };
        loadEmployees();
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
                {/* Peakon Employee Voice */}
                <a href="https://www.peakon.com" target="_blank" rel="noopener noreferrer">
                    <img src="/Screenshot_1.png" alt="Peakon Employee Voice" className="icon-peakon" />
                </a>

                {/* Udemy */}
                <a href="https://www.udemy.com" target="_blank" rel="noopener noreferrer">
                    <img src="/Udemy-Emblem.png" alt="Udemy" className="icon" />
                </a>

                {/* Workday */}
                <a href="https://www.workday.com" target="_blank" rel="noopener noreferrer">
                    <img src="/5019634-middle.png" alt="Workday" className="icon" />
                </a>

                {/* SharePoint */}
                <a href="https://www.microsoft.com/en-us/microsoft-365/sharepoint/collaboration" target="_blank" rel="noopener noreferrer">
                    <img src="/Microsoft_Office_SharePoint_(2019–present).svg.png" alt="SharePoint" className="icon" />
                </a>
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
                {/* Microsoft Teams */}
                <a href="https://teams.microsoft.com" target="_blank" rel="noopener noreferrer">
                    <img src="/business (1).png" alt="Microsoft Teams" className="icon" />
                </a>

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
