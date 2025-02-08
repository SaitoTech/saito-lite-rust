import React from "react";
import { getImageUrl } from "../utils";


const PostCard = ({ app, mod, post, index, onClick, selectedUser }) => {
    const isMultiline = post.title.length > 50;
    let source = mod.returnImage()
    if(post.image){
        source = getImageUrl(post.image)
    }else if(post.imageUrl){
        source = post.imageUrl;
    }
    let date = app.browser.formatDate(post.timestamp)
    return (
        <div key={index} onClick={onClick} className="post-card">
            <div  className="post-card-content">
            <div className="post-card-image">
                    <img
                        src={source}
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
                            <div className='saito-user single-line'> Published by <span style={{color: "var(--saito-primary)"}}>{app.keychain.returnUsername(post.publicKey)}</span> on {date.month} {date.day}, {date.year} </div>         
                        </div>
                    )}
                </div>
              
            </div>
        </div>
    );
};

export default PostCard