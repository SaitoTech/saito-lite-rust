import React from 'react';
import { copyPostLinkToClipboard, getImageUrl, parseMarkdown } from '../utils';
import { Pencil, Trash2 } from 'lucide-react';

const BlogPost = ({ app, mod, post, publicKey, onEditClick, onDeleteClick }) => {


    let source = ""
    if (post.image) {
        source = getImageUrl(post.image)
    } else if (post.imageUrl) {
        source = post.imageUrl;
    }

    let date = app.browser.formatDate(post.timestamp)
    return (
        <div className="post-view">
            <article className="post-content">

                <div className="post-content-body">
                    {post.publicKey === mod.publicKey && <div className="post-actions">
                        <div className="action-button">

                            <Pencil onClick={() => {
                                onEditClick(post)
                            }
                            }

                                size={20}
                            />

                        </div>
                        <div className="action-button">
                            <Trash2 size={20} onClick={async () => {
                                let confirm = await sconfirm("Are you are sure you want to delete?")
                                if (confirm) {
                                    onDeleteClick(post.sig)
                                }

                            }} />
                        </div>
                    </div>}
                    <header className="post-header">
                        <h4 className="post-title">{post.title}</h4>

                        <p className='byline'>
                            Published by <span style={{ color: "var(--saito-primary)" }}>{app.keychain.returnUsername(post.publicKey)}</span> on {date.month} {date.day}, {date.year}
                        </p>
                    </header>
                    {source && (
                        <div className="post-image-container">
                            <img
                                src={source}
                                alt={post.title}
                                className="post-header-image"
                            />
                        </div>
                    )}
                    <div className="post-body richtext-preview richtext-content"
                        dangerouslySetInnerHTML={{
                            __html: parseMarkdown(post.content)
                        }}
                    />

                </div>
            </article>
        </div>
    );
};

export default BlogPost;