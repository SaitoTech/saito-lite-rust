

import React, { useState, useEffect } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const PostModal = ({ onClose, onSubmit, post }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
    images: [],
    imageUrl
  });

  const [isDragging, setIsDragging] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [imageMethod, setImageMethod] = useState('file');
  const [imageUrl, setImageUrl] = useState('');

  const [imagePreview, setImagePreview] = useState(
    post?.imageUrl || (post?.image ? `data:image/jpeg;base64,${post.image}` : null)
  );


  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title,
        content: post.content,
        tags: post.tags ? post.tags.join(',') : '',
        images: [],
        imageUrl: post.imageUrl || ''
      });
      
      if (post.imageUrl) {
        setImagePreview(post.imageUrl);
      } else if (post.image) {
        setImagePreview(`data:image/jpeg;base64,${post.image}`);
      }
    }
  }, [post]);

  const handleImageUrl = (url) => {
    const img = new Image();
    img.onload = () => {
      setImagePreview(url);
      setFormData(prev => ({
        ...prev,
        imageUrl: url,
        images: []
      }));
    };
    img.onerror = () => {
      setImagePreview(null);
      setFormData(prev => ({
        ...prev,
        imageUrl: "",
        images: []
      }));
      salert('Invalid image URL');
    };
    img.src = url;
  };


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
      let { title, images, content, tags, imageUrl } = formData;

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

      await onSubmit({ title, content, image: base64Image, tags: tagsArray, imageUrl });
      // onClose();
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
          <label className="filter-label">Upload Image</label>
          <div className="image-method-toggle">
            <button
              className={`btn-preview ${imageMethod === 'file' ? 'active' : ''}`}
              onClick={() => setImageMethod('file')}
            >
              File Upload
            </button>
            <button
              className={`btn-preview ${imageMethod === 'url' ? 'active' : ''}`}
              onClick={() => setImageMethod('url')}
            >
              Image URL
            </button>
          </div>

          {imageMethod === 'file' ? (
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
          ) : (
            <div>
              <input
                type="text"
                name="imageUrl"
                placeholder="paste image URL"
                value={formData.imageUrl}
                onChange={(e) => {
                  handleChange(e);
                  handleImageUrl(e.target.value);
                }}
                className="editor-title"
              />
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="URL Preview" />
                  <button
                    type="button"
                    className="remove-image"
                    onClick={() => {
                      setImagePreview(null);
                      setFormData(prev => ({
                        ...prev,
                        imageUrl: '',
                        images: []
                      }));
                    }}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          )}
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
            {/* <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button> */}
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
          <div className='small-controls'>
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
                  <div className="image-method-toggle">
                    <button
                      className={`btn-preview ${imageMethod === 'file' ? 'active' : ''}`}
                      onClick={() => setImageMethod('file')}
                    >
                      File Upload
                    </button>
                    <button
                      className={`btn-preview ${imageMethod === 'url' ? 'active' : ''}`}
                      onClick={() => setImageMethod('url')}
                    >
                      Image URL
                    </button>
                  </div>

                  {imageMethod === 'file' ? (
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
                  ) : (
                    <div>
                      <input
                        type="text"
                        name="imageUrl"
                        placeholder="paste image URL"
                        value={formData.imageUrl}
                        onChange={(e) => {
                          handleChange(e);
                          handleImageUrl(e.target.value);
                        }}
                        className="editor-title"
                      />
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
                        {imagePreview && (
                          <div className="image-preview">
                            <img src={imagePreview} alt="URL Preview" />
                            <button
                              type="button"
                              className="remove-image"
                              onClick={() => {
                                setImagePreview(null);
                                setFormData(prev => ({
                                  ...prev,
                                  imageUrl: '',
                                  images: []
                                }));
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className='filter-container'>
                  <label className="filter-label">Action</label>
                  <button
                    type="button"
                    className="btn-preview"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    {showPreview ? 'Edit' : 'Preview'}
                  </button>
                  {/* <button type="button" className="btn-cancel" onClick={onClose}>
                    Cancel
                  </button> */}
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
        </form>
      </div>
    </div>
  );
};

export default PostModal;