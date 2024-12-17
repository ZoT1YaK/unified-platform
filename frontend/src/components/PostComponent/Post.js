import React, { useState, useEffect } from "react";
import { fetchPostComments, likePost, unlikePost, postComment } from "../../services/postService";
import "./Post.css";

const PostComponent = ({ post, mode = "default" }) => {
    const [likes, setLikes] = useState(post.likes || 0);
    const [newComment, setNewComment] = useState("");
    const [comments, setComments] = useState([]);

    const token = localStorage.getItem("token");

    useEffect(() => {
        const loadComments = async () => {
            try {
                const fetchedComments = await fetchPostComments(token, post._id);
                setComments(fetchedComments);
            } catch (error) {
                console.error("Error fetching comments:", error);
                setComments([]);
            }
        };

        loadComments();
    }, [post._id, token]);

    const handleLikeClick = async () => {
        if (mode === "visited") return;

        try {
            if (likes === post.likes) {
                await likePost(token, post._id);
                setLikes((prevLikes) => prevLikes + 1);
            } else {
                await unlikePost(token, post._id);
                setLikes((prevLikes) => prevLikes - 1);
            }
        } catch (error) {
            console.error("Error updating likes:", error);
        }
    };

    const handleCommentChange = (e) => {
        setNewComment(e.target.value);
    };

    const handlePostComment = async () => {
        if (mode === "visited" || !newComment.trim()) return;

        try {
            const comment = await postComment(token, post._id, newComment);
            setComments((prevComments) => [...prevComments, comment]);
            setNewComment("");
        } catch (error) {
            console.error("Error posting comment:", error);
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
                {/* Render Media Links */}
                {post.mediaLinks && post.mediaLinks.length > 0 && (
                    <div className="post-media">
                        <div className="media-grid">
                            {post.mediaLinks.slice(0, 5).map((link, index) => (
                                <div key={index} className="media-item">
                                    {link.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                                        <img src={link} alt={`Media ${index}`} className="media-image" />
                                    ) : link.match(/youtu\.be|youtube\.com/i) ? (
                                        <iframe
                                            src={link
                                                .replace("watch?v=", "embed/")
                                                .replace("youtu.be/", "www.youtube.com/embed/")}
                                            title={`Video ${index}`}
                                            allowFullScreen
                                            className="media-video"
                                        ></iframe>
                                    ) : link.match(/vimeo\.com/i) ? (
                                        <iframe
                                            src={link.replace("vimeo.com/", "player.vimeo.com/video/")}
                                            title={`Video ${index}`}
                                            allowFullScreen
                                            className="media-video"
                                        ></iframe>
                                    ) : (
                                        <a href={link} target="_blank" rel="noopener noreferrer" className="media-link">
                                            {link}
                                        </a>
                                    )}
                                </div>
                            ))}
                            {post.mediaLinks.length > 5 && (
                                <div className="media-item more-overlay">
                                    +{post.mediaLinks.length - 5}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Existing Attachments */}
                {post.attachments && (
                    <div className="post-attachments">
                        {post.attachments.map((attachment, index) => (
                            <img key={index} src={attachment} alt={`Attachment ${index}`} className="post-attachment" />
                        ))}
                    </div>
                )}
            </div>
            {mode !== "visited" && (
                <div className="post-footer">
                    <div className="likes-section">
                        <button onClick={handleLikeClick} className="like-button">
                            <img src="/like.png" alt="Like icon" className="like-icon" />
                        </button>
                        <span>{likes} Likes</span>
                    </div>
                    <div className="comments-section">
                        <span>{comments.length} Comments</span>
                    </div>
                </div>
            )}
            {mode !== "visited" && (
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
            )}
            <div className="comments-list">
                <h4>Comments</h4>
                {comments.length === 0 ? (
                    <p>No comments yet.</p>
                ) : (
                    comments.map((comment, index) => (
                        <div key={index} className="comment">
                            <strong>
                                {comment.employee?.f_name || "Unknown"} {comment.employee?.l_name || "Employee"}:
                            </strong>{" "}
                            {comment.content}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default PostComponent;
