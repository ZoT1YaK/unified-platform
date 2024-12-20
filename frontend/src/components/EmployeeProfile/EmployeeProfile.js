import React, { useState } from "react";
import "./EmployeeProfile.css";
import TopBar from "../TopBar/TopBar";
import Header from "../Header/Header";
import Achievements from "../Achievements/Achievements";
import Milestones from "../Milestones/Milestones";
import EmployeeDetails from "../EmployeeDetails/EmployeeDetails";
import Datamind from "../Datamind/Datamind";
import Analytics from "../Analytics/Analytics";
import EventCard from "../EventCard/EventCard";
import EmployeeTasks from "../EmployeeTasks/EmployeeTasks";
import UserPostTracker from "../UserPostTracker/UserPostTracker";

const EmployeeProfile = () => {
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [milestones, setMilestones] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [posts, setPosts] = useState([]);


  
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
            
            />
          </EmployeeDetails>

          {/* Analytics Section */}
          <Analytics
            achievementsCount={achievements?.length || 0}
            postsCount={posts?.length || 0} 
            milestonesCount={milestones?.length || 0}
          />

          {/* Posts and Events */}
          <div className="activity-events-container">
            <UserPostTracker
              onPostsFetched={(postData) => setPosts(postData)} />

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
