import React from "react";

const PostCard = ({ post, index }) => {
    const isMultiline = post.title.length > 50;

    return (
        <div className="post-card">
            <div className="post-card-content">
                <div className="post-card-main">
                    <h4 className="post-card-title">
                        {post.title}
                    </h4>
                    {selectedUser === 'All' && (
                        <div className="post-card-meta">

                            {isMultiline ? <div className='saito-user single-line'> Published on {app.browser.prettifyTimeStamp(post.timestamp)} by {app.keychain.returnUsername(post.publicKey)}</div> : <div className={`saito-user saito-user-${post.publicKey} ${isMultiline ? 'single-line' : ''}`}
                                id={`saito-user-${post.publicKey}`}
                                data-id={post.publicKey}>
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
                                    Published on {app.browser.prettifyTimeStamp(post.timestamp)}
                                </div>
                            </div>}
                            <div className="engagement-stat" onClick={() => copyPostLinkToClipboard(post)}>
                                <i className='fa fa-arrow-up-from-bracket'></i>
                            </div>
                        </div>
                    )}
                </div>
                <div className="post-card-image">
                    <img
                        src={post.image? getImageUrl(post.image) : mod.returnImage()}
                        alt="Post preview"
                        className="preview-image"
                    />
                </div>
            </div>
        </div>
    );
};

export default PostCard