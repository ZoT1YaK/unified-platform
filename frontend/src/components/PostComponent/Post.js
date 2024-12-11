import React, { useState } from 'react';
import './Post.css';

const PostComponent = ({ user, post }) => {
    const [likes, setLikes] = useState(post.likes);  // Manage likes state
    const [newComment, setNewComment] = useState('');

    // Ensure comments is always an array, even if it's initially a number
    const [comments, setComments] = useState(Array.isArray(post.comments) ? post.comments : []);

    const [isCommentButtonVisible, setIsCommentButtonVisible] = useState(false); // Show/Hide button

    // Toggle like functionality
    const handleLikeClick = () => {
        setLikes(likes === post.likes ? likes + 1 : likes - 1); // Toggle likes
    };

    // Handle comment change and show/hide the post button
    const handleCommentChange = (e) => {
        setNewComment(e.target.value);
        setIsCommentButtonVisible(e.target.value.trim() !== ''); // Button visibility
    };

    // Handle adding a comment
    const handlePostComment = () => {
        if (newComment.trim()) {
            setComments([...comments, { user: 'Bob Bobrovich', text: newComment }]);
            setNewComment(''); // Clear the comment input
            setIsCommentButtonVisible(false); // Hide button after posting
        }
    };

    return (
        <div className="post-component">
        <div className="post-header">
            <img src={user.avatar} alt="User Avatar" className="post-avatar" />
            <div className="post-user-info">
                <h2>{post.author?.f_name} {post.author?.l_name || 'Unknown'}</h2> {/* Display author's name */}
                <p>{post.author?.position || 'Unknown Position'}</p> {/* Display author's position */}
                <p>{post.author?.department || 'Unknown Department'}</p> {/* Display author's department */}
                <p>{post.timeAgo}</p> {/* Display time ago */}
            </div>
        </div>

            <div className="post-description">
                <p>{post.description}</p>
                <div className="post-attachments">
                    {post.attachments && post.attachments.map((attachment, index) => (
                        <img key={index} src={attachment} alt={`Attachment ${index}`} className="post-attachment" />
                    ))}
                </div>
            </div>

            <div className="post-footer">
                <div className="likes-section">
                    <button onClick={handleLikeClick} className="like-button">
                        <img src="/like.png" alt="Like icon" className="like-icon" />
                    </button>
                    <span>{likes}</span>
                </div>
                <div className="comments-section">
                    <img src="/comment.png" alt="Comment icon" className="comment-icon" />
                    <span>{comments.length}</span>
                </div>
            </div>

            <hr />

            <div className="comment-area">
                <input
                    type="text"
                    placeholder={`Write a comment on ${user.name}'s post...`}
                    value={newComment}
                    onChange={handleCommentChange}
                />
                {isCommentButtonVisible && (
                    <button className="post-comment-btn" onClick={handlePostComment}>
                        <img src='/send-message.png' alt='Post comment bttn' className='post-comment-to-feed-bttn'/>
                    </button>
                )}
            </div>

            <div className="comments-list">
                {comments && comments.map((comment, index) => (
                    <div key={index} className="comment">
                        <strong>{comment.user}:</strong> {comment.text}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PostComponent;
