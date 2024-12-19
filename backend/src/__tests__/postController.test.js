const mongoose = require("mongoose");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Employee = require("../models/Employee");
const TeamEmployee = require("../models/TeamEmployee");
const Like = require("../models/Like");
const Team = require("../models/Team");
const Department = require("../models/Department");
const PostTeam = require("../models/PostTeam");
const PostDepartment = require("../models/PostDepartment");
const PostLocation = require("../models/PostLocation");
const NotificationType = require("../models/NotificationType");
const NotificationController = require("../controllers/notificationController");
const postController = require("../controllers/postController");

jest.mock("../models/Post");
jest.mock("../models/Comment");
jest.mock("../models/Employee");
jest.mock("../models/TeamEmployee");
jest.mock("../models/Like");
jest.mock("../models/Team");
jest.mock("../models/Department");
jest.mock("../models/PostTeam");
jest.mock("../models/PostDepartment");
jest.mock("../models/PostLocation");
jest.mock("../models/NotificationType");
jest.mock("../controllers/notificationController");

describe("Post Controller", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {}); // Suppress console.error
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createPost", () => {
    it("should create a global post successfully", async () => {
        const mockPost = { _id: "post_id", content: "Global post content", global: true };
        const mockTeams = ["team_id1", "team_id2"];
        const mockDepartments = ["department_id1", "department_id2"];
        const mockLocations = ["location1", "location2"];
  
        // Mock `Team.find().distinct()`
        Team.find = jest.fn(() => ({
          distinct: jest.fn().mockResolvedValue(mockTeams),
        }));
  
        // Mock `Department.find().distinct()`
        Department.find = jest.fn(() => ({
          distinct: jest.fn().mockResolvedValue(mockDepartments),
        }));
  
        // Mock `Employee.distinct()`
        Employee.distinct = jest.fn().mockResolvedValue(mockLocations);
  
        // Mock other dependencies
        Post.create = jest.fn().mockResolvedValue(mockPost);
        PostTeam.insertMany = jest.fn().mockResolvedValue();
        PostDepartment.insertMany = jest.fn().mockResolvedValue();
        PostLocation.insertMany = jest.fn().mockResolvedValue();
  
        const req = {
          user: { id: "employee_id" },
          body: {
            global: true,
            content: "Global post content",
          },
        };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  
        // Call the controller method
        await postController.createPost(req, res);
  
        // Assertions for method calls
        expect(Team.find).toHaveBeenCalled();
        expect(Department.find).toHaveBeenCalled();
        expect(Employee.distinct).toHaveBeenCalledWith("location", { location: { $ne: null } });
        expect(Post.create).toHaveBeenCalledWith(
          expect.objectContaining({ content: "Global post content", global: true })
        );
  
        // Assertions for response
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ message: "Post created successfully", post: mockPost });
      });
  
    it("should return an error when content is missing", async () => {
      const req = { user: { id: "employee_id" }, body: {} };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  
      await postController.createPost(req, res);
  
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Content or media links are required." });
    });
  
    it("should handle server errors gracefully", async () => {
      Post.create.mockRejectedValue(new Error("Database error"));
  
      const req = { user: { id: "employee_id" }, body: { content: "Error post" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  
      await postController.createPost(req, res);
  
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });  
  
  describe("updatePostVisibility", () => {
    it("should update post visibility successfully", async () => {
      const mockPost = { _id: "post_id", visibility: false, save: jest.fn().mockResolvedValue() };
  
      Post.findOne.mockResolvedValue(mockPost);
  
      const req = { user: { id: "employee_id" }, body: { post_id: "post_id", visibility: true } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  
      await postController.updatePostVisibility(req, res);
  
      expect(Post.findOne).toHaveBeenCalledWith({ _id: "post_id", related_emp_id: "employee_id" });
      expect(mockPost.visibility).toBe(true);
      expect(mockPost.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Post visibility updated successfully",
        post: mockPost,
      });
    });
  
    it("should return an error if post is not found", async () => {
      Post.findOne.mockResolvedValue(null);
  
      const req = { user: { id: "employee_id" }, body: { post_id: "post_id", visibility: true } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  
      await postController.updatePostVisibility(req, res);
  
      expect(Post.findOne).toHaveBeenCalledWith({ _id: "post_id", related_emp_id: "employee_id" });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Post not found or access denied." });
    });
  });
  
  describe("getTargetedPosts", () => {
    it("should fetch targeted posts for the logged-in employee", async () => {
        const mockEmployee = {
          _id: "employee_id",
          dep_id: { _id: "department_id", name: "Department A" },
          location: "location_1",
        };
      
        const mockTeamEmployees = [{ team_id: "team_id_1" }];
        const mockTeamPostIds = ["post_1", "post_2"];
        const mockDepartmentPostIds = ["post_3"];
        const mockLocationPostIds = ["post_4"];
      
        const mockPosts = [
          {
            _id: "post_1",
            content: "Post 1 content",
            emp_id: {
              f_name: "John",
              l_name: "Doe",
              position: "Manager",
              dep_id: { name: "HR" },
              img_link: "/img.png",
            },
            likes: 5,
            comments: 2,
            visibility: true,
            timestamp: new Date(),
          },
        ];
      
        const mockTeamNames = [
          { team_id: { name: "Team A" } },
          { team_id: { name: "Team B" } },
        ];
      
        // Mock Employee.findById
        const mockFindById = {
          populate: jest.fn().mockResolvedValue(mockEmployee),
        };
        Employee.findById.mockReturnValue(mockFindById);
      
        // Mock TeamEmployee.find
        TeamEmployee.find.mockResolvedValue(mockTeamEmployees);
      
        // Mock PostTeam.find with distinct
        PostTeam.find.mockReturnValueOnce({
          distinct: jest.fn().mockResolvedValue(mockTeamPostIds),
        });
      
        // Mock PostDepartment.find with distinct
        PostDepartment.find.mockReturnValue({
          distinct: jest.fn().mockResolvedValue(mockDepartmentPostIds),
        });
      
        // Mock PostLocation.find with distinct
        PostLocation.find.mockReturnValue({
          distinct: jest.fn().mockResolvedValue(mockLocationPostIds),
        });
      
        // Mock Post.find with populate and sort
        const mockPostFind = {
          populate: jest.fn().mockReturnThis(),
          sort: jest.fn().mockResolvedValue(mockPosts),
        };
        Post.find.mockReturnValue(mockPostFind);
      
        // Mock PostTeam.find for enrichment logic
        PostTeam.find.mockImplementation((query) => {
          if (query.post_id === "post_1") {
            return {
              populate: jest.fn().mockResolvedValue(mockTeamNames),
            };
          }
          return { populate: jest.fn().mockResolvedValue([]) };
        });
      
        const req = { user: { id: "employee_id" } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      
        // Call the controller
        await postController.getTargetedPosts(req, res);
      
        // Assertions
        expect(Employee.findById).toHaveBeenCalledWith("employee_id");
        expect(mockFindById.populate).toHaveBeenCalledWith("dep_id", "name");
      
        expect(TeamEmployee.find).toHaveBeenCalledWith({ emp_id: "employee_id" });
      
        expect(PostTeam.find).toHaveBeenCalledWith({ team_id: { $in: ["team_id_1"] } });
        expect(PostDepartment.find).toHaveBeenCalledWith({ dep_id: mockEmployee.dep_id });
        expect(PostLocation.find).toHaveBeenCalledWith({ location: mockEmployee.location });
      
        expect(Post.find).toHaveBeenCalledWith(
          expect.objectContaining({
            $or: expect.any(Array),
            visibility: true,
          })
        );
        expect(mockPostFind.populate).toHaveBeenCalledWith("emp_id", "f_name l_name position dep_id location img_link");
        expect(mockPostFind.sort).toHaveBeenCalledWith({ timestamp: -1 });
      
        expect(PostTeam.find).toHaveBeenCalledWith({ post_id: "post_1" });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          posts: expect.arrayContaining([
            expect.objectContaining({
              _id: "post_1",
              content: "Post 1 content",
              target_team_names: ["Team A", "Team B"],
            }),
          ]),
        });
      });
      
    it("should return 404 if the employee is not found", async () => {
      const mockEmployeeFind = {
        populate: jest.fn().mockResolvedValue(null), 
      };
      Employee.findById.mockReturnValue(mockEmployeeFind);
  
      const req = { user: { id: "employee_id" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  
      await postController.getTargetedPosts(req, res);
  
      expect(Employee.findById).toHaveBeenCalledWith("employee_id");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Employee not found" });
    });
  
    it("should handle server errors gracefully", async () => {
      Employee.findById.mockReturnValue({
        sort: jest.fn().mockRejectedValue(new Error("Database error")),
      });
  
      const req = { user: { id: "employee_id" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  
      await postController.getTargetedPosts(req, res);
  
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });
  
  describe("createComment", () => {
    it("should create a comment successfully", async () => {
      const mockPost = { _id: "post_id" };
      const mockComment = { _id: "comment_id", content: "New comment" };
      const mockNotificationType = { _id: "notification_type_id", type_name: "Comment on Post" };
  
      Post.findById.mockResolvedValue(mockPost);
      Comment.create.mockResolvedValue(mockComment);
      NotificationType.findOne.mockResolvedValue(mockNotificationType);
      NotificationController.createNotification.mockResolvedValue();
  
      const req = { user: { id: "employee_id" }, body: { post_id: "post_id", content: "New comment" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  
      await postController.createComment(req, res);
  
      expect(Post.findById).toHaveBeenCalledWith("post_id");
      expect(Comment.create).toHaveBeenCalledWith({ post_id: "post_id", emp_id: "employee_id", content: "New comment" });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Comment created successfully",
        comment: mockComment,
      });
    });
  
    it("should return 404 if the post is not found", async () => {
      Post.findById.mockResolvedValue(null);
  
      const req = { user: { id: "employee_id" }, body: { post_id: "post_id", content: "New comment" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  
      await postController.createComment(req, res);
  
      expect(Post.findById).toHaveBeenCalledWith("post_id");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Post not found." });
    });
  
    it("should handle server errors gracefully", async () => {
      Post.findById.mockRejectedValue(new Error("Database error"));
  
      const req = { user: { id: "employee_id" }, body: { post_id: "post_id", content: "New comment" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  
      await postController.createComment(req, res);
  
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });
  
  describe("likePost", () => {
    it("should like a post successfully", async () => {
      const mockPost = { _id: "post_id" };
  
      Post.findById.mockResolvedValue(mockPost);
      Like.findOne.mockResolvedValue(null);
      Like.create.mockResolvedValue();
  
      const req = { user: { id: "employee_id" }, body: { post_id: "post_id" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  
      await postController.likePost(req, res);
  
      expect(Post.findById).toHaveBeenCalledWith("post_id");
      expect(Like.findOne).toHaveBeenCalledWith({ post_id: "post_id", emp_id: "employee_id" });
      expect(Like.create).toHaveBeenCalledWith({ post_id: "post_id", emp_id: "employee_id" });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Post liked successfully" });
    });
  
    it("should return 404 if the post is not found", async () => {
      Post.findById.mockResolvedValue(null);
  
      const req = { user: { id: "employee_id" }, body: { post_id: "post_id" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  
      await postController.likePost(req, res);
  
      expect(Post.findById).toHaveBeenCalledWith("post_id");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Post not found" });
    });
  
    it("should handle server errors gracefully", async () => {
      Post.findById.mockRejectedValue(new Error("Database error"));
  
      const req = { user: { id: "employee_id" }, body: { post_id: "post_id" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  
      await postController.likePost(req, res);
  
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });
  
  describe("unlikePost", () => {
    it("should unlike a post successfully", async () => {
      const mockPost = { _id: "post_id" };
      const mockLike = { _id: "like_id" };
  
      Post.findById.mockResolvedValue(mockPost);
      Like.findOne.mockResolvedValue(mockLike);
      Like.findOneAndDelete.mockResolvedValue();
  
      const req = { user: { id: "employee_id" }, body: { post_id: "post_id" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  
      await postController.unlikePost(req, res);
  
      expect(Post.findById).toHaveBeenCalledWith("post_id");
      expect(Like.findOneAndDelete).toHaveBeenCalledWith({ post_id: "post_id", emp_id: "employee_id" });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Post unliked successfully" });
    });
  
    it("should return 404 if the post is not found", async () => {
      Post.findById.mockResolvedValue(null);
  
      const req = { user: { id: "employee_id" }, body: { post_id: "post_id" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  
      await postController.unlikePost(req, res);
  
      expect(Post.findById).toHaveBeenCalledWith("post_id");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Post not found" });
    });
  
    it("should handle server errors gracefully", async () => {
      Post.findById.mockRejectedValue(new Error("Database error"));
  
      const req = { user: { id: "employee_id" }, body: { post_id: "post_id" } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  
      await postController.unlikePost(req, res);
  
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });
  
});
