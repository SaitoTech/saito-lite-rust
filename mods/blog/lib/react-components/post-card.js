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
                            <div className='saito-user single-line'> Published by <span style={{color: "var(--saito-primary)"}}>{app.keychain.returnUsername(post.publicKey)}</span> on November 23, 2024 </div>         
                        </div>
                    )}
                </div>
              
            </div>
        </div>
    );
};

export default PostCard