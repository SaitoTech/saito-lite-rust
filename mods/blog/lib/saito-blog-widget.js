const { default: BlogPostWizard } = require("./blog-post-wizard");
const { default: SaitoBlogWidgetTemplate } = require("./saito-blog-widget.template");


class SaitoBlogWidget {
    constructor(app, mod, container) {
      this.app = app;
      this.mod = mod;
      this.container = container;
      this.name = 'SaitoBlogWidget';
      this.slug = 'SaitoBlogWidget';
      this.postWizard = new BlogPostWizard(app, mod);
      

      
      // Store blog posts
      this.posts = [];
      
      // Track widget state
      this.is_rendered = false;
      
      // Bind methods
      this.attachEvents = this.attachEvents.bind(this);
      this.render = this.render.bind(this);
      this.renderPosts = this.renderPosts.bind(this);
      
      // Initialize listeners
      this.initializeListeners();
    }
  
    initializeListeners() {
      // Listen for new posts
      this.app.connection.on('blog-post-created', (post) => {
        this.posts.unshift(post);
        this.renderPosts();
      });
  
      // Listen for post updates
      this.app.connection.on('blog-post-updated', (updatedPost) => {
        this.posts = this.posts.map(post => 
          post.id === updatedPost.id ? updatedPost : post
        );
        this.renderPosts();
      });
  
      // Listen for post deletions
      this.app.connection.on('blog-post-deleted', (postId) => {
        this.posts = this.posts.filter(post => post.id !== postId);
        this.renderPosts();
      });
    }
  
    async initialize(app) {
      // Fetch initial posts
      try {
        const response = await fetch('/api/blog/posts');
        this.posts = await response.json();
      } catch (err) {
        console.error('Error fetching blog posts:', err);
        this.posts = [];
      }
    }
  
    async render() {
        console.log('rendering saito blog widget');
    //   if (!document || !this.app) return;
    
      // Add to DOM if needed
      if (!document.querySelector('.saito-blog-widget')) {
        this.app.browser.addElementToSelector(SaitoBlogWidgetTemplate(this.app, this.mod), this.container);
      } else {
        this.app.browser.replaceElementBySelector(
          SaitoBlogWidgetTemplate(this.app, this.mod),
          '.saito-blog-widget'
        );
      }
  
      await this.renderPosts();
      this.attachEvents();
      this.is_rendered = true;
    }
  
    async renderPosts() {
      const postsContainer = document.querySelector('.blog-posts-list');
      if (!postsContainer) return;
  
      const postsHTML = this.posts.map(post => `
        <li class="blog-post-item" data-post-id="${post.id}">
          <div class="blog-post-content">
            <h3 class="blog-post-title">${post.title}</h3>
            <p class="blog-post-excerpt">${post.excerpt}</p>
            <div class="blog-post-meta">
              <span class="blog-post-author">
                <i class="fa-solid fa-user"></i>
                ${post.author}
              </span>
              <span class="blog-post-date">
                <i class="fa-regular fa-clock"></i>
                ${new Date(post.date).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div class="blog-post-actions">
            <button class="blog-post-edit" data-post-id="${post.id}">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="blog-post-delete" data-post-id="${post.id}">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </li>
      `).join('');
  
      postsContainer.innerHTML = postsHTML;
    }
  
    attachEvents() {

      // New Post Button
      document.querySelector('.blog-new-post-btn')?.addEventListener('click', () => {
        this.postWizard.render();
      });
      
      
      // Edit Post Buttons
      document.querySelectorAll('.blog-post-edit').forEach(button => {
        button.addEventListener('click', (e) => {
          const postId = e.currentTarget.getAttribute('data-post-id');
          const post = this.posts.find(p => p.id === postId);
          if (post) {
            this.postWizard.render(post);
          }
        });
      });
  
      // Delete Post Buttons
      document.querySelectorAll('.blog-post-delete').forEach(button => {
        button.addEventListener('click', async (e) => {
          const postId = e.currentTarget.getAttribute('data-post-id');
          if (confirm('Are you sure you want to delete this post?')) {
            try {
              await fetch(`/api/blog/posts/${postId}`, { method: 'DELETE' });
              this.app.connection.emit('blog-post-deleted', postId);
            } catch (err) {
              console.error('Error deleting post:', err);
              alert('Failed to delete post');
            }
          }
        });
      });
  
      // Post Item Click (for viewing)
      document.querySelectorAll('.blog-post-item').forEach(item => {
        item.addEventListener('click', (e) => {
          // Only trigger if not clicking action buttons
          if (!e.target.closest('.blog-post-actions')) {
            const postId = item.getAttribute('data-post-id');
            const post = this.posts.find(p => p.id === postId);
            if (post) {
              this.app.connection.emit('blog-view-post-clicked', post);
            }
          }
        });
      });
    }
  }
  
  module.exports = SaitoBlogWidget