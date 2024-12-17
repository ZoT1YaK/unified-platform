import React, { useState, useEffect } from "react";
import { fetchPosts } from "../../services/postService";
import { fetchEmployeeProfile } from "../../services/employeeService";
import PostComponent from "../PostComponent/Post";
import "./PostHistory.css";

const PostHistory = ({ empId }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserPosts = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) throw new Error("No token found. Please log in.");

                // Fetch all posts and visited user's profile
                const [allPosts, visitedUserProfile] = await Promise.all([
                    fetchPosts(token),
                    fetchEmployeeProfile(token, empId, "visited"),
                ]);

                const { f_name, l_name } = visitedUserProfile;

                // Filter posts authored by the visited user
                const userPosts = allPosts.filter(
                    (post) =>
                        post.author &&
                        post.author.f_name === f_name &&
                        post.author.l_name === l_name
                );

                setPosts(userPosts);
            } catch (err) {
                console.error("Error fetching posts or user profile:", err);
                setError("Failed to fetch posts or user profile.");
            } finally {
                setLoading(false);
            }
        };

        fetchUserPosts();
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
