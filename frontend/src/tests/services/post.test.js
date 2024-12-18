import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import {
    createPost,
    deletePost,
    fetchPostComments,
    fetchPostResources,
    fetchPosts,
    fetchUserPosts,
    likePost,
    postComment,
    unlikePost
} from "../../services/postService";

describe("postService", () => {
    let mock;

    beforeEach(() => {
        mock = new MockAdapter(axios);
    });

    afterEach(() => {
        mock.restore();
    });

    describe("fetchPosts", () => {
        it("should fetch all posts", async () => {
            const token = "test-token";
            const posts = [{id: 1, content: "Post 1"}];
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/posts/get`;
            mock.onGet(endpoint).reply(config => {
                if (config.headers.Authorization === `Bearer ${token}`) {
                    return [200, {posts}];
                }
                return [404];
            });

            const result = await fetchPosts(token);
            expect(result).toEqual(posts);
        });

        it("should handle network error", async () => {
            const token = "test-token";
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/posts/get`;
            mock.onGet(endpoint).networkError();

            await expect(fetchPosts(token)).rejects.toThrow();
        });
    });

    describe("fetchPostComments", () => {
        it("should fetch comments for a specific post", async () => {
            const token = "test-token";
            const postId = "1";
            const comments = [{id: 1, content: "Comment 1"}];
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/posts/${postId}/comments`;
            mock.onGet(endpoint).reply(config => {
                if (config.headers.Authorization === `Bearer ${token}`) {
                    return [200, {comments}];
                }
                return [404];
            });

            const result = await fetchPostComments(token, postId);
            expect(result).toEqual(comments);
        });

        it("should handle network error", async () => {
            const token = "test-token";
            const postId = "1";
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/posts/${postId}/comments`;
            mock.onGet(endpoint).networkError();

            await expect(fetchPostComments(token, postId)).rejects.toThrow();
        });
    });

    describe("likePost", () => {
        it("should like a post", async () => {
            const token = "test-token";
            const postId = "1";
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/posts/like`;
            mock.onPost(endpoint).reply(config => {
                if (config.headers.Authorization === `Bearer ${token}` && config.data === JSON.stringify({post_id: postId})) {
                    return [200];
                }
                return [404];
            });

            await expect(likePost(token, postId)).resolves.toBeUndefined();
        });

        it("should handle network error", async () => {
            const token = "test-token";
            const postId = "1";
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/posts/like`;
            mock.onPost(endpoint).networkError();

            await expect(likePost(token, postId)).rejects.toThrow();
        });
    });

    describe("unlikePost", () => {
        it("should unlike a post", async () => {
            const token = "test-token";
            const postId = "1";
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/posts/unlike`;
            mock.onPost(endpoint).reply(config => {
                if (config.headers.Authorization === `Bearer ${token}` && config.data === JSON.stringify({post_id: postId})) {
                    return [200];
                }
                return [404];
            });

            await expect(unlikePost(token, postId)).resolves.toBeUndefined();
        });

        it("should handle network error", async () => {
            const token = "test-token";
            const postId = "1";
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/posts/unlike`;
            mock.onPost(endpoint).networkError();

            await expect(unlikePost(token, postId)).rejects.toThrow();
        });
    });

    describe("postComment", () => {
        it("should post a comment on a post", async () => {
            const token = "test-token";
            const postId = "1";
            const content = "This is a comment";
            const comment = {id: 1, content};
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/posts/comments`;
            mock.onPost(endpoint).reply(config => {
                if (config.headers.Authorization === `Bearer ${token}` && config.data === JSON.stringify({
                    post_id: postId,
                    content
                })) {
                    return [200, {comment}];
                }
                return [404];
            });

            const result = await postComment(token, postId, content);
            expect(result).toEqual(comment);
        });

        it("should handle network error", async () => {
            const token = "test-token";
            const postId = "1";
            const content = "This is a comment";
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/posts/comments`;
            mock.onPost(endpoint).networkError();

            await expect(postComment(token, postId, content)).rejects.toThrow();
        });
    });

    describe("fetchPostResources", () => {
        it("should fetch post resources", async () => {
            const token = "test-token";
            const resources = {locations: [], departments: [], teams: []};
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/posts/resources`;
            mock.onGet(endpoint).reply(config => {
                if (config.headers.Authorization === `Bearer ${token}`) {
                    return [200, resources];
                }
                return [404];
            });

            const result = await fetchPostResources(token);
            expect(result).toEqual(resources);
        });

        it("should handle network error", async () => {
            const token = "test-token";
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/posts/resources`;
            mock.onGet(endpoint).networkError();

            await expect(fetchPostResources(token)).rejects.toThrow();
        });
    });

    describe("createPost", () => {
        it("should create a new post", async () => {
            const token = "test-token";
            const postPayload = {content: "New Post", mediaLinks: [], target_audiences: []};
            const createdPost = {id: 1, content: "New Post"};
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/posts/create`;
            mock.onPost(endpoint).reply(config => {
                if (config.headers.Authorization === `Bearer ${token}` && config.data === JSON.stringify(postPayload)) {
                    return [200, createdPost];
                }
                return [404];
            });

            const result = await createPost(token, postPayload);
            expect(result).toEqual(createdPost);
        });

        it("should handle network error", async () => {
            const token = "test-token";
            const postPayload = {content: "New Post", mediaLinks: [], target_audiences: []};
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/posts/create`;
            mock.onPost(endpoint).networkError();

            await expect(createPost(token, postPayload)).rejects.toThrow();
        });
    });

    describe("fetchUserPosts", () => {
        it("should fetch posts for a specific user", async () => {
            const token = "test-token";
            const loggedInUser = {f_name: "John", l_name: "Doe"};
            const posts = [
                {id: 1, content: "Post 1", author: {f_name: "John", l_name: "Doe"}},
                {id: 2, content: "Post 2", author: {f_name: "Jane", l_name: "Doe"}}
            ];
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/posts/get`;
            mock.onGet(endpoint).reply(config => {
                if (config.headers.Authorization === `Bearer ${token}`) {
                    return [200, {posts}];
                }
                return [404];
            });

            const result = await fetchUserPosts(token, loggedInUser);
            expect(result).toEqual([posts[0]]);
        });

        it("should handle network error", async () => {
            const token = "test-token";
            const loggedInUser = {f_name: "John", l_name: "Doe"};
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/posts/get`;
            mock.onGet(endpoint).networkError();

            await expect(fetchUserPosts(token, loggedInUser)).rejects.toThrow();
        });
    });

    describe("deletePost", () => {
        it("should delete a specific post", async () => {
            const token = "test-token";
            const postId = "1";
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/posts/delete`;
            mock.onDelete(endpoint).reply(config => {
                if (config.headers.Authorization === `Bearer ${token}` && config.data === JSON.stringify({post_id: postId})) {
                    return [200];
                }
                return [404];
            });

            await expect(deletePost(token, postId)).resolves.toBeUndefined();
        });

        it("should handle network error", async () => {
            const token = "test-token";
            const postId = "1";
            const endpoint = `${process.env.REACT_APP_BACKEND_URL}/api/posts/delete`;
            mock.onDelete(endpoint).networkError();

            await expect(deletePost(token, postId)).rejects.toThrow();
        });
    });
});
