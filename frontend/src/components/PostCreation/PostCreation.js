import React, { useState } from 'react';
import { fetchPostResources, createPost } from "../../services/postService";
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
    const [mediaLinks, setMediaLinks] = useState([]);
    const [currentMediaLink, setCurrentMediaLink] = useState("");
    const [audience, setAudience] = useState('all');  // For "Post to..." dropdown
    const [showAudienceDropdown, setShowAudienceDropdown] = useState(false);
    const [availableOptions, setAvailableOptions] = useState([]);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const token = localStorage.getItem('token');

    const handleChange = (e) => {
        setPostText(e.target.value);
        setIsActive(e.target.value.trim() !== '' || mediaLinks.length > 0);
    };

    const handleAddMediaLink = () => {
        if (currentMediaLink.trim()) {
            setMediaLinks([...mediaLinks, currentMediaLink.trim()]);
            setCurrentMediaLink("");
            setIsActive(true);
        }
    };

    const handleRemoveMediaLink = (index) => {
        setMediaLinks(mediaLinks.filter((_, i) => i !== index));
        setIsActive(postText.trim() !== '' || mediaLinks.length > 1); // Recalculate button state
    };

    // Fetch options dynamically based on audience selection
    const fetchOptions = async (audienceType) => {
        try {
            const resources = await fetchPostResources(token);

            if (audienceType === "location") {
                setAvailableOptions(resources.locations || []);
            } else if (audienceType === "department") {
                setAvailableOptions(resources.departments || []);
            } else if (audienceType === "team") {
                setAvailableOptions(resources.teams || []);
            }
        } catch (error) {
            console.error("Error fetching options:", error.message);
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
        if (!postText.trim() && mediaLinks.length === 0) return;

        const payload = { content: postText, mediaLinks };
        if (audience === "all") {
            payload.global = true;
        } else {
            payload[`target_${audience}s`] = selectedOptions;
        }

        try {
            setIsLoading(true);
            await createPost(token, payload);
            console.log("Post created successfully");
            closeDialog();
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
                                        ? `${option}` // Render country
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
                    <div className="media-attachment">
                        <input
                            type="text"
                            placeholder="Paste image or video link here..."
                            value={currentMediaLink}
                            onChange={(e) => setCurrentMediaLink(e.target.value)}
                        />
                        <button onClick={handleAddMediaLink} disabled={!currentMediaLink.trim()}>
                            Add Link
                        </button>
                    </div>
                    {mediaLinks.length > 0 && (
                        <div className="media-preview-container">
                            <h4>Attached Media:</h4>
                            <div className="media-preview">
                                {mediaLinks.map((link, index) => (
                                    <div key={index} className="preview-media-item">
                                        {link.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                                            <img src={link} alt={`Media ${index}`} className="media-preview-image" />
                                        ) : link.match(/(youtube\.com|vimeo\.com)/i) ? (
                                            <iframe
                                                src={link}
                                                title={`Video ${index}`}
                                                allowFullScreen
                                                className="media-preview-video"
                                            ></iframe>
                                        ) : (
                                            <a href={link} target="_blank" rel="noopener noreferrer" className="media-preview-link">
                                                {link}
                                            </a>
                                        )}
                                        <button onClick={() => handleRemoveMediaLink(index)} className="remove-media-btn">
                                            <img src="/close.png" alt="Close button" className="media-attach-close-bttn" />
                                        </button>
                                    </div>
                                ))}
                            </div>
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
