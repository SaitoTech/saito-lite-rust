import SaitoOverlay from "../../../lib/saito/ui/saito-overlay/saito-overlay";
import BlogPostWizardTemplate from "./blog-post-wizard.template";

class BlogPostWizard {
    constructor(app, mod) {
      this.app = app;
      this.mod = mod;
      this.editor = null;
      this.currentPost = null;
      
      // Bind methods
      this.render = this.render.bind(this);
      this.attachEvents = this.attachEvents.bind(this);
      this.initializeEditor = this.initializeEditor.bind(this);
      this.savePost = this.savePost.bind(this);
      
      // Initialize TinyMCE if not already loaded
      this.loadTinyMCE();
    }
    
    loadTinyMCE() {
      if (!window.tinymce) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.8.2/tinymce.min.js';
        script.onload = () => this.initializeEditor();
        document.head.appendChild(script);
      }
    }
    
    initializeEditor() {
      // Only initialize if we have the container
      if (!document.getElementById('post-content-editor')) return;
      
      tinymce.init({
        selector: '#post-content-editor',
        height: 500,
        menubar: true,
        plugins: [
          'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
          'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
          'insertdatetime', 'media', 'table', 'help', 'wordcount'
        ],
        toolbar: `undo redo | blocks | bold italic backcolor | \
          alignleft aligncenter alignright alignjustify | \
          bullist numlist outdent indent | removeformat | help`,
        content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif; font-size: 14px; }',
        setup: (editor) => {
          this.editor = editor;
          editor.on('change', () => {
            // Handle content changes
            this.handleContentChange();
          });
        }
      });
    }
    
    async render(post = null) {
      this.currentPost = post;
      
      if (!document.querySelector('.blog-post-wizard')) {
        this.saitoOverlay = new SaitoOverlay(this.app, this.mod);
        this.saitoOverlay.show(BlogPostWizardTemplate())
      }
      
      // Show the wizard
      document.getElementById('blog-post-wizard').style.display = 'block';
      
      // Initialize editor after render
      await this.initializeEditor();
      
      // If editing existing post, populate fields
      if (post) {
        document.querySelector('.wizard-title').textContent = 'Edit Blog Post';
        document.querySelector('#post-title').value = post.title;
        document.querySelector('#post-excerpt').value = post.excerpt;
        if (this.editor) {
          this.editor.setContent(post.content);
        }
        
        // Show existing featured image if any
        if (post.featuredImage) {
          const preview = document.querySelector('.image-preview');
          preview.innerHTML = `<img src="${post.featuredImage}" alt="Featured image">`;
        }
      }
      
      this.attachEvents();
    }
    
    attachEvents() {
      // Cancel button
      document.querySelector('.wizard-cancel-btn')?.addEventListener('click', () => {
        this.close();
      });
      
      // Save button
      document.querySelector('.wizard-save-btn')?.addEventListener('click', () => {
        this.savePost();
      });
      
      // Image upload preview
      document.querySelector('#featured-image')?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const preview = document.querySelector('.image-preview');
            preview.innerHTML = `<img src="${e.target.result}" alt="Featured image preview">`;
          };
          reader.readAsDataURL(file);
        }
      });
    }
    
    handleContentChange() {
      // Add any content change handling logic here
      // For example, auto-save drafts
      const content = this.editor.getContent();
      this.autoSaveDraft(content);
    }
    
    async autoSaveDraft(content) {
      // Implement draft saving logic
      const draftData = {
        title: document.querySelector('#post-title').value,
        excerpt: document.querySelector('#post-excerpt').value,
        content: content,
        lastSaved: new Date()
      };
      
      // Save to local storage or your backend
      localStorage.setItem('blog_draft', JSON.stringify(draftData));
    }
    
    async savePost() {
      if (!this.editor) return;
      
      const postData = {
        title: document.querySelector('#post-title').value,
        excerpt: document.querySelector('#post-excerpt').value,
        content: this.editor.getContent(),
        id: this.currentPost?.id || null,
        date: new Date().toISOString(),
        author: this.app.keychain.returnIdentifierByPublicKey(this.mod.publicKey, true)
      };
      
      // Handle featured image
      const imageInput = document.querySelector('#featured-image');
      if (imageInput.files[0]) {
        postData.featuredImage = await this.handleImageUpload(imageInput.files[0]);
      }
      
      try {
        const method = this.currentPost ? 'PUT' : 'POST';
        const url = this.currentPost 
          ? `/api/blog/posts/${this.currentPost.id}`
          : '/api/blog/posts';
          
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(postData)
        });
        
        if (!response.ok) throw new Error('Failed to save post');
        
        const savedPost = await response.json();
        
        // Emit event for blog widget to update
        this.app.connection.emit(
          this.currentPost ? 'blog-post-updated' : 'blog-post-created',
          savedPost
        );
        
        // Clear draft
        localStorage.removeItem('blog_draft');
        
        // Close wizard
        this.close();
        
      } catch (err) {
        console.error('Error saving post:', err);
        alert('Failed to save post. Please try again.');
      }
    }
    
    async handleImageUpload(file) {
      // Implement image upload logic
      // This is a placeholder - replace with your actual image upload code
      try {
        const formData = new FormData();
        formData.append('image', file);
        
        const response = await fetch('/api/blog/upload-image', {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) throw new Error('Failed to upload image');
        
        const data = await response.json();
        return data.imageUrl;
      } catch (err) {
        console.error('Error uploading image:', err);
        throw err;
      }
    }
    
    close() {
      if (this.editor) {
        this.editor.remove();
        this.editor = null;
      }
      
      const wizard = document.getElementById('blog-post-wizard');
      if (wizard) {
        wizard.style.display = 'none';
      }
    }
    
    parseHTML(html) {
      // Create a safe parser
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Clean potentially dangerous elements/attributes
      const clean = this.sanitizeHTML(doc.body);
      
      return clean.innerHTML;
    }
    
    sanitizeHTML(element) {
      const safe = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 
                   'strong', 'em', 'code', 'pre', 'blockquote', 'a', 'img', 'br'];
      const safeAttrs = {
        'a': ['href', 'title'],
        'img': ['src', 'alt', 'title']
      };
      
      // Remove unsafe elements
      const elements = element.getElementsByTagName('*');
      for (let i = elements.length - 1; i >= 0; i--) {
        const el = elements[i];
        if (!safe.includes(el.tagName.toLowerCase())) {
          el.parentNode.removeChild(el);
        } else {
          // Remove unsafe attributes
          const attrs = el.attributes;
          for (let j = attrs.length - 1; j >= 0; j--) {
            const attr = attrs[j];
            const tag = el.tagName.toLowerCase();
            if (!safeAttrs[tag] || !safeAttrs[tag].includes(attr.name)) {
              el.removeAttribute(attr.name);
            }
          }
        }
      }
      
      return element;
    }
  }
  
export default BlogPostWizard;