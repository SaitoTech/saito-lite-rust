import React, { useState, useCallback } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

marked.setOptions({
  gfm: true,
  breaks: true,
  headerIds: true,
  mangle: false,
  smartLists: true,
  smartypants: true,
  tables: true  // explicitly enable tables
});


const PostModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    metaDescription: '',
    tags: '',
    images: []
  });
  
  const [isDragging, setIsDragging] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const parseMarkdown = (content) => {
    return DOMPurify.sanitize(marked.parse(content));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const submitData = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (key === 'images') {
          formData.images.forEach(image => {
            submitData.append('images', image);
          });
        } else if (key === 'tags') {
          const tagsArray = formData.tags.split(',').map(tag => tag.trim());
          submitData.append('tags', JSON.stringify(tagsArray));
        } else {
          submitData.append(key, formData[key]);
        }
      });

      let {title, images, content, tags} = formData;
        
      let base64Image = null;
      if (images.length > 0) {
        const reader = new FileReader();
        base64Image = await new Promise((resolve, reject) => {
          reader.onloadend = () => {
            const base64String = reader.result.split(',')[1];
            resolve(base64String);
          };
          reader.onerror = reject;
          reader.readAsDataURL(images[0]);
        });
      }
      
      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      await onSubmit({title, content, image: base64Image, tags: tagsArray});
      onClose();
    } catch (error) {
      console.error('Error submitting post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = [...e.dataTransfer.files];
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...imageFiles]
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(imageFiles[0]);
    }
  }, []);

  const handleFileInput = useCallback((e) => {
    const files = [...e.target.files];
    if (files.length > 0) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...files]
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(files[0]);
    }
  }, []);

  const removeImage = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    if (formData.images.length <= 1) {
      setImagePreview(null);
    }
  }, [formData.images.length]);

  return (
    <div className="modal-container">
      <div className="modal-header">
        <h1 className="modal-title">Create New Blog Post</h1>
      </div>
      
      <div className="modal-content">
        <form onSubmit={handleSubmit} className="editor-form">
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              placeholder="Enter your blog title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          {!showPreview ? (
            <div className="form-group">
              <label htmlFor="content">Content Body (Markdown Supported)</label>
              <textarea
                id="content"
                name="content"
                placeholder="Write your blog content here..."
                value={formData.content}
                onChange={handleChange}
                required
              />
            </div>
          ) : (
            <div className="form-group">
              <label>Content Preview</label>
              <div 
                className="markdown-preview"
                style={{
                  border: '1px solid var(--saito-border-color)',
                  borderRadius: '6px',
                  padding: '12px',
                  minHeight: '200px',
                  background: 'var(--saito-background-color)',
                  overflow: 'auto'
                }}
                dangerouslySetInnerHTML={{ __html: parseMarkdown(formData.content) }}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="tags">Tags</label>
            <input
              type="text"
              id="tags"
              name="tags"
              placeholder="Add tags separated by commas"
              value={formData.tags}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Preview Image</label>
            <div 
              className={`image-upload-area ${isDragging ? 'dragging' : ''}`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {imagePreview ? (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" className="preview-img" />
                  <button 
                    type="button" 
                    className="remove-image"
                    onClick={() => removeImage(0)}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <p>Drag and drop image here or</p>
                  <input
                    type="file"
                    id="fileInput"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="file-input"
                  />
                  <label htmlFor="fileInput" className="file-input-label">
                    Choose File
                  </label>
                </>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-draft" onClick={onClose}>
              Cancel
            </button>
            <div className="action-buttons">
              <button 
                type="button" 
                className="btn-draft"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? 'Edit' : 'Preview'}
              </button>
              <button 
                type="submit" 
                className="btn-publish"
                disabled={!formData.title || !formData.content || isSubmitting}
              >
                {isSubmitting ? 'Publishing...' : 'Publish'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostModal;

