import React, { useState } from "react";
import "./EmployeeProfile.css";
import TopBar from "../TopBar/TopBar";
import Header from "../Header/Header";
import Achievements from "../Achievements/Achievements";
import Milestones from "../Milestones/Milestones";
import EmployeeDetails from "../EmployeeDetails/EmployeeDetails";
import Datamind from "../Datamind/Datamind";
import Analytics from "../Analytics/Analytics";
import Activity from "../Activity/Activity";
import EventCard from "../EventCard/EventCard";
import EmployeeTasks from "../EmployeeTasks/EmployeeTasks";

const EmployeeProfile = () => {
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [dataMind, setDataMind] = useState("Curious");
  const [milestones, setMilestones] = useState([]);
  const [achievements, setAchievements] = useState([]);

  const dataMindOptions = [
    "Curious",
    "Creative",
    "Innovative",
    "Resilient",
    "Collaborative",
  ];

  const generateRandomDataMind = () => {
    const randomIndex = Math.floor(Math.random() * dataMindOptions.length);
    setDataMind(dataMindOptions[randomIndex]);
  };

  const handleDataMindChange = (event) => {
    setDataMind(event.target.value);
  };

  return (
    <div className="employee-profile-page">
      <TopBar />
      <Header />
      {/* Main Content */}
      <div className="content-flex">
        <div className="left-panel">
          {/* Achievements Section */}
          <Achievements
            achievements={achievements}
            filter={filter}
            searchQuery={searchQuery}
            setFilter={setFilter}
            setSearchQuery={setSearchQuery}
            onAchievementsFetched={(achievementData) =>
              setAchievements(achievementData)
            }
          />

          {/* Milestones Section */}
          <Milestones
            filter={filter}
            searchQuery={searchQuery}
            setFilter={setFilter}
            setSearchQuery={setSearchQuery}
            onMilestonesFetched={(milestoneData) =>
              setMilestones(milestoneData.map((milestone) => milestone.name))
            }
          />
        </div>
        <div className="center-panel">
          {/* Employee Details Section */}
          <EmployeeDetails>
            <Datamind
              dataMind={dataMind}
              dataMindOptions={dataMindOptions}
              handleDataMindChange={handleDataMindChange}
              generateRandomDataMind={generateRandomDataMind}
            />
          </EmployeeDetails>

          {/* Analytics Section */}
          <Analytics
            achievementsCount={achievements.length}
            postsCount={15}
            milestonesCount={milestones.length}
          />

          {/* Activity and Events */}
          <div className="activity-events-container">
            <Activity />

            <div className="events-gray-box">
              <h2>Events</h2>
              {/* Fetch and display events directly from EventCard */}
              <EventCard />
            </div>
          </div>
        </div>
        <div className="right-panel">
          <EmployeeTasks />
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;
