import React from 'react';
import { FileText } from 'lucide-react';

const NoPostsAvailable = ({ showModal, isCurrentUser }) => {
  return (
    <div className="no-posts-container">
      <div className="icon-circle">
        <FileText color="white" size={32} />
      </div>
      
      <h2 className="no-posts-title">
        No Posts Available
      </h2>
      
      <p className="no-posts-message">
        {isCurrentUser 
          ? "You haven't created any posts yet. Start sharing your thoughts with the community!"
          : "No posts found under your filter setttings. Check back later for updates."}
      </p>
      
      {/* {isCurrentUser && (
        <button onClick={showModal} className="create-post-button">
          Create New Post
        </button>
      )} */}
    </div>
  );
};

export default NoPostsAvailable;
