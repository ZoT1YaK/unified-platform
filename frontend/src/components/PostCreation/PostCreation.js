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

    const handleChange = (e) => {
        setPostText(e.target.value);
        setIsActive(e.target.value.trim() !== '');
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
                    />
                    <button className={`attachment-btn ${isActive ? 'active' : ''}`}>
                        <img src='/attach.png' alt="Attachment button" />
                    </button>


                    {/* Attachment options that appear when hovering over the button */}
                    {/* <div className="attachment-options">
                        <div className="attachment-option">
                            <img src="/external-link.png" alt="att-Link" />
                        </div>
                        <div className="attachment-option">
                            <img src="/image-.png" alt="att-Image" />
                        </div>
                        <div className="attachment-option">
                            <img src="/microphone.png" alt="att-Microphone" />
                        </div>
                        <div className="attachment-option">
                            <img src="/video.png" alt="att-Video" />
                        </div>
                    </div> */}
                </div>

                <div className="post-dialogue-footer">
                    <hr />
                    <button className={`post-btn ${isActive ? 'active' : 'inactive'}`} disabled={!isActive}>Post</button>
                </div>
            </div>
        </div >
    );
};

export default PostCreation;
