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
                <img src={user.img_link} alt="User Avatar" className="post-avatar" />
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
    const [audience, setAudience] = useState('all');  // For "Post to..." dropdown
    const [mediaType, setMediaType] = useState('');  // For "Attach Media" dropdown
    const [showAudienceDropdown, setShowAudienceDropdown] = useState(false);
    const [showMediaDropdown, setShowMediaDropdown] = useState(false);
    const [availableOptions, setAvailableOptions] = useState([]);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const token = localStorage.getItem('token');

    const handleChange = (e) => {
        setPostText(e.target.value);
        setIsActive(e.target.value.trim() !== '');
    };

    // Fetch options dynamically based on audience selection
    const fetchOptions = async (audienceType) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/posts/resources`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();

            console.log('Fetched Resources:', data); // Log backend response

            if (audienceType === 'location') {
                setAvailableOptions(data.locations || []);
            } else if (audienceType === 'department') {
                setAvailableOptions(data.departments || []);
            } else if (audienceType === 'team') {
                setAvailableOptions(data.teams || []);
            }
        } catch (error) {
            console.error('Error fetching options:', error);
        }
    };

    const handleAudienceChange = (e) => {
        const selectedAudience = e.target.value;
        setAudience(selectedAudience);

        if (selectedAudience !== 'all') {
            fetchOptions(selectedAudience);
        } else {
            setAvailableOptions([]);
            setSelectedOptions([]);
        }
    };

    const handleCheckboxToggle = (id) => {
        if (selectedOptions.includes(id)) {
            setSelectedOptions(selectedOptions.filter((item) => item !== id));
        } else {
            setSelectedOptions([...selectedOptions, id]);
        }
    };

    const handlePost = async () => {
        if (!postText.trim()) return;

        try {
            setIsLoading(true);
            // Prepare the payload
            const payload = { content: postText };
            if (audience === 'all') {
                payload.global = true; // Global visibility
            } else {
                payload[`target_${audience}s`] = selectedOptions; // Add selected options
            }

            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/posts/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
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
                    <img src={user.img_link || "/placeholder.png"} alt="User Avatar" className="post-avatar" />
                    <div className="user-info">
                        <h2>{user.name}</h2>
                        <p>Post to
                            <button
                                className="audience-dropdown-btn"
                                onClick={() => setShowAudienceDropdown(!showAudienceDropdown)}
                            >
                                {audience.charAt(0).toUpperCase() + audience.slice(1)}
                            </button></p>
                        {showAudienceDropdown && (
                            <div className="audience-dropdown">
                                <select value={audience} onChange={handleAudienceChange}>
                                    <option value="all">All</option>
                                    <option value="location">Location</option>
                                    <option value="department">Department</option>
                                    <option value="team">Team</option>
                                </select>
                            </div>
                        )}
                    </div>
                    {availableOptions.length > 0 && (
                        <div className="audience-options">
                            <p>Select {audience}(s):</p>
                            {availableOptions.map((option, index) => (
                                <label key={index} style={{ display: 'block' }}>
                                    <input
                                        type="checkbox"
                                        value={option._id} // Use the unique identifier (e.g., _id)
                                        checked={selectedOptions.includes(option._id)}
                                        onChange={() => handleCheckboxToggle(option._id)}
                                    />
                                    {audience === 'location'
                                        ? `${option.city}, ${option.country}` // Render city and country
                                        : option.name || option.number || 'Unnamed Option'} {/* Render name or fallback for other options */}
                                </label>
                            ))}
                        </div>
                    )}
                    <button className="close-btn" onClick={closeDialog}>
                        <img src="/close.png" alt="Close button" className="post-dialogue-close-bttn" />
                    </button>
                </div>

                <div className="post-textarea-contents">
                    <textarea
                        className="post-textarea"
                        placeholder={`What's on your mind, ${user.name}?`}
                        value={postText}
                        onChange={handleChange}
                        disabled={isLoading} // Disable input while posting
                    />
                    <button
                        className={`attachment-btn ${isActive ? 'active' : ''}`}
                        disabled={isLoading}
                        onClick={() => setShowMediaDropdown(!showMediaDropdown)}
                    >
                        <img src="/attach.png" alt="Attachment button" />
                    </button>

                    {showMediaDropdown && (
                        <div className="media-dropdown">
                            <select
                                value={mediaType}
                                onChange={(e) => setMediaType(e.target.value)}
                            >
                                <option value="">Attach Media</option>
                                <option value="image">Image</option>
                                <option value="video">Video</option>
                                <option value="link">Link</option>
                                <option value="podcast">Podcast</option>
                            </select>
                        </div>
                    )}
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
