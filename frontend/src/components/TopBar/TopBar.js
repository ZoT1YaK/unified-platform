import React, { useEffect,useState } from 'react';
import './TopBar.css';

const TopBar = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [view, setView] = useState('Leader Hub'); 
    const [isLeader, setIsLeader] = useState(false);

    useEffect(() => {
        const storedEmployee = localStorage.getItem('employee');
        if (storedEmployee) {
            const parsedEmployee = JSON.parse(storedEmployee);
            setIsLeader(parsedEmployee.is_people_leader || false);
        }
    }, []);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const toggleView = () => {
        setView((prevView) => (prevView === 'Leader Hub' ? 'Profile' : 'Leader Hub'));
    };

    return (
        <div className="top-bar">
            {/* Left Icons */}
            <div className="left-icons">
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
                <img src="/notification.png" alt="icon7" className="icon" />
                <img src="/cat.png" alt="icon8" className="icon" />
                {/* Conditional Button for Leaders */}
                {isLeader && (
                    <button className="leader-button" onClick={toggleView}>
                        <img src="spin.png" alt="switch-button" className="switch-button" />
                        {view}
                    </button>
                )}
            </div>
        </div>
    );
};

export default TopBar;
