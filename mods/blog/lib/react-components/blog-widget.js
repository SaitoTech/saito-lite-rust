// BlogWidgetComponent.js
import React, { useState, useEffect, useRef } from 'react';
import SaitoOverlayReact from '../../../../lib/saito/ui/saito-overlay/saito-overlay.react';
import BlogPostDetail from './blog-post-detail';
import { Calendar, User, Clock } from 'lucide-react';


const BlogWidget = ({ app, mod, key }) => {
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
                    // Create a temporary div to parse HTML
                    const temp = document.createElement('div');
                    temp.innerHTML = parsedContent;
                    textContent = temp.textContent || temp.innerText;
                } catch {
                    // If JSON parsing fails, treat it as direct HTML
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


    // Sample blog posts array
    const samplePosts = [
        {
            title: "Getting Started with React",
            content: "<p>React is a powerful library for building user interfaces. It uses a component-based architecture that makes it easy to create reusable UI elements. Each component can maintain its own state and receive props from parent components.</p>"
        },
        {
            title: "Understanding Hooks",
            content: "<p>Hooks are a revolutionary feature in React that allow you to use state and other React features without writing class components. The most commonly used hooks are useState and useEffect.</p>"
        }
    ];

    useEffect(() => {
        const publicKey = mod.publicKey;
        // const handleBlogUpdate = (key, blogPosts) => {

        //     console.log(blogPosts, "blog update widget")
        //     if (key === publicKey) {

        //     }
        // };
        // app.connection.on('blog-update-widget', (key, blogPosts) => {
        //     console.log('blog-update-widget, inside')
        //     handleBlogUpdate(key, blogPosts)
        // } );

        mod.loadBlogTransactionsForWidget(mod.publicKey, (posts) => {
            console.log('loading my blog transaction for widget')
            setPosts(posts);
        })

        setAuthorImage(app.keychain.returnIdenticon(mod.publicKey));   
    }, []);

    const handlePublish = async () => {
        if (!title.trim() || !content.trim()) {
            app.connection.emit("saito-header-update-message", {
                msg: "Please fill in all fields",
                timeout: 2000
            });
            return;
        }

        try {
            let timestamp = Date.now();

            await mod.createBlogTransaction({ title, content, tags: [], timestamp }, () => {

                console.log('setting posts', posts)
                setPosts((posts) => {
                    return [
                        ...posts,
                        {
                            title,
                            content,
                            timestamp
                        }
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

    const renderMainContent = () => (
        <div className="blog-widget">
            <div className="blog-header">
                <button
                    className="blog-new-post-btn"
                    onClick={() => setShowEditorOverlay(true)}
                >
                    <i className="fa-solid fa-plus"></i>
                    New Post
                </button>
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

                {samplePosts.length === 0 && (
                    <div className="no-posts">
                        <p>No blog posts yet. Be the first to create one!</p>
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
                        publicKey={mod.publicKey}
                    />
                )}
            </SaitoOverlayReact>
        </>
    );
};

export default BlogWidget;


const BlogEditor = ({ value, onEditorChange }) => {
    const editorRef = useRef(null);

    useEffect(() => {
        // Load TinyMCE from CDN So I won't have to deal with API keys yet
        if (!window.tinymce) {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.7.0/tinymce.min.js';
            script.referrerPolicy = 'origin';
            document.head.appendChild(script);

            script.onload = () => initEditor();
        } else {
            initEditor();
        }

        return () => {
            // Cleanup
            if (window.tinymce) {
                window.tinymce.remove(editorRef.current);
            }
        };
    }, []);

    const initEditor = () => {
        window.tinymce.init({
            target: editorRef.current,
            height: 400,
            menubar: false,
            branding: false,
            promotion: false,
            plugins: [
                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                'insertdatetime', 'media', 'table', 'help', 'wordcount'
            ],
            toolbar: `undo redo | blocks | bold italic backcolor | \
                    alignleft aligncenter alignright alignjustify | \
                    bullist numlist outdent indent | removeformat | help`,
            content_style: 'body { color: var(--saito-font-color) !important, background: var(--saito-background-color) }',
            setup: (editor) => {
                editor.on('change', () => {
                    const content = editor.getContent();
                    onEditorChange(content);
                });

                // Set initial content if any
                if (value) {
                    editor.on('init', () => {
                        editor.setContent(value);
                    });
                }
            }
        });
    };

    return <textarea ref={editorRef} />;
};