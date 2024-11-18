import React from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import { getImageUrl, parseMarkdown } from '../utils';

const BlogPost = ({app, mod, post, publicKey}) => {
    return (
        <div className="post-view">
            <article className="post-content">
               
                
                <div className="post-content-body">
                <header className="post-header">
                        <h1 className="post-title">{post.title}</h1>
                    </header>
                    <div className="post-meta-header">        
                        <div className={`saito-user saito-user-${publicKey}`}
                            id={`saito-user-${post.publicKey}`}
                            data-id={post.publicKey}
                            data-disable="false">
                            <div className="saito-identicon-box">
                                <img className="saito-identicon"
                                    src={app.keychain.returnIdenticon(publicKey)}
                                    alt="user identicon" />
                            </div>
                            <div className="saito-address treated"
                                data-id={post.publicKey}>
                                {app.keychain.returnUsername(post.publicKey)}
                            </div>
                            <div className="saito-userline">
                               Published on {app.browser.prettifyTimeStamp(post.timestamp)}
                            </div>
                        </div>
        
                        <div className="engagement-stat" onClick={() => ""}>
                            <i className='fa fa-arrow-up-from-bracket'></i>
                        </div>
                    </div>

                  
                    
                    {post.image && (
                    <div className="post-image-container">
                        <img 
                            src={getImageUrl(post.image)} 
                            alt={post.title}
                            className="post-header-image"
                        />
                    </div>
                )}
                    <div className="post-body markdown-content"
                        dangerouslySetInnerHTML={{
                            __html: parseMarkdown(post.content)
                        }} 
                    />
        
                    {/* <div className="post-footer">
                        <div className="engagement-stats">
                            <div className="engagement-stat">
                                <Heart className="icon" />
                                <span>{post.likes}</span>
                            </div>
                            <div className="engagement-stat">
                                <MessageCircle className="icon" />
                                <span>{post.comments}</span>
                            </div>
                            <div className="engagement-stat" onClick={() => ""}>
                                <i className='fa fa-arrow-up-from-bracket'></i>
                            </div>
                        </div>
                    </div> */}
                </div>
            </article>
        </div>
    );
};

export default BlogPost;