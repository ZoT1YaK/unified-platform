const mongoose = require("mongoose");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Employee = require("../models/Employee");
const TeamEmployee = require("../models/TeamEmployee");
const Like = require("../models/Like");
const Team = require("../models/Team");
const Department = require("../models/Department");
const Location = require("../models/Location"); 
const PostTeam = require("../models/PostTeam");
const PostDepartment = require("../models/PostDepartment");
const PostLocation = require("../models/PostLocation");
const NotificationType = require("../models/NotificationType");
const NotificationController = require("./notificationController");

exports.createPost = async (req, res) => {
  const { target_teams, target_departments, target_locations, content, file_location, global } = req.body;
  const { id } = req.user;

  try {
      if (!content) {
          return res.status(400).json({ message: "Post content is required." });
      }

      let post = null;

      if (global) {
          const allTeams = await Team.find().distinct("_id");
          const allDepartments = await Department.find().distinct("_id");
          const allLocations = await Employee.distinct("location");

          post = await Post.create({
              emp_id: id,
              content,
              file_location,
              visibility: true,
              global: true, 
          });

          await PostTeam.insertMany(allTeams.map((team_id) => ({ post_id: post._id, team_id })));
          await PostDepartment.insertMany(allDepartments.map((dep_id) => ({ post_id: post._id, dep_id })));
          await PostLocation.insertMany(allLocations.map((location) => ({ post_id: post._id, location })));
      } else {
          post = await Post.create({
              emp_id: id,
              content,
              file_location,
              visibility: true,
          });

          if (target_teams?.length) {
              const postTeams = target_teams.map((team_id) => ({
                  post_id: post._id,
                  team_id,
              }));
              await PostTeam.insertMany(postTeams);
          }

          if (target_departments?.length) {
              const postDepartments = target_departments.map((dep_id) => ({
                  post_id: post._id,
                  dep_id,
              }));
              await PostDepartment.insertMany(postDepartments);
          }

          if (target_locations?.length) {
              const postLocations = target_locations.map((location) => ({
                  post_id: post._id,
                  location,
              }));
              await PostLocation.insertMany(postLocations);
          }
      }

      res.status(201).json({ message: "Post created successfully", post });
  } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ message: "Server error" });
  }
};


exports.createCongratulatoryPost = async (req, res) => {
  const { target_teams, target_departments, target_locations, related_emp_id, content, file_location } = req.body;
  const { id } = req.user;

  try {
    const peopleLeader = await Employee.findById(id);
    if (!peopleLeader || !peopleLeader.is_people_leader) {
      return res.status(403).json({ message: "Only people leaders can create congratulatory posts." });
    }

    if (!content || !related_emp_id) {
      return res.status(400).json({ message: "Content and related employee ID are required." });
    }

    const relatedEmployee = await Employee.findById(related_emp_id);
    if (!relatedEmployee) {
      return res.status(404).json({ message: "Related employee not found." });
    }

    const post = await Post.create({
      emp_id: id,
      related_emp_id,
      content,
      file_location,
      visibility: false,
    });

    if (target_teams?.length) {
      const postTeams = target_teams.map((team_id) => ({
        post_id: post._id,
        team_id,
      }));
      await PostTeam.insertMany(postTeams);
    }

    if (target_departments?.length) {
      const postDepartments = target_departments.map((dep_id) => ({
        post_id: post._id,
        dep_id,
      }));
      await PostDepartment.insertMany(postDepartments);
    }

    if (target_locations?.length) {
      const postLocations = target_locations.map((location) => ({
        post_id: post._id,
        location,
      }));
      await PostLocation.insertMany(postLocations);
    }

    const notificationType = await NotificationType.findOne({type_name: "Congratulatory Post"});
    if (!notificationType) {
      return res.status(404).json({ message: "Notification type not found" });
    }

    await NotificationController.createNotification({
      recipient_id: related_emp_id,
      noti_type_id: notificationType._id,
      related_entity_id: post._id,
      message: "You've received a congratulatory post. Please set visibility preferences.",
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
    const employee = await Employee.findById( id ).populate("dep_id", "name");;
      if (!employee) {
          return res.status(404).json({ message: "Employee not found" });
      }

      const teamIds = (
          await TeamEmployee.find({ emp_id: id })
      ).map((teamEmployee) => teamEmployee.team_id);

      const posts = await Post.find({
          $or: [
              { global: true }, 
              { _id: { $in: await PostTeam.find({ team_id: { $in: teamIds } }).distinct("post_id") } }, // Team-targeted posts
              { _id: { $in: await PostDepartment.find({ dep_id: employee.dep_id }).distinct("post_id") } }, // Department-targeted posts
              { _id: { $in: await PostLocation.find({ location: employee.location }).distinct("post_id") } }, // Location-targeted posts
              { related_emp_id: id }, // Congratulatory posts
              { emp_id: id }, 
          ],
          visibility: true, 
      })
      .populate("emp_id", "f_name l_name position dep_id location")
      .populate({
        path: "emp_id",
        populate: [
          { path: "dep_id", select: "name" },
          { path: "location", select: "city country" },
        ],
      })
          .sort({ timestamp: -1 });

      const enrichedPosts = await Promise.all(
        posts.map(async (post) => {
          const teamNames = await PostTeam.find({ post_id: post._id })
            .populate("team_id", "name")
            .then((teams) => teams.map((team) => team.team_id.name));
  
          return {
            _id: post._id,
            content: post.content,
            likes: post.likes,
            comments: post.comments,
            visibility: post.visibility,
            timestamp: post.timestamp,
            author: {
              f_name: post.emp_id?.f_name,
              l_name: post.emp_id?.l_name,
              position: post.emp_id?.position,
              department: post.emp_id?.dep_id?.name,
            },
            target_team_names: teamNames,
          };
        })
      );

    res.status(200).json({ posts: enrichedPosts });
  } catch (error) {
      console.error("Error fetching posts:", error);
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

    if (String(post.emp_id) !== String(id)) {
      await NotificationController.createNotification({
        recipient_id: post.emp_id,
        noti_type_id: notificationType._id,
        related_entity_id: post_id,
        message: `A new comment was added to your post: "${content}"`,
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
    if (!mongoose.Types.ObjectId.isValid(post_id)) {
    return res.status(400).json({ message: "Invalid post ID." });
    }

    const comments = await Comment.find({ post_id })
      .populate("emp_id", "f_name l_name position dep_id") 
      .populate({
        path: "emp_id",
        populate: { path: "dep_id", select: "name" },
      });

    if (!comments.length) {
      return res.status(404).json({ message: "No comments found for this post." });
    }

    const enrichedComments = await Promise.all(
      comments.map(async (comment) => {
        const team = await TeamEmployee.findOne({ emp_id: comment.emp_id._id }).populate("team_id", "name");

        return {
          _id: comment._id,
          content: comment.content,
          timestamp: comment.timestamp,
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
    const post = await Post.findById(post_id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

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
    const post = await Post.findById(post_id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
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

exports.getPostResources = async (req, res) => {
  try {
    const teams = await Team.find().sort({ name: 1 });
    const departments = await Department.find().sort({ name: 1 });
    const locations = await Location.find().sort({ city: 1 }); // Fetch full location objects

    res.status(200).json({
      teams,
      departments,
      locations,
    });
  } catch (error) {
    console.error("Error fetching event resources:", error);
    res.status(500).json({ message: "Server error" });
  }
};