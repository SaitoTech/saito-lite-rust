import React, { useState, useEffect, useRef } from 'react';
import SaitoOverlayReact from '../../../../lib/saito/ui/saito-overlay/saito-overlay.react';
import BlogPostDetail from './blog-post-detail';
import { Clock } from 'lucide-react';
import BlogEditor from './BlogEditor';


const BlogWidget = ({ app, mod, publicKey, topMargin }) => {
    const [posts, setPosts] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [showMainOverlay, setShowMainOverlay] = useState(true);
    const [showEditorOverlay, setShowEditorOverlay] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [authorImage, setAuthorImage] = useState("")

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const getPreviewText = (content) => {
        try {
            // Handle cases where content might already be HTML
            let textContent = '';
            if (typeof content === 'string') {
                // Try parsing as JSON first
                try {
                    const parsedContent = JSON.parse(content);
                    const temp = document.createElement('div');
                    temp.innerHTML = parsedContent;
                    textContent = temp.textContent || temp.innerText;
                } catch {
                    const temp = document.createElement('div');
                    temp.innerHTML = content;
                    textContent = temp.textContent || temp.innerText;
                }
            }

            const words = textContent.trim().split(/\s+/);
            const preview = words.slice(0, 15).join(' ');
            return words.length > 15 ? `${preview}...` : preview;
        } catch (error) {
            console.error('Error generating preview:', error);
            return 'Preview not available';
        }
    };

    const renderContent = (content) => {
        try {
            if (typeof content === 'string') {
                try {
                    // Try parsing as JSON first
                    return JSON.parse(content);
                } catch {
                    // If JSON parsing fails, return the content as is
                    return content;
                }
            }
            return content;
        } catch (error) {
            console.error('Error rendering content:', error);
            return '';
        }
    };


    useEffect(() => {
        mod.loadBlogPostTransactionsForWidget(publicKey, (posts) => {
            setPosts(posts);
        })

        setAuthorImage(app.keychain.returnIdenticon(publicKey));
    }, []);

    const handlePublish = async () => {
        if (!title.trim() || !content.trim()) {
            siteMessage("Please fill in all fields", 2000)
            return;
        }

        try {
            let timestamp = Date.now();

            await mod.createBlogPostTransaction({ title, content, tags: [], timestamp }, () => {
                setPosts((posts) => {
                    return [
                        {
                            title,
                            content,
                            timestamp
                        },
                        ...posts,

                    ]
                })
            });
            setShowEditorOverlay(false);
            setTitle('');
            setContent('');
        } catch (error) {
            console.error('Error publishing post:', error);
            app.connection.emit("saito-header-update-message", {
                msg: "Error publishing post",
                timeout: 2000
            });
        }
    };

    const handleReadMore = (post) => {
        setSelectedPost(post);
    };

    const handleCloseEditorOverlay = () => {
        setShowEditorOverlay(false);
        setTitle('');
        setContent('');
    };

    const handleCloseDetail = () => {
        setSelectedPost(null);
    };


    const handleEdit = (sig, newTitle, newContent) => {
        // Update the posts state with the edited content
        setPosts(currentPosts => 
            currentPosts.map(post => {
                if (post.sig === sig) {
                    return {
                        ...post,
                        title: newTitle,
                        content: newContent
                    };
                }
                return post;
            })
        );
        setSelectedPost(null);
    };

    const handleDelete = async (sig) => {
        try {
            setPosts(currentPosts => 
                currentPosts.filter(post => post.sig !== sig)
            );   
            setSelectedPost(null);
       
        } catch (error) {
            console.error('Error deleting post:', error);
            app.connection.emit("saito-header-update-message", {
                msg: "Error deleting post",
                timeout: 2000
            });
        }
    };

    const renderEditor = () => (
        <div className="blog-editor">
            <h2>New Blog Post</h2>
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Post Title"
                className="title-input"
            />
            <BlogEditor
                value={content}
                onEditorChange={(newContent) => setContent(newContent)}
            />

            <div className="editor-actions">
                <button
                    className="cancel-btn"
                    onClick={handleCloseEditorOverlay}
                >
                    Cancel
                </button>
                <button
                    className="publish-btn"
                    onClick={handlePublish}
                >
                    Publish
                </button>
            </div>
        </div>
    );

    let showNewPostBtn = publicKey === mod.publicKey
    console.log(showNewPostBtn, publicKey, mod.publicKey, "how far")
    const renderMainContent = () => (
        <div className="blog-widget" style={{ marginTop: topMargin ? "var(--saito-header-height)" : "" }}>
            <div className="blog-header">
                {showNewPostBtn && <button
                    className="blog-new-post-btn"
                    onClick={() => setShowEditorOverlay(true)}
                >
                    <i className="fa-solid fa-plus"></i>
                    New Post
                </button>}
            </div>

            <h4>Blog posts</h4>

            <div className="blog-posts">
                {posts.map((post, index) => (
                    <article key={post.sig || index} className="blog-post">
                        <h5 className="post-title">{post.title}</h5>
                        <div className="post-meta">
                            <span className="date">
                                <Clock size={16} />
                                <span>{formatDate(post.timestamp)}</span>
                            </span>
                        </div>
                        <div className="post-preview">
                            {getPreviewText(post.content)}
                        </div>
                        <div
                            className="post-content"
                            style={{ display: 'none' }}
                            dangerouslySetInnerHTML={{
                                __html: renderContent(post.content)
                            }}
                        />
                        <button className="read-more-btn" onClick={() => handleReadMore(post)}
                        >
                            Read More
                        </button>
                    </article>
                ))}

                {posts.length === 0 && (
                    <div className="no-posts">
                        <p>No blog posts yet.</p>
                    </div>
                )}
            </div>
        </div>
    );



    return (
        <>
            {renderMainContent()}
            <SaitoOverlayReact
                app={app}
                mod={mod}
                show={showEditorOverlay}
                onClose={handleCloseEditorOverlay}
                withCloseBox={true}
                clickBackdropToClose={true}
            >
                {renderEditor()}
            </SaitoOverlayReact>

            <SaitoOverlayReact
                app={app}
                mod={mod}
                show={selectedPost !== null}
                onClose={handleCloseDetail}
                withCloseBox={true}
                clickBackdropToClose={true}
            >
                {selectedPost && (

                    <BlogPostDetail
                        post={selectedPost}
                        onClose={handleCloseDetail}
                        app={app}
                        mod={mod}
                        publicKey={publicKey}
                        onedit={handleEdit}
                        ondelete={handleDelete}
                    />
                )}
            </SaitoOverlayReact>
        </>
    );
};

export default BlogWidget;



