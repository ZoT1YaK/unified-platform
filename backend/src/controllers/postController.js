const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Employee = require("../models/Employee");
const TeamEmployee = require("../models/TeamEmployee");
const Like = require("../models/Like");
const NotificationType = require("../models/NotificationType");
const NotificationController = require("./notificationController");

exports.createPost = async (req, res) => {
  const { target_dep_id, target_team_id, target_location, content, file_location } = req.body;
  const { id } = req.user;

  try {
    if (!content) {
      return res.status(400).json({ message: "Post content is required." });
    }

    const post = await Post.create({
      emp_id: id,
      target_dep_id,
      target_team_id,
      target_location,
      content,
      file_location,
    });

    res.status(201).json({ message: "Post created successfully", post });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.createCongratulatoryPost = async (req, res) => {
  const { target_dep_id, target_team_id, target_location, related_emp_id, content, file_location } = req.body;
  const { id } = req.user;

  try {
    if (!content || !related_emp_id) {
      return res.status(400).json({ message: "Content and related employee ID are required." });
    }

    const post = await Post.create({
      emp_id: id,
      related_emp_id,
      target_dep_id,
      target_team_id,
      target_location,
      content,
      file_location,
      visibility: false,
    });

    const notificationType = await NotificationType.findOne({type_name: "Congratulatory Post"});
    if (!notificationType) {
      return res.status(404).json({ message: "Notification type not found" });
    }

    await NotificationController.createNotification({
      body: {
        recipient_id: related_emp_id,
        noti_type_id: notificationType._id,
        related_entity_id: post._id,
        message: "You've received a congratulatory post. Please set visibility preferences.",
      },
    });

    res.status(201).json({ message: "Congratulatory post created successfully", post });
  } catch (error) {
    console.error("Error creating congratulatory post:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updatePostVisibility = async (req, res) => {
  const { post_id, visibility } = req.body;
  const { id } = req.user;

  try {
    if (typeof visibility !== "boolean") {
      return res.status(400).json({ message: "Invalid visibility value." });
    }

    const post = await Post.findOne({ _id: post_id, related_emp_id: id });
    if (!post) {
      return res.status(404).json({ message: "Post not found or access denied." });
    }

    post.visibility = visibility;
    await post.save();

    res.status(200).json({ message: "Post visibility updated successfully", post });
  } catch (error) {
    console.error("Error updating post visibility:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getTargetedPosts = async (req, res) => {
    const { id } = req.user;
  
    try {
      const employee = await Employee.findById( id );
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      const teamIds = (
        await TeamEmployee.find({ emp_id: id })
      ).map((teamEmployee) => teamEmployee.team_id);
  
      const targetedPosts = await Post.find({
        $or: [
          { target_dep_id: employee.dep_id }, // Posts for the employee's department
          { target_team_id: { $in: teamIds } }, // Posts for the employee's teams
          { target_location: employee.location }, // Posts for the employee's location
          { target_dep_id: null, target_team_id: null, target_location: null }, // Posts for all
        ],
      })
      .populate("emp_id", "f_name l_name position dep_id")
      .populate({
        path: "emp_id",
        populate: { path: "dep_id", select: "name" },
       })
       .sort({ timestamp: -1 });

        const enrichedPosts = await Promise.all(
            targetedPosts.map(async (post) => {
              const teamName = post.target_team_id
                ? (await Team.findById(post.target_team_id))?.name
                : null;
      
              return {
                ...post.toObject(),
                author: {
                  f_name: post.emp_id?.f_name,
                  l_name: post.emp_id?.l_name,
                  position: post.emp_id?.position,
                  department: post.emp_id?.dep_id?.name,
                },
                target_team_name: teamName,
              };
            })
          );
  
      res.status(200).json({ posts: enrichedPosts });
    } catch (error) {
      console.error("Error fetching targeted posts:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

exports.createComment = async (req, res) => {
  const { post_id, content } = req.body;
  const { id } = req.user;

  try {
    if (!content) {
      return res.status(400).json({ message: "Comment content is required." });
    }

    const post = await Post.findById(post_id);
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    const comment = await Comment.create({ post_id, emp_id: id, content });

    await Post.findByIdAndUpdate(post_id, { $inc: { comments: 1 } });

    const notificationType = await NotificationType.findOne({type_name: "Comment on Post"});
    if (!notificationType) {
      return res.status(404).json({ message: "Notification type not found" });
    }

    if (String(post.emp_id) !== String(emp_id)) {
      await NotificationController.createNotification({
        body: {
          recipient_id: post.emp_id,
          noti_type_id: notificationType._id,
          related_entity_id: post_id,
          message: `A new comment was added to your post: "${content}"`,
        },
      });
    }

    res.status(201).json({ message: "Comment created successfully", comment });
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getCommentsByPost = async (req, res) => {
  const { post_id } = req.params;

  try {
    const comments = await Comment.find({ post_id })
      .populate("emp_id", "f_name l_name position dep_id") 
      .populate({
        path: "emp_id",
        populate: { path: "dep_id", select: "name" },
      });

    const enrichedComments = await Promise.all(
      comments.map(async (comment) => {
        const team = await TeamEmployee.findOne({ emp_id: comment.emp_id._id }).populate("team_id", "name");

        return {
          ...comment.toObject(),
          employee: {
            f_name: comment.emp_id.f_name,
            l_name: comment.emp_id.l_name,
            position: comment.emp_id.position,
            department: comment.emp_id.dep_id?.name,
            team_name: team?.team_id?.name || null,
          },
        };
      })
    );

    res.status(200).json({ comments: enrichedComments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.likePost = async (req, res) => {
  const { post_id } = req.body;
  const { id } = req.user;

  try {
    const existingLike = await Like.findOne({ post_id, emp_id: id });
    if (existingLike) {
      return res.status(400).json({ message: "You have already liked this post." });
    }

    await Like.create({ post_id, emp_id: id });

    await Post.findByIdAndUpdate(post_id, { $inc: { likes: 1 } });

    res.status(200).json({ message: "Post liked successfully" });
  } catch (error) {
    console.error("Error liking post:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.unlikePost = async (req, res) => {
  const { post_id } = req.body;
  const { id } = req.user;

  try {
    const existingLike = await Like.findOne({ post_id, emp_id: id });
    if (!existingLike) {
      return res.status(400).json({ message: "You have not liked this post." });
    }

    await Like.findOneAndDelete({ post_id, emp_id: id });

    await Post.findByIdAndUpdate(post_id, { $inc: { likes: -1 } });

    res.status(200).json({ message: "Post unliked successfully" });
  } catch (error) {
    console.error("Error unliking post:", error);
    res.status(500).json({ message: "Server error" });
  }
};
