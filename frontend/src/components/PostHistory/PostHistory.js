import React, { useState, useEffect } from "react";
import axios from "axios";
import PostComponent from "../PostComponent/Post";
import "./PostHistory.css";

const PostHistory = ({ empId }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const token = localStorage.getItem("token");

                // Fetch all posts
                const postsResponse = await axios.get(
                    `${process.env.REACT_APP_BACKEND_URL}/api/posts/get`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                console.log("API Response Posts:", postsResponse.data.posts);

                // Fetch visited user's data
                const visitedUserResponse = await axios.get(
                    `${process.env.REACT_APP_BACKEND_URL}/api/employees/profile/${empId}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                console.log("Visited User Data:", visitedUserResponse.data);

                const visitedUser = visitedUserResponse.data.profile;
                const { f_name, l_name } = visitedUser;

                // Filter posts by visited user's name
                const filteredPosts = postsResponse.data.posts.filter(
                    (post) =>
                        post.author &&
                        post.author.f_name === f_name &&
                        post.author.l_name === l_name
                );

                console.log("Filtered Posts for Visited User:", filteredPosts);

                setPosts(filteredPosts); // Update the state with filtered posts
            } catch (error) {
                console.error("Error fetching posts or visited user data:", error.response?.data?.message || error.message);
                setError("Failed to fetch posts or user data.");
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [empId]);


    if (loading) return <p>Loading posts...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="post-history">
            <h3>Post History</h3>
            {posts.length > 0 ? (
                posts.map((post) => <PostComponent key={post._id} post={post} mode="visited" />)
            ) : (
                <p>No posts available for this user.</p>
            )}
        </div>
    );
};

export default PostHistory;
