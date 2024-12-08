import React, { useState } from 'react';
import './PostCreation.css';

const PostCreation = ({ user }) => {
    const [isOpen, setIsOpen] = useState(false);

    const openDialog = () => {
        setIsOpen(true);
    };

    const closeDialog = () => {
        setIsOpen(false);
    };

    return (
        <div className="post-creation-component">
            <div className="post-creation-box" onClick={openDialog}>
                <img src={user.avatar} alt="User Avatar" className="post-avatar" />
                <p className="post-prompt">What's on your mind, {user.name}?</p>
            </div>

            {isOpen && <PostDialog user={user} closeDialog={closeDialog} />}
        </div>
    );
};

const PostDialog = ({ user, closeDialog }) => {
    const [postText, setPostText] = useState('');
    const [isActive, setIsActive] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setPostText(e.target.value);
        setIsActive(e.target.value.trim() !== '');
    };

    const handlePost = async () => {
        if (!postText.trim()) return;

        try {
            setIsLoading(true);
            const token = localStorage.getItem("token");

            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/posts/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ content: postText }),
            });

            if (!response.ok) {
                throw new Error("Failed to create post");
            }

            const data = await response.json();
            console.log("Post created:", data);
            closeDialog(); // Close the dialog after posting
        } catch (error) {
            console.error("Error creating post:", error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="post-dialog-overlay" onClick={closeDialog}>
            <div className="post-dialog" onClick={(e) => e.stopPropagation()}>
                <div className="post-dialogue-header">
                    <img src={user.avatar} alt="User Avatar" className="post-avatar" />
                    <div className="user-info">
                        <h2>{user.name}</h2>
                        <p>Post to Feed</p>
                    </div>
                    <button className="close-btn" onClick={closeDialog}>
                        <img src="/close.png" alt="Close button" className='post-dialogue-close-bttn' />
                    </button>
                </div>

                <div className='post-textarea-contents'>
                    <textarea
                        className="post-textarea"
                        placeholder={`What's on your mind, ${user.name}?`}
                        value={postText}
                        onChange={handleChange}
                        disabled={isLoading} // Disable input while posting
                    />
                    <button className={`attachment-btn ${isActive ? 'active' : ''}`} disabled={isLoading}>
                        <img src='/attach.png' alt="Attachment button" />
                    </button>
                </div>

                <div className="post-dialogue-footer">
                    <hr />
                    <button
                        className={`post-btn ${isActive ? 'active' : 'inactive'}`}
                        onClick={handlePost}
                        disabled={!isActive || isLoading} // Disable button while loading
                    >
                        {isLoading ? "Posting..." : "Post"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PostCreation;
