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
    const [posts, setPosts] = useState([])
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const latestPostRef = useRef(null);

    const filteredPosts = posts.filter(post =>
        selectedUser.username === 'All' || post.publicKey === selectedUser.publicKey
    );

    // Function to merge new posts with existing ones
    const mergePosts = (existingPosts, newPosts) => {
        const combined = [...existingPosts];

        newPosts.forEach(newPost => {
            const existingIndex = combined.findIndex(p => p.sig === newPost.sig);
            if (existingIndex === -1) {
                combined.push(newPost);
            } else {
                combined[existingIndex] = newPost;
            }
        });

        return combined.sort((a, b) => b.timestamp - a.timestamp);
    };

    const loadPosts = async (useCache = false) => {
        setIsLoadingMore(true);
        const latestTimestamp = latestPostRef.current?.timestamp;

        if (selectedUser.username === 'All') {
            const userKeys = USERS
                .filter(user => user.username !== 'All' && user.publicKey)
                .map(user => user.publicKey);


            if (useCache) {
                const cachedPosts = mod.postsCache?.allPosts || [];
                if (cachedPosts.length > 0) {
                    setPosts(cachedPosts);
                    latestPostRef.current = cachedPosts[0];
                }
            }


            mod.loadAllPosts(userKeys, (loadedPosts) => {
                setPosts(prevPosts => {
                    const mergedPosts = mergePosts(prevPosts, loadedPosts);
                    if (mergedPosts.length > 0) {
                        latestPostRef.current = mergedPosts[0];
                    }
                    return mergedPosts;
                });
                setIsLoadingMore(false);

                if (editingPost) {
                    const updatedPost = loadedPosts.find(p => p.sig === editingPost.sig);
                    if (updatedPost) {
                        setSelectedPost(updatedPost);
                    }
                }
            }, useCache);
        } else {

            if (useCache) {
                const cachedUserPosts = mod.postsCache?.byUser.get(selectedUser.publicKey) || [];
                if (cachedUserPosts.length > 0) {
                    setPosts(cachedUserPosts);
                    latestPostRef.current = cachedUserPosts[0];
                }
            }

            // Then load new posts
            mod.loadBlogPostForUser(selectedUser.publicKey, (loadedPosts) => {
                setPosts(prevPosts => {
                    const mergedPosts = mergePosts(prevPosts, loadedPosts);
                    if (mergedPosts.length > 0) {
                        latestPostRef.current = mergedPosts[0];
                    }
                    return mergedPosts;
                });
                setIsLoadingMore(false);

                if (editingPost) {
                    const updatedPost = loadedPosts.find(p => p.sig === editingPost.sig);
                    if (updatedPost) {
                        setSelectedPost(updatedPost);
                    }
                }
            }, useCache);
        }
    };

    useEffect(() => {
        loadPosts(false);
    }, [selectedUser, publicKey]);


    const refreshPosts = () => {
        loadPosts(false);
    };

    const handlePostSubmit = async (postData) => {
        try {
            setIsSubmitting(true);
            if (editingPost) {
                await mod.updateBlogPostTransaction(
                    editingPost.sig,
                    postData.title,
                    postData.content
                );
            } else {
                await mod.createBlogPostTransaction(
                    {
                        title: postData.title,
                        content: postData.content,
                        tags: [],
                        image: postData.image,
                        imageUrl: postData.imageUrl,
                        timestamp: Date.now(),
                    },
                    () => {
                        siteMessage("Submitting blog post");
                        setTimeout(() => {
                            setShowPostModal(false);
                            refreshPosts(); // Refresh posts after new post
                        }, 2000);
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
                    <button onClick={() => {
                        setShowPostModal(true)
                          app.connection.emit('saito-header-replace-logo', handleCloseModal);
                    }
                    }>New Post</button>
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

            {!showPostModal && <div id="saito-floating-menu" class="saito-floating-container">
                <div  onClick={()=>{
                    setShowPostModal(true)
                    app.connection.emit('saito-header-replace-logo', handleCloseModal);
                }
                } class="saito-floating-plus-btn" id="saito-floating-plus-btn">
                    <i class="fa-solid fa-plus"></i>
                </div>
            </div>}
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
                            {isLoadingMore && (
                                <div className="loading-indicator">Loading more posts...</div>
                            )}
                            {filteredPosts.length === 0 && !isLoadingMore && (
                                <NoPostsAvailable isCurrentUser={selectedUser.publicKey === mod.publicKey || selectedUser.username === 'All'} showModal={() =>{ 
                                    setShowPostModal(true)
                                    app.connection.emit('saito-header-replace-logo', handleCloseModal);
                                }
                                    
                                } />
                            )}

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