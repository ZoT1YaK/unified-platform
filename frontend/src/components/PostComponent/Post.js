import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Post.css';

const PostComponent = ({ post }) => {
    const [likes, setLikes] = useState(post.likes || 0);
    const [newComment, setNewComment] = useState('');
    const [comments, setComments] = useState([]);

    // Fetch comments on component mount
    useEffect(() => {
        const fetchComments = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:5000/api/posts/${post._id}/comments`,
                    { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
                );
                setComments(response.data.comments || []);
            } catch (error) {
                if (error.response && error.response.status === 404) {
                    console.warn(`No comments found for post ID: ${post._id}`);
                    setComments([]); // Treat 404 as no comments
                } else {
                    console.error("Error fetching comments:", error);
                }
            }
        };

        fetchComments();
    }, [post._id]);

    // Toggle like functionality
    const handleLikeClick = async () => {
        try {
            if (likes === post.likes) {
                await axios.post(
                    `http://localhost:5000/api/posts/like`,
                    { post_id: post._id },
                    { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
                );
                setLikes((prevLikes) => prevLikes + 1);
            } else {
                await axios.post(
                    `http://localhost:5000/api/posts/unlike`,
                    { post_id: post._id },
                    { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
                );
                setLikes((prevLikes) => prevLikes - 1);
            }
        } catch (error) {
            console.error("Error updating likes:", error);
        }
    };

    // Handle comment input change
    const handleCommentChange = (e) => {
        setNewComment(e.target.value);
    };

    const handlePostComment = async () => {
        if (!newComment.trim()) return; // Don't allow empty comments
        try {
            const response = await axios.post(
                `http://localhost:5000/api/posts/comments`,
                {
                    post_id: post._id,
                    content: newComment,
                },
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                }
            );
            setComments([...comments, response.data.comment]);
            setNewComment('');
        } catch (error) {
            console.error('Error posting comment:', error);
        }
    };


    return (
        <div className="post-component">
            <div className="post-header">
                <div className="post-avatar">
                    <img
                           src={post.author.img_link || "/placeholder.png"} 
                           alt={`${post.author.f_name} ${post.author.l_name}'s Avatar`}
                           className="post-avatar"
                    />
                </div>
                <div className="post-user-info">
                    <h2>
                        {post.author?.f_name} {post.author?.l_name || "Unknown"}
                    </h2>
                    <p>
                        {post.author?.position || "Unknown Position"} - {post.author?.department || "Unknown Department"}
                    </p>
                </div>
            </div>
            <div className="post-description">
                <p>{post.content || "No content available"}</p>
                {post.attachments && (
                    <div className="post-attachments">
                        {post.attachments.map((attachment, index) => (
                            <img key={index} src={attachment} alt={`Attachment ${index}`} className="post-attachment" />
                        ))}
                    </div>
                )}
            </div>
            <div className="post-footer">
                <div className="likes-section">
                    <button onClick={handleLikeClick} className="like-button">
                        <img src="/like.png" alt="Like icon" className="like-icon" />
                    </button>
                    <span>{likes} Likes</span> {/* Display like count */}
                </div>
                <div className="comments-section">
                    <span>{comments.length} Comments</span>
                </div>
            </div>
            {/* Comment Input */}
            <div className="comment-area">
                <input
                    type="text"
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={handleCommentChange}
                />
                <button className="post-comment-btn" onClick={handlePostComment} disabled={!newComment.trim()}>
                    Post
                </button>
            </div>
            {/* Comments List */}
            <div className="comments-list">
                {comments.length === 0 ? (
                    <p>No comments yet. Be the first to comment!</p>
                ) : (
                    comments.map((comment, index) => (
                        <div key={index} className="comment">
                            <strong>
                                {comment.employee?.f_name || 'Unknown'} {comment.employee?.l_name || 'Employee'}:
                            </strong>{' '}
                            {comment.content}
                        </div>
                    ))
                )}
            </div>




        </div>
    );
};

export default PostComponent;
