import axios from "axios";

/**
 * Fetch all posts.
 * @param {string} token - Authentication token.
 * @returns {Promise<Array>} - List of posts.
 */
export const fetchPosts = async (token) => {
    const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/posts/get`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.posts;
};

/**
 * Fetch comments for a specific post.
 * @param {string} token - Authentication token.
 * @param {string} postId - ID of the post.
 * @returns {Promise<Array>} - List of comments.
 */
export const fetchPostComments = async (token, postId) => {
    const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/posts/${postId}/comments`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.comments || [];
};

/**
 * Like a post.
 * @param {string} token - Authentication token.
 * @param {string} postId - ID of the post.
 */
export const likePost = async (token, postId) => {
    await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/posts/like`,
        { post_id: postId },
        { headers: { Authorization: `Bearer ${token}` } }
    );
};

/**
 * Unlike a post.
 * @param {string} token - Authentication token.
 * @param {string} postId - ID of the post.
 */
export const unlikePost = async (token, postId) => {
    await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/posts/unlike`,
        { post_id: postId },
        { headers: { Authorization: `Bearer ${token}` } }
    );
};

/**
 * Post a comment on a post.
 * @param {string} token - Authentication token.
 * @param {string} postId - ID of the post.
 * @param {string} content - Comment content.
 * @returns {Promise<Object>} - Posted comment.
 */
export const postComment = async (token, postId, content) => {
    const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/posts/comments`,
        { post_id: postId, content },
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data.comment;
};

/**
 * Fetch resources for post targeting (locations, departments, teams).
 * @param {string} token - Authentication token.
 * @returns {Promise<Object>} - Resources object.
 */
export const fetchPostResources = async (token) => {
    const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/posts/resources`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
};

/**
 * Create a new post.
 * @param {string} token - Authentication token.
 * @param {Object} postPayload - Post data { content, mediaLinks, target_audiences }.
 */
export const createPost = async (token, postPayload) => {
    const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/posts/create`,
        postPayload,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
};

/**
 * Fetch posts for a specific user.
 * @param {string} token - Authentication token.
 * @param {Object} loggedInUser - User object { f_name, l_name }.
 * @returns {Promise<Array>} - Filtered posts for the user.
 */
export const fetchUserPosts = async (token, loggedInUser) => {
    const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/posts/get`,
        { headers: { Authorization: `Bearer ${token}` } }
    );

    return response.data.posts.filter(
        (post) => post.author?.f_name === loggedInUser.f_name && post.author?.l_name === loggedInUser.l_name
    );
};

/**
 * Delete a specific post.
 * @param {string} token - Authentication token.
 * @param {string} postId - ID of the post to delete.
 */
export const deletePost = async (token, postId) => {
    await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/posts/delete`, {
        data: { post_id: postId },
        headers: { Authorization: `Bearer ${token}` },
    });
};