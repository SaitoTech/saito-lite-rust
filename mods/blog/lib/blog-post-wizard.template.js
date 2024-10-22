
const BlogPostWizardTemplate = () => {
    return `
      <div class="blog-post-wizard" id="blog-post-wizard">
        <div class="blog-wizard-header">
          <h2 class="wizard-title">Create New Blog Post</h2>
          <div class="wizard-actions">
            <button class="wizard-cancel-btn">
              <i class="fa-solid fa-times"></i>
              Cancel
            </button>
            <button class="wizard-save-btn">
              <i class="fa-solid fa-save"></i>
              Save Post
            </button>
          </div>
        </div>
        
        <div class="blog-wizard-form">
          <div class="form-group">
            <label for="post-title">Title</label>
            <input type="text" id="post-title" class="post-title-input" placeholder="Enter post title...">
          </div>
          
          <div class="form-group">
            <label for="post-excerpt">Excerpt</label>
            <textarea id="post-excerpt" class="post-excerpt-input" placeholder="Enter a brief excerpt..."></textarea>
          </div>
          
          <div class="form-group">
            <label>Content</label>
            <textarea id="post-content-editor"></textarea>
          </div>
          
          <div class="form-group">
            <label>Featured Image</label>
            <div class="image-upload-container">
              <input type="file" id="featured-image" accept="image/*">
              <div class="image-preview"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  
  export default BlogPostWizardTemplate;