import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import PostModal from './post-modal';
import { samplePosts } from './sample-posts';
import BlogPost from './blog-post';
import NoPostsAvailable from './NoPosts';
import PostCard from './post-card';
import { initializeUsers } from '../utils';






const BlogLayout = ({ app, mod, publicKey, post = null }) => {
    const USERS = initializeUsers(app, mod);
    const [selectedUser, setSelectedUser] = useState(USERS[0]);
    const [selectedPost, setSelectedPost] = useState(post);
    const [showPostModal, setShowPostModal] = useState(false);
    const [editingPost, setEditingPost] = useState(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [posts, setPosts] = useState(samplePosts);


    const filteredPosts = posts.filter(post =>
        selectedUser.username === 'All' || post.publicKey === selectedUser.publicKey
    );


    useEffect(() => {
        loadPosts();
    }, [selectedUser, publicKey]);


    const loadPosts = () => {
        if (selectedUser.username === 'All') {
            const userKeys = USERS
                .filter(user => user.username !== 'All' && user.publicKey)
                .map(user => user.publicKey);
         
            mod.loadAllPosts(userKeys, (loadedPosts) => {
                setPosts(loadedPosts);
                if (editingPost) {
                    const updatedPost = loadedPosts.find(p => p.sig === editingPost.sig);
                    if (updatedPost) {
                        setSelectedPost(updatedPost);
                    }
                }
            });
        } else {
            mod.loadBlogPostForUser(selectedUser.publicKey, (loadedPosts) => {
                setPosts(loadedPosts);
                if (editingPost) {
                    const updatedPost = loadedPosts.find(p => p.sig === editingPost.sig);
                    if (updatedPost) {
                        setSelectedPost(updatedPost);
                    }
                }
            });
        }
    };



    const handlePostSubmit = async (postData) => {
        try {
            setIsSubmitting(true);
            if (editingPost) {
                // Handle edit
                await mod.updateBlogPostTransaction(
                    editingPost.sig,
                    postData.title,
                    postData.content
                );
            } else {
                // Handle create
                await mod.createBlogPostTransaction(
                    {
                        title: postData.title,
                        content: postData.content,
                        tags: [],
                        image: postData.image,
                        timestamp: Date.now()
                    },
                    () => {
                        // Callback after successful post creation
                        siteMessage("Submitting blog post")
                        setTimeout(() => {
                            setShowPostModal(false);

                            loadPosts();
                        }, 2000)
                        // Reload posts to show the new one
                    }
                );
            }


        } catch (error) {
            console.error("Error saving post:", error);
            alert("Failed to save post. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCloseModal = () => {
        setShowPostModal(false);
        setEditingPost(null);
    };

    const handleEditClick = (post) => {
        setEditingPost(post);
        setShowPostModal(true);
    };

    const handleBackClick = () => {
        setSelectedPost(null);
        const url = new URL(window.location);
        url.searchParams.delete('public_key');
        url.searchParams.delete('tx_id');
        window.history.pushState({}, '', url);
    };

    return (
        <div className="layout" style={{
            display: 'flex',
            justifyContent: selectedPost ? 'center' : 'flex-start',
            position: 'relative'
        }}>
            <div className="left-column" style={{
                display: selectedPost ? 'none' : 'block',
                position: selectedPost ? 'absolute' : 'relative',
                left: 0
            }}>
                <div className="new-post-container">
                    <button onClick={() => setShowPostModal(true)}>New Post</button>
                </div>
                <div className="filter-container">
                    <label className="filter-label">Filter by Author</label>
                    <select
                        value={selectedUser.username}
                        onChange={(e) => {
                            const selected = USERS.find(user => user.username === e.target.value);
                            setSelectedUser(selected);
                        }}
                    >
                        {USERS.map(user => (
                            <option key={user.publicKey} value={user.username}>{user.username}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="center-column" style={{
                maxWidth: selectedPost ? '900px' : '100%',
                margin: selectedPost ? '0 auto' : undefined
            }}>
                {selectedPost ? (
                    <BlogPost app={app} mod={mod} post={selectedPost} publicKey={selectedPost.publicKey} />
                ) : (
                    <>
                        {selectedUser.username !== 'All' && (
                            <></>
                        )}

                        <div className="posts-list">
                            {filteredPosts.map((post, index) => (
                                <PostCard selectedUser={selectedUser} app={app} mod={mod} index={index} post={post} onClick={() => {
                                    app.connection.emit('saito-header-replace-logo', handleBackClick);
                                    setSelectedPost(post);
                                    const url = new URL(window.location);
                                    url.searchParams.set('public_key', post.publicKey);
                                    url.searchParams.set('tx_id', post.sig);
                                    window.history.pushState({}, '', url);
                                }} />
                            ))}
                            {
                                filteredPosts.length === 0 && <NoPostsAvailable showModal={() => setShowPostModal(true)} />
                            }
                        </div>
                    </>
                )}
            </div>
            {showPostModal && (
                <PostModal
                    post={editingPost}
                    app={app}
                    mod={mod}
                    onClose={handleCloseModal}
                    onSubmit={handlePostSubmit}
                    isSubmitting={isSubmitting}
                />
            )}
        </div>
    );
};

export default BlogLayout;