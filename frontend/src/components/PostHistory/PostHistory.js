import React, { useState, useEffect } from "react";
import PostComponent from "../PostComponent/Post";
import "./PostHistory.css";

const PostHistory = ({ empId }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                // Fetch all posts
                const postsResponse = await fetch(
                    `${process.env.REACT_APP_BACKEND_URL}/api/posts/get`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );

                if (!postsResponse.ok) {
                    throw new Error("Failed to fetch posts");
                }

                const postsData = await postsResponse.json();
                console.log("API Response Posts:", postsData.posts);

                // Fetch visited user's data
                const visitedUserResponse = await fetch(
                    `${process.env.REACT_APP_BACKEND_URL}/api/employees/profile/${empId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );

                if (!visitedUserResponse.ok) {
                    console.warn("No matching user found for the visited empId.");
                    setPosts([]); // Set posts to an empty array
                    return;
                }

                const visitedUserData = await visitedUserResponse.json();
                const visitedUser = visitedUserData.profile;
                console.log("Visited User Data:", visitedUser);

                const { f_name, l_name } = visitedUser;

                // Filter posts by visited user's name
                const filteredPosts = postsData.posts.filter(
                    (post) =>
                        post.author &&
                        post.author.f_name === f_name &&
                        post.author.l_name === l_name
                );

                console.log("Filtered Posts for Visited User:", filteredPosts);

                setPosts(filteredPosts); // Update the state with filtered posts
            } catch (error) {
                console.error("Error fetching posts or visited user data:", error);
                setError("Failed to fetch posts or user data.");
            } finally {
                setLoading(false); // Set loading to false after fetching data
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
