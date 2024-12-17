import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Home.css";
import EventCard from "../EventCard/EventCard";
import TopBar from "../TopBar/TopBar";
import TaskCard from "../TaskCard/TaskCard";
import Header from "../Header/Header";
import PostCreation from "../PostCreation/PostCreation";
import PostComponent from "../PostComponent/Post";
import Milestones from "../Milestones/Milestones";
import Achievements from "../Achievements/Achievements";
import useAnalytics from "../../hooks/useAnalytics";

const Home = () => {
  const [user, setUser] = useState({});
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const postsPerPage = 7;
  const analytics = useAnalytics(user?._id); // Use _id instead of id
  console.log("Using Employee _id for Analytics:", user?._id);
  console.log("Analytics in Home:", analytics);

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

  useEffect(() => {
    const fetchDataMindType = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/employees/get-data-mind-type`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data && response.data.employeeDatamind) {
          const dataMindType = response.data.employeeDatamind.datamind_id.data_mind_type;
          setUser((prevUser) => ({
            ...prevUser,
            data_mind_type: dataMindType,
          }));
        } else {
          console.warn("Data mind type not found for the employee.");
        }
      } catch (error) {
        console.error("Error fetching data mind type:", error);
      }
    };

    // Only fetch data mind type if user is already loaded
    if (user && user._id && !user.data_mind_type) {
      fetchDataMindType();
    }
  }, [user]);


  // Fetch posts from the backend
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/posts/get`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setPosts(response.data.posts);
        setFilteredPosts(response.data.posts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchPosts();
  }, []);
  

  // Filter posts based on search term and date range
  useEffect(() => {
    let filtered = posts;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((post) =>
        post.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by date range
    if (startDate) {
      filtered = filtered.filter((post) => new Date(post.timestamp) >= new Date(startDate));
    }
    if (endDate) {
      filtered = filtered.filter((post) => new Date(post.timestamp) <= new Date(endDate));
    }

    setFilteredPosts(filtered);
  }, [searchTerm, startDate, endDate, posts]);


  // Pagination logic
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

  const nextPage = () => {
    if (currentPage < Math.ceil(posts.length / postsPerPage)) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  if (loading) {
    return <div>Loading posts...</div>;
  }

  if (!posts.length) {
    return <div>No posts to display</div>;
  }


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
            <img src={user.img_link || "/placeholder.png"} alt="User Avatar" className="avatar" />
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
              <p className="message">I am #{user.data_mind_type}Datamind</p>
            </div>
            <div className="stats">
              <div className="stat">
                {analytics.analytics.achievementsCount}{" "}
                <span className="stat-description">Achievements</span>
              </div>
              <div className="stat">
                {analytics.analytics.postsCount}{" "}
                <span className="stat-description">Posts</span>
              </div>
              <div className="stat">
                {analytics.analytics.milestonesCount}{" "}
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
          </div>

        </div>

        {/* Posts */}
        <div className="post-column">

          {/* Post creation*/}
          <div className="post-creation-gray-box">
            <PostCreation
              user={{
                name: `${user.f_name || "User"} ${user.l_name || ""}`,
                img_link: user.img_link || "/placeholder.png",
              }}
            />
          </div>

          {/* Search and Date Filter */}
          <div className="filter-controls">
            <div className="post-search-wrapper">
              <img
                src="/magnifying-glass 1.png"
                alt="Search Icon"
                className="search-icon"
              />
              <input
                type="text"
                className="post-search"
                placeholder="Search for a post..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="date-filter-controls">
              <p>From: </p>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="date-filter"
              />
              <p>To: </p>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="date-filter"
              />
            </div>
          </div>

          {/* Filtered Posts */}
          <div className="post-feed-gray-box">
            {currentPosts.length > 0 ? (
              currentPosts.map((post) => <PostComponent key={post._id} post={post} user={user} />)
            ) : (
              <div>No posts match the filters.</div>
            )}
          </div>

          {/* Pagination Controls */}
          <div className="pagination-controls">
            <button onClick={prevPage} disabled={currentPage === 1}>
              Previous
            </button>
            <span>
              Page {currentPage} of {Math.ceil(filteredPosts.length / postsPerPage)}
            </span>
            <button
              onClick={nextPage}
              disabled={currentPage === Math.ceil(filteredPosts.length / postsPerPage)}
            >
              Next
            </button>
          </div>
        </div>

        <div className="tasks-column">
          {/* Tasks and Events boxes */}
          <div className="tasks-gray-box">
            {/* Tasks */}
            <div className="tasks-box">
              <TaskCard />
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
