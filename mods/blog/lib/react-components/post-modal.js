

import React, { useState } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const PostModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
    images: [],
    publisher: ""
  });
  
  const [isDragging, setIsDragging] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData(prev => ({
          ...prev,
          images: [file]
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let {title, images, content, tags, publisher} = formData;
        
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
      
      await onSubmit({title, content, image: base64Image, tags: tagsArray, publisher});
      onClose();
    } catch (error) {
      console.error('Error submitting post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="layout modal-layout">
      <div className="left-column">
        <div className="filter-container">
          <label className="filter-label">Tags</label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="Add tags separated by commas"
          />
        </div>

        <div className="filter-container">
          <label className="filter-label">Preview Image</label>
          <div 
            className={`image-upload-area ${isDragging ? 'dragging' : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files[0];
              if (file && file.type.startsWith('image/')) {
                handleImageUpload(file);
              }
            }}
          >
            {imagePreview ? (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
                <button 
                  type="button"
                  className="remove-image"
                  onClick={() => {
                    setImagePreview(null);
                    setFormData(prev => ({ ...prev, images: [] }));
                  }}
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
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      handleImageUpload(file);
                    }
                  }}
                  className="file-input"
                />
                <label htmlFor="fileInput" className="file-input-label">
                  Choose File
                </label>
              </>
            )}
          </div>
        </div>

        <div className='filter-container'>
          <label className="filter-label">Publisher</label>
     
          <input onChange={handleChange} name='publisher' value={formData.publisher} placeholder='Public key of publisher' type='text' />

          </div>

        <div className="left-column-buttons">
          <div className='filter-container'>
          <label className="filter-label">Action</label>
          <button 
            type="button" 
            className="btn-preview"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? 'Edit' : 'Preview'}
          </button>
          <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button 
              onClick={handleSubmit}
              type="submit" 
              className="btn-publish"
              disabled={!formData.title || !formData.content || isSubmitting}
            >
              {isSubmitting ? 'Publishing...' : 'Publish'}
            </button>
          
          <div className="action-buttons">
          
          </div>

          </div>
      
        </div>
      </div>

      <div className="center-column">
        <form onSubmit={handleSubmit} className="editor-form">
          <div className="form-group">
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter your blog title"
              className="editor-title"
              required
            />
          </div>

          {!showPreview ? (
            <div className="form-group">
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Write your blog content here..."
                className="editor-content"
                required
              />
            </div>
          ) : (
            <div className="form-group">
              <div 
                className="markdown-preview"
                dangerouslySetInnerHTML={{ 
                  __html: DOMPurify.sanitize(marked.parse(formData.content)) 
                }}
              />
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default PostModal;