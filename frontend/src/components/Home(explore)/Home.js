import React, { useState } from 'react';
import './Home.css';

const Home = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleFocus = () => {
        if (searchQuery === '') {
            setSearchQuery('');
        }
    };

    const handleBlur = () => {
        if (searchQuery === '') {
            setSearchQuery('');
        }
    };

    return (
        <div className="home-page">

            {/* Top Bar */}
            <div className="top-bar">
                <div className="left-icons">
                    <img src="/Screenshot_1.png" alt="icon1" className="icon-peakon" />
                    <img src="/Udemy-Emblem.png" alt="icon2" className="icon" />
                    <img src="/5019634-middle.png" alt="icon3" className="icon" />
                    <img src="/Microsoft_Office_SharePoint_(2019–present).svg.png" alt="icon4" className="icon" />
                </div>

                {/* Right Container (Search bar + Right icons) */}
                <div className="right-container">
                    <div className="search-container">
                        <img src='/magnifying-glass 2.png' alt="icon5" className='search-icon' />
                        <input
                            type="text"
                            className="search-input"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            placeholder="Search..."
                        />
                    </div>

                    <div className="right-icons">
                        <img src="/business (1).png" alt="icon6" className="icon" />
                        <img src="/notification.png" alt="icon7" className="icon" />
                        <img src="/cat.png" alt="icon8" className="icon" />
                    </div>
                </div>
            </div>

            {/* Header */}
            <div className="header">
                <h1>All Kinds of <span className="highlight">Data</span> Minds</h1>
            </div>

            {/* Active UI Container */}
            <div className="active-ui-container">

                <div className="profile-column">
                    {/* User Profile Overview */}
                    <div className="profile-container">
                        <div className='profile-container-top'></div>
                        <img src="/cat.png" alt="icon8" className="avatar" />
                        <div className="user-details">
                            <h2>Bob Bobrovich</h2>
                            <p>Head of HR | HR Team</p>
                            <p>bob.bobrovich@stibo.com</p>
                            <p className="message">I am #XDataMind</p>
                        </div>
                        <div className="stats">
                            <div className="stat">
                                24 <span className="stat-description">Achievements</span>
                            </div>
                            <div className="stat">
                                15 <span className="stat-description">Posts</span>
                            </div>
                            <div className="stat">
                                5 <span className="stat-description">Milestones</span>
                            </div>
                        </div>
                    </div>

                    {/* Achievements Overview (Gray box) */}
                    <div className="achievements-gray-box"></div>

                    {/* Milestones Overview (Gray box) */}
                    <div className="milestones-gray-box"></div>

                    <div className="post-column">

                        {/* Post Creation box (Gray box) */}
                        <div className="post-creation-gray-box"></div>

                        {/* Feed box (Gray box)*/}
                        <div className="post-feed-gray-box"></div>

                        <div className="tasks-column">

                            {/* Tasks box (Gray box) */}
                            <div className="tasks-gray-box"></div>

                            {/* Events box (Gray box) */}
                            <div className="events-gray-box"></div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
