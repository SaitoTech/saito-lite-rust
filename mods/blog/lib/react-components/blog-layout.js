import React, { useState, useEffect, useRef } from 'react';
import {  ArrowRight } from 'lucide-react';
import PostModal from './post-modal';
import { samplePosts } from './sample-posts';
import BlogPost from './blog-post';
import { copyPostLinkToClipboard, getImageUrl, parseMarkdown } from '../utils';
import NoPostsAvailable from './NoPosts';





const USERS = ['All', 'StackTooDeep@saito'];



const BlogLayout = ({ app, mod, publicKey, post=null }) => {
    // console.log(app, mod, publicKey, post, "army")
    const [selectedUser, setSelectedUser] = useState('All');
    const [selectedPost, setSelectedPost] = useState(post);
    const [showPostModal, setShowPostModal] = useState(false);
    const [editingPost, setEditingPost] = useState(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [posts, setPosts] = useState([]);

    const createPreview = (content) => {
        const lines = content.split('\n');

        const firstTextLine = lines.find(line => {
            const trimmed = line.trim();
            if (!trimmed) return false;
            if (
                trimmed.startsWith('![') ||
                trimmed.includes('base64') ||
                trimmed.match(/^\[!\[.*?\]\(.*?\)\]\(.*?\)$/) ||
                trimmed.startsWith('<img') ||
                trimmed.startsWith('http') ||
                trimmed.startsWith('<iframe')
            ) return false;
            return true;
        }) || '';

        const cleanContent = firstTextLine.replace(/[#*`_~]/g, '').trim();
        const preview = cleanContent.slice(0, 59);
        return preview + (cleanContent.length > 59 ? '...' : '');
    };


   
    

    const filteredPosts = posts.filter(post =>
        selectedUser === 'All' || post.author === selectedUser
    );


    useEffect(() => {
        loadPosts();
    }, [publicKey]);

    const loadPosts = () => {
        mod.loadBlogPostTransactionsForWidget(publicKey || mod.publicKey, (loadedPosts) => {
            console.log('loading posts', loadedPosts)
            setPosts(loadedPosts);

            if (editingPost) {
                const updatedPost = loadedPosts.find(p => p.sig === editingPost.sig);
                if (updatedPost) {
                
                    setSelectedPost(updatedPost);
                }
            }


        });
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
           
            // setEditingPost(null);
            // setTimeout(() => {    
            //     setShowPostModal(false);
            //     loadPosts();
            // }, 2000)
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
                        value={selectedUser}
                        onChange={(e) => {
                            setSelectedUser(e.target.value)

                        }}
                        className="filter-select"
                    >
                        {USERS.map(user => (
                            <option key={user} value={user}>{user}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="center-column" style={{
                // width: selectedPost ? '768px' : undefined,
                maxWidth: selectedPost ? '900px': '100%',
                margin: selectedPost ? '0 auto' : undefined
            }}>
                {selectedPost ? (
                  <BlogPost app={app} mod={mod} post={selectedPost} publicKey={selectedPost.publicKey} />
                ) : (

                    <>
                        {selectedUser !== 'All' && (
                            <div className="user-header">
                                <div className="user-header-content">
                                    <div className={`saito-user saito-user-${publicKey}`}
                                        id={`saito-user-${publicKey}`}
                                        data-id={publicKey}
                                        data-disable="false">
                                        <div className="saito-identicon-box">
                                            <img className="saito-identicon"
                                                src={app.keychain.returnIdenticon(publicKey)}
                                                alt="user identicon" />
                                        </div>
                                        <div className="saito-address treated"
                                            data-id={publicKey}>
                                            {app.keychain.returnUsername(publicKey)}
                                        </div>
                                        <div className="saito-userline">
                                           Welcome to my blog where i share my ideas
                                        </div>
                                    </div>
                                    {/* <h5>{app.keychain.returnUsername(publicKey)}'s blog</h5> */}
                                    {/* <h5>StackTooDeep@saito's blog</h5> */}
                                </div>
                                <div className="user-header-divider"></div>
                            </div>
                        )}

                        <div className="posts-list">
                            {filteredPosts.map((post, index) => (
                                <div
                                    key={post.sig || index}
                                    className="post-card"
                                >
                                    <div className="post-card-content">
                                        <div className="post-card-main">
                                            <h4 className="post-card-title">{post.title}</h4>
                                            {selectedUser === 'All' && (
                                                <div className="post-card-meta">
                                                    <div className={`saito-user saito-user-${post.publicKey}`}
                                                        id={`saito-user-${post.publicKey}`}
                                                        data-id={post.publicKey}
                                                        data-disable="false">
                                                        <div className="saito-identicon-box">
                                                            <img className="saito-identicon"
                                                                src={app.keychain.returnIdenticon(post.publicKey)}
                                                                alt="user identicon" />
                                                        </div>
                                                        <div className="saito-address treated"
                                                            data-id={post.publicKey}>
                                                            {app.keychain.returnUsername(post.publicKey)}
                                                        </div>
                                                        <div className="saito-userline">
                                                           {/* Published on November 15 2024, 3:41am */}
                                                           Published on {app.browser.prettifyTimeStamp(post.timestamp)}
                                                        </div>
                                                    </div>
                                                    <div className="engagement-stat" onClick={() => copyPostLinkToClipboard(post)}>
                                                        <i className='fa fa-arrow-up-from-bracket'></i>
                                                    </div>
                                                </div>
                                            )}
                                            {selectedUser !== 'All' && <div className="post-published-div" style={{
                                                display: 'flex',
                                                justifyContent: selectedPost ? 'center' : 'space-between',
                                                position: 'relative'
                                            }}><div className="post-date">
                                                   Published on {app.browser.prettifyTimeStamp(post.timestamp)}
                                                   {/* Published on November 15 2024, 3:41am */}
                                                </div>  <div  className="engagement-stat" onClick={() => copyPostLinkToClipboard(post)}>
                                                    <i className='fa fa-arrow-up-from-bracket'></i>
                                                    {/* <span>{selectedPost.shares}</span> */}
                                                </div>  </div>}
                                            <div className="post-card-preview markdown-content"
                                                dangerouslySetInnerHTML={{
                                                    __html: parseMarkdown(createPreview(post.content))
                                                }}
                                            />
                                            <div className="post-card-footer">
                                                <a
                                                    className="read-more-button"
                                                    onClick={() => {
                                                        app.connection.emit('saito-header-replace-logo', handleBackClick);
                                                        setSelectedPost(post);
                                                        const url = new URL(window.location);
                                                        url.searchParams.set('public_key', post.publicKey);
                                                        url.searchParams.set('tx_id', post.sig);
                                                        window.history.pushState({}, '', url);
                                                    }}
                                                >
                                                    Read More
                                                    <ArrowRight className="icon" />
                                                </a>
                                            </div>
                                        </div>
                                        <div className="post-card-image">
                                            <img
                                                src={getImageUrl(post.image)}
                                                alt="Post preview"
                                                className="preview-image"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {
                                filteredPosts.length === 0 && <NoPostsAvailable showModal={()=> setShowPostModal(true)}/>
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