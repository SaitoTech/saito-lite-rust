// import React, { useState } from 'react';
// import { Clock, Edit, Trash2, X } from 'lucide-react';
// import BlogEditor from './BlogEditor'; 

// const BlogPostDetail = ({ post, app, mod, publicKey, onedit = null, ondelete = null, topMargin = false }) => {
//     const [isEditing, setIsEditing] = useState(false);
//     const [editedContent, setEditedContent] = useState(post.content);
//     const [editedTitle, setEditedTitle] = useState(post.title);

//     const formatDate = (timestamp) => {
//         const date = new Date(timestamp);
//         return new Intl.DateTimeFormat('en-US', {
//             year: 'numeric',
//             month: 'long',
//             day: 'numeric',
//             hour: '2-digit',
//             minute: '2-digit'
//         }).format(date);
//     };

//     const handleEdit = () => {
//         setIsEditing(true);
//     };

//     const handleDelete = async () => {
//         let res = await sconfirm('Are you sure you want to delete this post?');
//         if (res) {
//             await mod.deleteBlogPost(post.sig);
//             setTimeout(() => {
//                 if (ondelete) {
//                     ondelete(post.sig)
//                 }
//             }, 2000)

//         }
//     };

//     const handleSave = () => {
//         // Save the changes
//         console.log('Saving changes:', { title: editedTitle, content: editedContent });
//         mod.updateBlogPostTransaction(post.sig, editedTitle, editedContent)
//         if (onedit) {
//             onedit(post.sig, editedTitle, editedContent)
//         }
//         setIsEditing(false);
//     };

//     const handleCancel = () => {
//         setEditedContent(post.content);
//         setEditedTitle(post.title);
//         setIsEditing(false);
//     };

//     const isAuthor = publicKey === mod.publicKey;

//     if (isEditing) {
//         return (
//             <div className="blog-post-detail" style={{ marginTop: topMargin === true ? "var(--saito-header-height)" : "" }} >
//                 <div className="blog-post-content">
//                     <div className="edit-header">
//                         <input
//                             type="text"
//                             value={editedTitle}
//                             onChange={(e) => setEditedTitle(e.target.value)}
//                             className="edit-title-input"
//                             placeholder="Enter title..."
//                         />
//                         <div className="edit-actions">
//                             <button
//                                 className="action-btn save-btn"
//                                 onClick={handleSave}
//                             >
//                                 Save
//                             </button>
//                             <button
//                                 className="action-btn cancel-btn"
//                                 onClick={handleCancel}
//                             >
//                                 <X size={18} />
//                                 <span>Cancel</span>
//                             </button>
//                         </div>
//                     </div>
//                     <div className="editor-container">
//                         <BlogEditor
//                             value={editedContent}
//                             onEditorChange={setEditedContent}
//                         />
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div style={{ marginTop: topMargin === true ? "var(--saito-header-height)" : "" }} className="blog-post-detail">
//             <article className="blog-post-content">
//                 <div className="author-info">
//                     <div className="author-image">
//                         <img src={app.keychain.returnIdenticon(publicKey)} alt="Author" />
//                     </div>
//                     <div className="author-details">
//                         <h5 className="author-name">
//                             {app.keychain.returnUsername(publicKey)}
//                         </h5>
//                         <div className="meta-item">
//                             <Clock size={16} />
//                             <span>{formatDate(post.timestamp)}</span>
//                         </div>
//                     </div>
//                     {isAuthor && (
//                         <div className="post-actions">
//                             <button
//                                 className="action-btn edit-btn"
//                                 onClick={handleEdit}
//                                 aria-label="Edit post"
//                             >
//                                 <Edit size={18} />
//                                 <span>Edit</span>
//                             </button>
//                             <button
//                                 className="action-btn delete-btn"
//                                 onClick={handleDelete}
//                                 aria-label="Delete post"
//                             >
//                                 <Trash2 size={18} />
//                                 <span>Delete</span>
//                             </button>
//                         </div>
//                     )}
//                 </div>

//                 <header className="post-header">
//                     <h2 className="post-title">{post.title}</h2>
//                 </header>

//                 <div
//                     className="post-body"
//                     dangerouslySetInnerHTML={{ __html: post.content }}
//                 />

//                 <footer className="post-footer">
//                 </footer>
//             </article>
//         </div>
//     );
// };

// export default BlogPostDetail;