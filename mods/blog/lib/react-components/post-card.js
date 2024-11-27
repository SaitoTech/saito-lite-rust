import React from "react";
import { copyPostLinkToClipboard, getImageUrl } from "../utils";


const PostCard = ({ app, mod, post, index, onClick, selectedUser }) => {
    const isMultiline = post.title.length > 50;
    return (
        <div key={index} onClick={onClick} className="post-card">
            <div  className="post-card-content">
            <div className="post-card-image">
                    <img
                        src={post.image? getImageUrl(post.image) : mod.returnImage()}
                        alt="Post preview"
                        className="preview-image"
                    />
                </div>
                <div className="post-card-main">
                    <h4 className="post-card-title">
                        {post.title}
                    </h4>
                    {selectedUser.username && (
                        <div className="post-card-meta">

                            {/* {isMultiline ? <div className='saito-user single-line'> Published on {app.browser.prettifyTimeStamp(post.timestamp)} by {app.keychain.returnUsername(post.publicKey)}</div> : <div className={`saito-user saito-user-${post.publicKey} ${isMultiline ? 'single-line' : ''}`}
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
                            </div>} */}
                            <div className='saito-user single-line'> Published by StackTooDeep@saito on November 23, 2024 </div> 
                            {/* <div className="engagement-stat" onClick={() => copyPostLinkToClipboard(post)}>
                                <i className='fa fa-arrow-up-from-bracket'></i>
                            </div> */}
                        </div>
                    )}
                </div>
              
            </div>
        </div>
    );
};

export default PostCard