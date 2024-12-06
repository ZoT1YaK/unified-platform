import React, { useState } from 'react';
import './EmployeeProfile.css';
import TopBar from '../TopBar/TopBar';
import Header from '../Header/Header';
import Achievements from '../Achievements/Achievements';
import Milestones from '../Milestones/Milestones';
import EmployeeDetails from '../EmployeeDetails/EmployeeDetails';
import Datamind from '../Datamind/Datamind';
import Analytics from '../Analytics/Analytics';
import Activity from '../Activity/Activity';
import EventCard from '../EventCard/EventCard';
import TaskStatus from '../TaskStatus/TaskStatus';
import EmployeeTasks from '../EmployeeTasks/EmployeeTasks';

const EmployeeProfile = () => {
    const [filter, setFilter] = useState("All");
    const [searchQuery, setSearchQuery] = useState('');
    const [dataMind, setDataMind] = useState("Curious");

    const dataMindOptions = ["Curious", "Creative", "Innovative", "Resilient", "Collaborative"];

    const generateRandomDataMind = () => {
        const randomIndex = Math.floor(Math.random() * dataMindOptions.length);
        setDataMind(dataMindOptions[randomIndex]);
    };

    const handleDataMindChange = (event) => {
        setDataMind(event.target.value);
    };


    const [achievements, setAchievements] = useState([
        { id: 1, title: "Ach-badge1", description: "Complete the annual biking contest", date: "12/12/2024", visible: true },
        { id: 2, title: "Ach-badge2", description: "Run the yearly marathon", date: "12/12/2024", visible: true },
        { id: 3, title: "Ach-badge3", description: "Recycle 50kg of paper waste", date: "12/12/2024", visible: true },
        { id: 4, title: "Ach-badge4", description: "Join the group cooking activity", date: "12/12/2024", visible: true },
        { id: 5, title: "Ach-badge5", description: "Build bird nests for the coming season", date: "12/12/2024", visible: false },
    ]);

    const [milestones, setMilestones] = useState([
        { id: 1, badge: "5", title: "Mil-badge1", description: "You've been with us for a whole 5 years!", date: "12/12/2024", visible: true },
        { id: 2, badge: "1", title: "Mil-badge2", description: "You've been with us for a whole year!", date: "12/12/2024", visible: true },
        { id: 3, badge: "0.5", title: "Mil-badge3", description: "You've been with us for a whole 6 months!", date: "12/12/2024", visible: true },
    ]);

    const toggleVisibility = (id, type) => {
        if (type === "achievement") {
            setAchievements((prevAchievements) =>
                prevAchievements.map((item) =>
                    item.id === id ? { ...item, visible: !item.visible } : item
                )
            );
        } else if (type === "milestone") {
            setMilestones((prevMilestones) =>
                prevMilestones.map((item) =>
                    item.id === id ? { ...item, visible: !item.visible } : item
                )
            );
        }
    };
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


    return (
        <div className="employee-profile-page">
            <TopBar />
            <Header />
            {/* Main Content */}
            <div className="content-flex">
                <div className="left-panel">
                    <Achievements
                        achievements={achievements}
                        filter={filter}
                        searchQuery={searchQuery}
                        toggleVisibility={toggleVisibility}
                        setFilter={setFilter}
                        setSearchQuery={setSearchQuery}
                    />
                    <Milestones
                        milestones={milestones}
                        filter={filter}
                        searchQuery={searchQuery}
                        toggleVisibility={toggleVisibility}
                        setFilter={setFilter}
                        setSearchQuery={setSearchQuery}
                    />
                </div>
                <div className="center-panel">
                    <EmployeeDetails
                        name="Bob Bobrovich"
                        position="Head of HR | HR Team"
                        location="Vejle, Region of Southern Denmark, Denmark"
                        avatar="/cat.png"
                    >
                        <Datamind
                            dataMind={dataMind}
                            dataMindOptions={dataMindOptions}
                            handleDataMindChange={handleDataMindChange}
                            generateRandomDataMind={generateRandomDataMind}
                        />
                    </EmployeeDetails>

                    <Analytics
                        achievementsCount={achievements.length}
                        postsCount={15}
                        milestonesCount={milestones.length}
                    />

                    {/* Activity and Events */}
                    <div className="activity-events-container">
                        <Activity />

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
                <div className="right-panel">
                    <TaskStatus />
                    <EmployeeTasks />
                </div>
            </div>


        </div>

    );
};

export default EmployeeProfile;