import React from 'react';
import { useState } from 'react';
import './Home.css';
import EventCard from './../EventCard/EventCard';
import TopBar from '../TopBar/TopBar';
import TaskCard from '../TaskCard/TaskCard';

const Home = () => {
    // Search state for filtering tasks
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const achievements = [
        "Ach-badge1", "Ach-badge2", "Ach-badge3", "Ach-badge4", "Ach-badge5"
    ];

    const milestones = ["Mil-badge1", "Mil-badge2", "Mil-badge3"];

    // Mock data for events (to be replaced by backend data later)
    const events = [
        {
            thumbnail: '/PaintingEvent.png',
            date: '09/09/24',
            title: 'Lets paint!',
            description: 'Join us on the big yearly marathon, sed do eiusmod tempor incididunt ...',
            location: 'My Region',
        },
        {
            thumbnail: '/RecycleEvent.jpeg',
            date: '10/10/24',
            title: 'Let’s recycle in the office!',
            description: 'Join us on the big yearly marathon, sed do eiusmod tempor incididunt ...',
            location: 'My Region',
        },
        {
            thumbnail: '/UglySweaterEvent.jpg',
            date: '12/12/24',
            title: 'Ugly Sweater Weather',
            description: 'Join us on the big yearly marathon, sed do eiusmod tempor incididunt ...',
            location: 'Other Region',
        },
        {
            thumbnail: '/MarathonEvent.jpg',
            date: '08/11/24',
            title: 'The Yearly Big Marathon!',
            description: 'Join us on the big yearly marathon, sed do eiusmod tempor incididunt ...',
            location: 'Other Region',
        },
        {
            thumbnail: '/WorkshopEvent.png',
            date: '03/12/24',
            title: '3D Design Workshop',
            description: 'Join us on the big yearly marathon, sed do eiusmod tempor incididunt ...',
            location: 'My Region',
        },
    ];

    // Separate events by location
    const myRegionEvents = events.filter(event => event.location === 'My Region');
    const otherRegionEvents = events.filter(event => event.location !== 'My Region');

    // Sort by date (earliest first)
    const sortByDate = (eventA, eventB) => {
        const dateA = new Date(eventA.date);
        const dateB = new Date(eventB.date);
        return dateA - dateB;
    };

    const sortedMyRegionEvents = myRegionEvents.sort(sortByDate);
    const sortedOtherRegionEvents = otherRegionEvents.sort(sortByDate);

    // Randomly display some other region events
    const randomOtherRegionEvents = sortedOtherRegionEvents.slice(0, 2);

    // Mock tasks (to be replaced by backend data later)
    const tasks = [
        {
            title: "Order necessary hardware through Tango",
            deadline: "12/12/2024",
            resources: ["Hardware", "Tango Account"],
            isChecked: false,
            isAssignedByLeader: true,
        },
        {
            title: "Complete the learning path for the first month",
            deadline: "12/12/2024",
            resources: ["Learning Portal", "Mentor"],
            isChecked: false,
            isAssignedByLeader: true,
        },
        {
            title: "To do X",
            deadline: null,
            resources: [],
            isChecked: false,
            isAssignedByLeader: false,
        },
        {
            title: "To do Y",
            deadline: null,
            resources: [],
            isChecked: false,
            isAssignedByLeader: false,
        },
        {
            title: "To do Z",
            deadline: "12/12/2024",
            resources: ["Tool E", "Guide F"],
            isChecked: true,
            isAssignedByLeader: false,
        }
    ];

    // Filter tasks based on the search query
    const filteredTasks = tasks.filter((task) => {
        return task.title.toLowerCase().includes(searchQuery.toLowerCase());
    });


    return (
        <div className="home-page">
            <TopBar />

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

                    {/* Achievements Overview */}
                    <div className="achievements-container">
                        <h2>Achievements</h2>
                        <div className="achievements-box">
                            <p className="achievements-count">You've gained {achievements.length} achievements</p>
                            <div className="achievements-row">
                                {achievements.slice(0, 10).map((achievement, index) => (
                                    <img
                                        key={index}
                                        src={`/${achievement}.png`}
                                        alt={`Achievement ${index + 1}`}
                                        className="achievement-icon"
                                    />
                                ))}
                                {achievements.length > 10 && <img src="/plus.png" alt="Plus" className="plus-icon" />}
                            </div>
                        </div>
                    </div>

                    {/* Milestones Overview */}
                    <div className="milestones-container">
                        <h2>Milestones</h2>
                        <div className="milestones-box">
                            <p className="milestones-count">You've gained {milestones.length} milestones</p>
                            <div className="milestones-row">
                                {milestones.map((milestone, index) => (
                                    <img
                                        key={index}
                                        src={`/${milestone}.png`}
                                        alt={`Milestone ${index + 1}`}
                                        className="milestone-icon"
                                    />
                                ))}
                                {milestones.length > 10 && <img src="/plus.png" alt="Plus" className="plus-icon" />}
                            </div>
                        </div>
                    </div>

                </div>


                <div className="post-column">
                    {/* Post Creation and Feed boxes */}
                    <div className="post-creation-gray-box"></div>
                    <div className="post-feed-gray-box"></div>
                </div>


                <div className="tasks-column">
                    {/* Tasks and Events boxes */}
                    <div className="tasks-gray-box">
                        {/* Search input for filtering tasks */}
                        <div className="task-search-container">
                            <div className="task-search-wrapper">
                                <img src="/magnifying-glass 1.png" alt="Search Icon" className="search-icon" />
                                <input
                                    type="text"
                                    className="task-search"
                                    placeholder="Search for a task..."
                                    value={searchQuery}  // The value is controlled by the searchQuery state
                                    onChange={handleSearchChange}  // This is where the function is used
                                />
                            </div>
                        </div>

                        {/* Tasks assigned by the people's leader */}
                        <div className="tasks-box">

                            {/* Tasks assigned by the people's leader */}
                            {filteredTasks.filter(task => task.isAssignedByLeader).map((task, index) => (
                                <TaskCard
                                    key={index}
                                    title={task.title}
                                    deadline={task.deadline}
                                    resources={task.resources}
                                    isChecked={task.isChecked}
                                    isAssignedByLeader={task.isAssignedByLeader}
                                />
                            ))}

                            {/* Horizontal line between task sections */}
                            <hr />

                            {/* Tasks created by the employee */}
                            {filteredTasks.filter(task => !task.isAssignedByLeader).map((task, index) => (
                                <TaskCard
                                    key={index}
                                    title={task.title}
                                    deadline={task.deadline}
                                    resources={task.resources}
                                    isChecked={task.isChecked}
                                    isAssignedByLeader={task.isAssignedByLeader}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="events-gray-box">
                        <div className="events-list">
                            {sortedMyRegionEvents.map((event, index) => (
                                <EventCard
                                    key={index}
                                    thumbnail={event.thumbnail}
                                    date={event.date}
                                    title={event.title}
                                    description={event.description}
                                />
                            ))}
                        </div>
                        <hr />
                        <h2>You might also like ...</h2>
                        <div className="events-list">
                            {randomOtherRegionEvents.map((event, index) => (
                                <EventCard
                                    key={index}
                                    thumbnail={event.thumbnail}
                                    date={event.date}
                                    title={event.title}
                                    description={event.description}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;