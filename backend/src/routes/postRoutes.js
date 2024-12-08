const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const { verifyToken } = require("../middleware/authMiddleware");

// Create a post
router.post("/create", verifyToken, postController.createPost);

// Create a congratulatory post
router.post("/congratulatory", verifyToken, postController.createCongratulatoryPost);

// Update visibility of a congratulatory post
router.patch("/visibility", verifyToken, postController.updatePostVisibility);

// Get targeted posts
router.get("/get", verifyToken, postController.getTargetedPosts);

// Create a comment
router.post("/comments", verifyToken, postController.createComment);

// Get comments for a post
router.get("/:post_id/comments", verifyToken, postController.getCommentsByPost);

// Like a post
router.post("/like", verifyToken, postController.likePost);

// Unlike a post
router.post("/unlike", verifyToken, postController.unlikePost);

// Get all resources for post creation
router.get("/resources", verifyToken, postController.getPostResources);

module.exports = router;
