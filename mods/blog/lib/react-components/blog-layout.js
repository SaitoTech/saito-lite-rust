import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import PostModal from './post-modal';
import { samplePosts } from './sample-posts';
import BlogPost from './blog-post';
import NoPostsAvailable from './NoPosts';
import PostCard from './post-card';
import { initializeUsers } from '../utils';
import { ArrowUp, ChevronUp, MoveUp, ChevronsUp } from 'lucide-react';






const BlogLayout = ({ app, mod, publicKey, post = null }) => {
    const USERS = initializeUsers(app, mod);
    const [selectedUser, setSelectedUser] = useState(USERS[0]);
    const [selectedPost, setSelectedPost] = useState(post);
    const [showPostModal, setShowPostModal] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [posts, setPosts] = useState([])
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const latestPostRef = useRef(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const loaderRef = useRef(null);
    const limit = 40


    const loadMorePosts = async () => {
        if (isLoadingMore || !hasMore) return;
        setIsLoadingMore(true);

        const latestPost = posts[posts.length - 1];
        const earliestTimestamp = latestPost?.timestamp || Date.now();

        let peers = await mod.app.network.getPeers();
        let peer = peers[0];

        try {
            switch (selectedUser.publicKey) {
                case 'all':
                    await new Promise((resolve) => {
                        mod.app.storage.loadTransactions(
                            {
                                field1: 'Blog',
                                limit,
                                updated_earlier_than: earliestTimestamp
                            },
                            (txs) => {
                                if (txs.length === 0) {
                                    setHasMore(false);
                                    return resolve();
                                }

                                const filteredTxs = mod.filterBlogPosts(txs);
                                const newPosts = mod.convertTransactionsToPosts(filteredTxs);

                                if (newPosts.length > 0) {
                                    setPosts(prevPosts => mergePosts(prevPosts, newPosts));
                                } else {
                                    setHasMore(false);
                                }
                                resolve();
                            },
                            peer
                        );
                    });
                    break;

                case 'contacts':
                    const contactKeys = app.keychain.returnKeys().map(k => k.publicKey);
                    await new Promise((resolve) => {
                        mod.app.storage.loadTransactions(
                            {
                                field1: 'Blog',
                                limit: limit * 2,
                                updated_earlier_than: earliestTimestamp
                            },
                            (txs) => {
                                if (txs.length === 0) {
                                    setHasMore(false);
                                    return resolve();
                                }

                                const filteredTxs = mod.filterBlogPosts(txs)
                                    .filter(tx => contactKeys.includes(tx.from[0].publicKey));
                                const newPosts = mod.convertTransactionsToPosts(filteredTxs);

                                if (newPosts.length > 0) {
                                    setPosts(prevPosts => mergePosts(prevPosts, newPosts));
                                } else {
                                    setHasMore(false);
                                }
                                resolve();
                            },
                            peer
                        );
                    });
                    break;

                default:
                    // My posts
                    await new Promise((resolve) => {
                        mod.app.storage.loadTransactions(
                            {
                                field1: 'Blog',
                                field2: mod.publicKey,
                                limit,
                                updated_earlier_than: earliestTimestamp
                            },
                            (txs) => {
                                if (txs.length === 0) {
                                    setHasMore(false);
                                    return resolve();
                                }

                                const filteredTxs = mod.filterBlogPosts(txs);
                                const newPosts = mod.convertTransactionsToPosts(filteredTxs);

                                if (newPosts.length > 0) {
                                    setPosts(prevPosts => mergePosts(prevPosts, newPosts));
                                } else {
                                    setHasMore(false);
                                }
                                resolve();
                            },
                            peer
                        );
                    });
                    break;
            }
        } catch (error) {
            console.error('Error loading more posts:', error);
            setHasMore(false);
        } finally {
            setIsLoadingMore(false);
        }
    };

    const handleScroll = async () => {
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
    }

    const filteredPosts = posts.filter(post => {
        switch (selectedUser.publicKey) {
            case 'all':
                return true;
            case 'contacts':

                const contactKeys = app.keychain.returnKeys().map(k => k.publicKey);
                return contactKeys.includes(post.publicKey);
            default:
                return post.publicKey === mod.publicKey;
        }
    });

    const mergePosts = (existingPosts, newPosts) => {
        const combined = existingPosts.filter(post =>
            !mod.postsCache.deletedPosts.has(post.sig)
        );

        newPosts.forEach(newPost => {
            if (!mod.postsCache.deletedPosts.has(newPost.sig)) {
                const existingIndex = combined.findIndex(p => p.sig === newPost.sig);
                if (existingIndex === -1) {
                    combined.push(newPost);
                } else {
                    combined[existingIndex] = newPost;
                }
            }
        });

        return combined.sort((a, b) => b.timestamp - a.timestamp);
    };
    const loadPosts = async (useCache = false) => {
        setIsLoadingMore(true);
        // setPage(1);
        // setHasMore(true);
        // setPosts([]);

        switch (selectedUser.publicKey) {
            case 'all':
                if (useCache) {
                    const cachedPosts = mod.postsCache?.allPosts || [];
                    if (cachedPosts.length > 0) {
                        setPosts(cachedPosts);
                        latestPostRef.current = cachedPosts[0];
                    }
                }
                mod.loadAllBlogPosts((loadedPosts) => {
                    setPosts(prevPosts => {
                        const mergedPosts = mergePosts(prevPosts, loadedPosts);
                        if (mergedPosts.length > 0) {
                            latestPostRef.current = mergedPosts[0];
                        }
                        return mergedPosts;
                    });
                    setIsLoadingMore(false);
                }, useCache);
                break;
            case 'contacts':
                // Get only contact keys
                const contactKeys = app.keychain.returnKeys().map(k => k.publicKey);

                if (useCache) {
                    const cachedContactPosts = mod.postsCache?.allPosts?.filter(post =>
                        contactKeys.includes(post.publicKey)
                    ) || [];
                    if (cachedContactPosts.length > 0) {
                        setPosts(cachedContactPosts);
                        latestPostRef.current = cachedContactPosts[0];
                    }
                }

                mod.loadAllPostsFromKeys(contactKeys, (loadedPosts) => {
                    setPosts(prevPosts => {
                        const mergedPosts = mergePosts(prevPosts, loadedPosts);
                        if (mergedPosts.length > 0) {
                            latestPostRef.current = mergedPosts[0];
                        }
                        return mergedPosts;
                    });
                    setIsLoadingMore(false);
                }, useCache);
                break;

            default:
                if (useCache) {
                    const cachedUserPosts = mod.postsCache?.byUser.get(mod.publicKey) || [];
                    if (cachedUserPosts.length > 0) {
                        setPosts(cachedUserPosts);
                        latestPostRef.current = cachedUserPosts[0];
                    }
                }

                mod.loadBlogPostForUser(mod.publicKey, (loadedPosts) => {
                    setPosts(prevPosts => {
                        const mergedPosts = mergePosts(prevPosts, loadedPosts);
                        if (mergedPosts.length > 0) {
                            latestPostRef.current = mergedPosts[0];
                        }
                        return mergedPosts;
                    });
                    setIsLoadingMore(false);
                }, useCache);
                break;
        }
    };

    const handleDeleteBlogPost = (sig) => {
        mod.deleteBlogPost(sig, () => {
            if (document.querySelector('.saito-back-button')) {
                document.querySelector('.saito-back-button').remove();
            }
            handleBackClick()
        })
    }



    useEffect(() => {
        loadPosts(false);
    }, [selectedUser, publicKey]);


    useEffect(() => {
        const currentLoaderRef = loaderRef.current;
        if (!hasMore || isLoadingMore) return;

        const observerCallback = (entries) => {
            const [entry] = entries;
            if (entry.isIntersecting) {
                loadMorePosts();
            }
        };
        const observer = new IntersectionObserver(observerCallback, {
            root: null,
            rootMargin: '100px',
            threshold: 0.1
        });
        if (currentLoaderRef) {
            observer.observe(currentLoaderRef);
        }
        return () => {
            if (currentLoaderRef) {
                observer.unobserve(currentLoaderRef);
            }
            observer.disconnect();
        };
    }, [hasMore, isLoadingMore]);



    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 300);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
    };
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
                    postData.content,
                    postData.tags,
                    postData.image,
                    postData.imageUrl,
                    () => {
                        setShowPostModal(false);
                        refreshPosts();
                        if (document.querySelector('.saito-back-button')) {
                            document.querySelector('.saito-back-button').remove();
                        }
                        handleBackClick()
                    }

                );
            } else {
                siteMessage("Submitting blog post");
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
                        setShowPostModal(false);
                        refreshPosts();
                        if (document.querySelector('.saito-back-button')) {
                            document.querySelector('.saito-back-button').remove();
                        }
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
        app.connection.emit('saito-header-replace-logo', handleBackClick);
        setShowPostModal(true);
    };



    const handleBackClick = () => {
        setShowPostModal(false);
        setEditingPost(null);
        setSelectedPost(null);
        const url = new URL(window.location);
        url.searchParams.delete('public_key');
        url.searchParams.delete('tx_id');
        window.history.pushState({}, '', url);
        setTimeout(() => {
            refreshPosts()
        }, 1000)

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
                    <label className="filter-label">Filter by</label>
                    <select
                        value={selectedUser.username}
                        onChange={(e) => {
                            const selected = USERS.find(user => user.username === e.target.value);
                            setSelectedUser(selected);
                        }}
                    >
                        {USERS.map(user => (
                            <option key={user.publicKey} value={user.username}>
                                {user.username}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="center-column" style={{
                maxWidth: selectedPost ? '900px' : '100%',
                margin: selectedPost ? '0 auto' : undefined
            }}>

                {!showPostModal && <div id="saito-floating-menu" class="saito-floating-container">
                    <div onClick={() => {
                        setShowPostModal(true)
                        app.connection.emit('saito-header-replace-logo', handleCloseModal);
                    }
                    } class="saito-floating-plus-btn" id="saito-floating-plus-btn">
                        <i class="fa-solid fa-plus"></i>
                    </div>
                </div>}
                {selectedPost ? (
                    <BlogPost app={app} mod={mod} post={selectedPost} publicKey={selectedPost.publicKey} onEditClick={handleEditClick} onDeleteClick={handleDeleteBlogPost} />
                ) : (
                    <>
                        {selectedUser.username !== 'All' && (
                            <></>
                        )}

                        <div className="posts-list">
                            {filteredPosts.map((post, index) => (
                                <PostCard key={post.sig} selectedUser={selectedUser} app={app} mod={mod} index={index} post={post} onClick={() => {
                                    app.connection.emit('saito-header-replace-logo', handleBackClick);
                                    setSelectedPost(post);
                                    scrollToTop()
                                    const url = new URL(window.location);
                                    url.searchParams.set('public_key', post.publicKey);
                                    url.searchParams.set('tx_id', post.sig);
                                    window.history.pushState({}, '', url);
                                }} />
                            ))}
                            {hasMore && (
                                <div ref={loaderRef} className="loading-indicator">
                                    {isLoadingMore && <>
                                        <div>
                                            <div className='saito-loader'> </div>
                                        </div>
                                    </>}
                                </div>
                            )}

                            {!hasMore && filteredPosts.length > 0 && (
                                <div style={{ textAlign: 'center' }} className="end-message">No more posts to load</div>
                            )}
                            {filteredPosts.length === 0 && !isLoadingMore && (
                                <NoPostsAvailable isCurrentUser={selectedUser.publicKey === mod.publicKey || selectedUser.username === 'All'} showModal={() => {
                                    setShowPostModal(true)
                                    app.connection.emit('saito-header-replace-logo', handleCloseModal);
                                }

                                } />
                            )}

                        </div>
                    </>
                )}
                {/* {showScrollTop && ( */}
                <div
                    onClick={() => {
                        scrollToTop()
                    }}
                    className='scroll-button'
                >
                    <ArrowUp size={30} />
                </div>
                {/* )} */}
            </div>
            {showPostModal && editingPost && (
                <PostModal
                    post={editingPost}
                    app={app}
                    mod={mod}
                    onClose={handleCloseModal}
                    onSubmit={handlePostSubmit}
                    isSubmitting={isSubmitting}
                />
            )}
            {showPostModal && !editingPost && (
                <PostModal
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
