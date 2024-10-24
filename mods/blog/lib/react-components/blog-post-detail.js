import React, { useState } from 'react';
import { Calendar, User, Clock } from 'lucide-react';

const BlogPostDetail = ({ post, app, mod, publicKey,  }) => {

    
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

    return (
        <div className="blog-post-detail">
            <article className="blog-post-content">
                {/* Author Info */}
                <div className="author-info">
                    <div className="author-image">
                        <img src={app.keychain.returnIdenticon(publicKey)} alt={"Author"} />
                    </div>
                    <div className="author-details">
                        <h5 className="author-name">
                            {app.keychain.returnUsername(publicKey)}
                        </h5>
                        <div className="meta-item">
                            <Clock size={16} />
                            <span>{formatDate(post.timestamp)}</span>
                        </div>
                    </div>
                </div>

                {/* Header */}
                <header className="post-header">
                    <h2 className="post-title">{post.title}</h2>
                </header>

                {/* Content */}
                <div 
                    className="post-body"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* Footer */}
                <footer className="post-footer">
                </footer>
            </article>
        </div>
    );
};

export default BlogPostDetail;