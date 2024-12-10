import React, { useEffect, useState } from "react";
import "./Home.css";
import EventCard from "../EventCard/EventCard"; // This fetches and displays events
import TopBar from "../TopBar/TopBar";
import TaskCard from "../TaskCard/TaskCard";
import Header from "../Header/Header";
import PostCreation from "../PostCreation/PostCreation";
import PostComponent from "../PostComponent/Post";
import Milestones from "../Milestones/Milestones";
import Achievements from "../Achievements/Achievements";
import useAnalytics from "../../hooks/useAnalytics";
import Gratification from "../Gratification/Gratification";

const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState({});
  const [posts, setPosts] = useState([]);
  const analytics = useAnalytics();

  // Fetch user data from localStorage
  useEffect(() => {
    try {
      const storedEmployee = localStorage.getItem("employee");
      if (storedEmployee) {
        setUser(JSON.parse(storedEmployee));
      } else {
        console.warn("No employee data found in localStorage.");
        window.location.href = "/login"; // Redirect to login if not authenticated
      }
    } catch (error) {
      console.error("Failed to parse employee data:", error);
      window.location.href = "/login";
    }
  }, []);

  // Fetch posts from the backend
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/posts/get`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }

        const data = await response.json();
        setPosts(data.posts);
      } catch (error) {
        console.error("Error fetching posts:", error.message);
      }
    };

    fetchPosts();
  }, []);

  // Task search handler
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value); // Update search query state
  };

  return (
    <div className="home-page">
      <TopBar />
      <Header />

      {/* Active UI Container */}
      <div className="active-ui-container">
        <div className="profile-column">
          {/* User Profile Overview */}
          <div className="profile-container">
            <div className="profile-container-top"></div>
            <img src="/cat.png" alt="icon8" className="avatar" />
            <div className="user-details">
              <h2>
                {user.f_name && user.l_name
                  ? `${user.f_name} ${user.l_name}`
                  : "User"}
              </h2>
              <p>
                {user.position || "Role"} | {user.dep_id?.name || "Team"}
              </p>
              <p>{user.location || "Location"}</p>
              <p className="message">I am #{user.data_mind_type}Datamind</p>            </div>
            <div className="stats">
              <div className="stat">
                {analytics.achievementsCount}{" "}
                <span className="stat-description">Achievements</span>
              </div>
              <div className="stat">
                {analytics.postsCount}{" "}
                <span className="stat-description">Posts</span>
              </div>
              <div className="stat">
                {analytics.milestonesCount}{" "}
                <span className="stat-description">Milestones</span>
              </div>
            </div>
          </div>

          {/* Achievements Overview */}
          <div className="achievements-container">
            <h2>Achievements</h2>
            <Achievements simpleMode />
          </div>

          {/* Milestones Overview */}
          <div className="milestones-container">
            <h2>Milestones</h2>
            <Milestones simpleMode />
            {user.is_admin && <Gratification />}
          </div>

        </div>


        <div className="post-column">
          {/* Post Creation and Feed boxes */}
          <div className="post-creation-gray-box">
            <PostCreation
              user={{
                name: `${user.f_name || "User"} ${user.l_name || ""}`,
                avatar: user.avatar || "/cat.png",
              }}
            />
          </div>

          <div className="post-feed-gray-box">
            {posts.length > 0 ? (
              posts.map((post, index) => (
                <PostComponent
                  key={index}
                  user={{
                    name: `${post.author.f_name} ${post.author.l_name}`,
                    avatar: "/cat.png", // Placeholder avatar
                    position: post.author.position,
                  }}
                  post={{
                    description: post.content,
                    likes: post.likes,
                    comments: post.comments || [], // Ensure comments is an array
                    timeAgo: new Date(post.timestamp).toLocaleDateString(),
                    attachments: [], // Adjust if your API provides attachments
                  }}
                />
              ))
            ) : (
              <p>No posts available.</p>
            )}
          </div>
        </div>

        <div className="tasks-column">
          {/* Tasks and Events boxes */}
          <div className="tasks-gray-box">
            {/* Search input for filtering tasks */}
            <div className="task-search-container">
              <div className="task-search-wrapper">
                <img
                  src="/magnifying-glass 1.png"
                  alt="Search Icon"
                  className="search-icon"
                />
                <input
                  type="text"
                  className="task-search"
                  placeholder="Search for a task..."
                  value={searchQuery} // The value is controlled by the searchQuery state
                  onChange={handleSearchChange} // This is where the function is used
                />
              </div>
            </div>

            {/* Tasks assigned by the people's leader */}
            <div className="tasks-box">
              <TaskCard searchQuery={searchQuery} />
            </div>
          </div>

          <div className="events-gray-box">
            <h2>Events</h2>
            {/* Fetch and display events directly from EventCard */}
            <EventCard />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
