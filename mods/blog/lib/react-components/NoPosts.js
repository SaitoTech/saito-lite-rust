import React from 'react';
import { FileText } from 'lucide-react';


const NoPostsAvailable = ({ showModal }) => {
  return (
    <div className="no-posts-container">
      <div className="icon-circle">
        <FileText color="white" size={32} />
      </div>
      <h2 className="no-posts-title">
        No Posts Available
      </h2>
      <p className="no-posts-message">
        There are no posts at the moment. Please check back later or create a new post.
      </p>
      <button 
        className="create-post-button"
        onClick={showModal}
      >
        Create New Post
      </button>
    </div>
  );
};

export default NoPostsAvailable;