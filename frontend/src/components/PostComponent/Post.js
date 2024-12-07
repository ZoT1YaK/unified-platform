import React, { useState } from 'react';
import './Post.css';

const PostComponent = ({ user, post }) => {
    // const [comments, setComments] = useState(post.comments || []);
    const [newComment, setNewComment] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // const handleAddComment = () => {
    //     if (newComment.trim()) {
    //         setComments([...comments, { user: 'Bob Bobrovich', text: newComment }]);
    //         setNewComment('');
    //     }
    // };

    const toggleDialog = () => {
        setIsDialogOpen(!isDialogOpen);
    };

    return (
        <div className="post-component">
            <div className="post-header">
                <img src={user.avatar} alt="User Avatar" className="post-avatar" />
                <div className="post-user-info">
                    <h2>{user.name}</h2>
                    <p>{user.position}</p>
                    <p>{post.timeAgo}</p>
                </div>
            </div>

            <div className="post-description">
                <p>{post.description}</p>
                <div className="post-attachments">
                    {post.attachments.map((attachment, index) => (
                        <img key={index} src={attachment} alt={`Attachment ${index}`} className="post-attachment" />
                    ))}
                </div>
            </div>

            <div className="post-footer">
                <div className="likes-section">
                    <img src="/like.png" alt="Like icon" className="like-icon" />
                    <span>{post.likes}</span>
                </div>
                <div className="comments-section" onClick={toggleDialog}>
                    <img src="/comment.png" alt="Comment icon" className="comment-icon" />
                    {/* <span>{comments.length}</span> */}
                </div>
            </div>

            <hr />

            <div className="comment-area" onClick={toggleDialog}>
                <input
                    type="text"
                    placeholder={`Write a comment on ${user.name}'s post...`}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                />
            </div>

            {/* {isDialogOpen && (
                <CommentDialog comments={comments} addComment={handleAddComment} closeDialog={toggleDialog} />
            )} */}
        </div>
    );
};

// const CommentDialog = ({ comments, addComment, closeDialog }) => {
//     return (
//         <div className="comment-dialog-overlay" onClick={closeDialog}>
//             <div className="comment-dialog" onClick={(e) => e.stopPropagation()}>
//                 <div className="comment-dialog-header">
//                     <h3>Comments</h3>
//                     <button className="close-btn" onClick={closeDialog}>Close</button>
//                 </div>
//                 <div className="comments-list">
//                     {comments.map((comment, index) => (
//                         <div key={index} className="comment">
//                             <p><strong>{comment.user}:</strong> {comment.text}</p>
//                         </div>
//                     ))}
//                 </div>
//                 <textarea
//                     placeholder="Write a comment..."
//                     className="comment-textarea"
//                     onChange={(e) => addComment(e.target.value)}
//                 />
//                 <button className="post-comment-btn" onClick={addComment}>Post Comment</button>
//             </div>
//         </div>
//     );
// };

export default PostComponent;
