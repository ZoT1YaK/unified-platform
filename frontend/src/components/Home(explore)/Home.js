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

            <div className="top-bar">

                <div className="left-icons">
                    <img src="/Screenshot_1.png" alt="icon1" className="icon-peakon" />
                    <img src="/Udemy-Emblem.png" alt="icon2" className="icon" />
                    <img src="/5019634-middle.png" alt="icon3" className="icon" />
                    <img src="/Microsoft_Office_SharePoint_(2019–present).svg.png" alt="icon4" className="icon" />
                </div>

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
    );
};

export default Home;
