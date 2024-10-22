// BlogWidgetComponent.js
import React, { useState, useEffect, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import SaitoOverlayReact from '../../../../lib/saito/ui/saito-overlay/saito-overlay.react';

const BlogWidget = ({ app, mod }) => {
    const [posts, setPosts] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [showMainOverlay, setShowMainOverlay] = useState(true);
    const [showEditorOverlay, setShowEditorOverlay] = useState(false);

    useEffect(() => {
        const publicKey = mod.publicKey;
        const handleBlogUpdate = (key, blogPosts) => {
            if (key === publicKey) {
                setPosts(blogPosts);
            }
        };
        app.connection.on('blog-update-dom', handleBlogUpdate);

        return () => {
            app.connection.off('blog-update-dom', handleBlogUpdate);
        };
    }, [mod.publicKey]);

    const handlePublish = async () => {
        if (!title.trim() || !content.trim()) {
            app.connection.emit("saito-header-update-message", {
                msg: "Please fill in all fields",
                timeout: 2000
            });
            return;
        }

        try {
            await mod.createBlogTransaction({title, content, tags: [], timestamp:Date.now()});
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

    const handleCloseEditorOverlay = () => {
        setShowEditorOverlay(false);
        setTitle('');
        setContent('');
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

            <h4> 
                Blog posts
            </h4>

            <div className="blog-posts">
                {posts.map((post, index) => (
                    <article key={post.sig || index} className="blog-post">
                        <h3>{post.title}</h3>
                        <div className="post-meta">
                            <span className="date">
                                {new Date(post.timestamp).toLocaleString()}
                            </span>
                        </div>
                        <div
                            className="post-content"
                            dangerouslySetInnerHTML={{
                                __html: JSON.parse(post.content)
                            }}
                        />
                    </article>
                ))}

                {posts.length === 0 && (
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