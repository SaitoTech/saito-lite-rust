const SaitoBlogWidgetTemplate = (app, mod) => {
    return `
      <div class="saito-blog-widget">
        <div class="blog-header">
          <h2>Blog Posts</h2>
          <button class="blog-new-post-btn">
            <i class="fa-solid fa-plus"></i>
            New Post
          </button>
        </div>
        <div class="blog-posts-container">
          <ul class="blog-posts-list">
          </ul>
        </div>
      </div>
    `;
  };

  export default SaitoBlogWidgetTemplate;