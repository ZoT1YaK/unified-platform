import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserPostTracker.css';

const UserPostTracker = () => {
    const [posts, setPosts] = useState([]);
    const [selectedPost, setSelectedPost] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const postsPerPage = 5;

    const fetchUserPosts = async () => {
        try {
            const storedEmployee = localStorage.getItem("employee");
            const loggedInUser = storedEmployee ? JSON.parse(storedEmployee) : null;

            if (!loggedInUser) {
                console.error("No logged-in user found.");
                return;
            }

            const response = await axios.get(
                `${process.env.REACT_APP_BACKEND_URL}/api/posts/get`,
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );

            const userPosts = response.data.posts.filter(
                (post) => post.author?.f_name === loggedInUser.f_name && post.author?.l_name === loggedInUser.l_name
            );

            setPosts(userPosts);
            setFilteredPosts(userPosts);
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    };

    const handleDeletePost = async (postId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this post?");
        if (!confirmDelete) return;

        try {
            await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/posts/delete`, {
                data: { post_id: postId },
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });

            setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
            setFilteredPosts((prevFiltered) => prevFiltered.filter((post) => post._id !== postId));
            alert("Post deleted successfully!");
        } catch (error) {
            console.error("Error deleting post:", error);
            alert("Failed to delete post. Please try again.");
        }
    };


    useEffect(() => {
        fetchUserPosts();
    }, []);

    const handleSearchChange = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);

        const filtered = posts.filter((post) =>
            post.content.toLowerCase().includes(query)
        );
        setFilteredPosts(filtered);
        setCurrentPage(1);
    };

    const openModal = (post) => {
        setSelectedPost(post);
        setShowModal(true);
    };

    const closeModal = () => {
        setSelectedPost(null);
        setShowModal(false);
    };

    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

    /*const nextPage = () => {
        if (currentPage < Math.ceil(filteredPosts.length / postsPerPage)) {
            setCurrentPage((prev) => prev + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage((prev) => prev - 1);
        }
    };*/

    return (
        <div className="user-post-tracker">
            <h2>Posts</h2>
            <div className="empl-post-search-wrapper">
                <img
                    src="/magnifying-glass 1.png"
                    alt="Search Icon"
                    className="search-icon"
                />
                <input
                    type="text"
                    className="post-search"
                    placeholder="Search for a post..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                />
            </div>
            <div className="post-list">
                {currentPosts.length > 0 ? (
                    currentPosts.map((post) => (
                        <div key={post._id} className="post-summary" onClick={() => openModal(post)}>
                            <p className="post-date">{new Date(post.timestamp).toLocaleDateString()}</p>
                            <p className="post-snippet">{post.content.slice(0, 150)}...</p>
                            {post.mediaLinks && post.mediaLinks.length > 0 && (
                                <div className="post-media-preview">
                                    {post.mediaLinks.slice(0, 3).map((url, index) => (
                                        <div key={index} className="media-preview-item">
                                            {url.match(/\.(jpeg|jpg|gif|png)$/) ? (
                                                <img src={url} alt={`Media ${index}`} className="media-thumbnail" />
                                            ) : (
                                                <span className="media-placeholder">[Video/Link]</span>
                                            )}
                                        </div>
                                    ))}
                                    {post.mediaLinks.length > 3 && (
                                        <div className="media-preview-more">
                                            +{post.mediaLinks.length - 3}
                                        </div>
                                    )}
                                </div>
                            )}
                            <div className="post-stats">
                                <span>{post.likes} Likes</span>
                                <span>{post.comments} Comments</span>
                            </div>
                            <button
                                className="delete-post-btn"
                                onClick={() => handleDeletePost(post._id)}
                            >
                                <img
                                    src="/trash1.png"
                                    alt="Trash Icon"
                                    className="trash-icon"
                                />
                            </button>
                        </div>
                    ))
                ) : (
                    <p>No posts available.</p>
                )}
            </div>
            {/* Pagination Controls */}
            <div className="pagination">
                {Array.from({ length: Math.ceil(filteredPosts.length / postsPerPage) }, (_, index) => (
                    <button
                        key={index + 1}
                        className={`pagination-button ${currentPage === index + 1 ? "active" : ""}`}
                        onClick={() => setCurrentPage(index + 1)}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>

            {showModal && selectedPost && (
                <PostModal post={selectedPost} closeModal={closeModal} />
            )}
        </div>
    );
};

const PostModal = ({ post, closeModal }) => {
    const [comments, setComments] = useState([]);

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_BACKEND_URL}/api/posts/${post._id}/comments`,
                    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                );
                setComments(response.data.comments || []);
            } catch (error) {
                console.error("Error fetching comments:", error);
            }
        };

        fetchComments();
    }, [post._id]);



    return (
        <div className="user-post-modal-overlay" onClick={closeModal}>
            <div className="user-post-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={closeModal}>✖</button>
                <div className="post-full-content">
                    <h3>
                        {post.author?.f_name} {post.author?.l_name}
                    </h3>
                    <p>{new Date(post.timestamp).toLocaleString()}</p>
                    <p>{post.content}</p>
                    {post.mediaLinks && post.mediaLinks.length > 0 && (
                        <div className="post-modal-media-grid">
                            {post.mediaLinks.map((url, index) =>
                                url.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                                    <img key={index} src={url} alt={`Media ${index}`} className="post-modal-thumbnail" />
                                ) : (
                                    <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="post-modal-link">
                                        Open Media
                                    </a>
                                )
                            )}
                        </div>
                    )}

                    <div className="user-post-stats">
                        <span>{post.likes} Likes</span>
                        <span>{comments.length} Comments</span>
                    </div>
                </div>
                <div className="user-post-comments-section">
                    <h4>Comments</h4>
                    {comments.length === 0 ? (
                        <p>No comments yet. Be the first to comment!</p>
                    ) : (
                        comments.map((comment, index) => (
                            <div key={index} className="user-post-comment">
                                <p>
                                    <strong>
                                        {comment.employee?.f_name || 'Unknown'} {comment.employee?.l_name || ''}
                                    </strong>
                                </p>
                                <div className="user-post-comment-content">
                                    <p>{comment.content}</p>
                                </div>
                                <p>{new Date(comment.timestamp).toLocaleString()}</p>
                            </div>
                        ))
                    )}
                </div>

            </div>
        </div>
    );
};

export default UserPostTracker;
