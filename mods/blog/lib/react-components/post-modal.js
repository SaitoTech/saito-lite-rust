

import React, { useState, useEffect, useRef } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { htmlToMarkdown, isMarkdownContent } from '../utils';


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
  const [editorMode, setEditorMode] = useState(() => {
    if (post?.content) {
      return isMarkdownContent(post.content) ? 'markdown' : 'rich';
    }
    return 'rich';
  });
  const isQuillUpdate = useRef(false);
  


  const editorRef = useRef(null);
  const quillInstance = useRef(null);

  const [imagePreview, setImagePreview] = useState(
    post?.imageUrl || (post?.image ? `data:image/jpeg;base64,${post.image}` : null)
  );



  useEffect(() => {
    if (window.Quill && editorRef.current && !quillInstance.current) {
      const imageHandler = () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
          const file = input.files[0];
          if (file) {
            try {
              const reader = new FileReader();
              reader.onload = (e) => {
                const range = quillInstance.current.getSelection(true);
                quillInstance.current.insertEmbed(range.index, 'image', e.target.result);
              };
              reader.readAsDataURL(file);
            } catch (error) {
              console.error('Error uploading image:', error);
            }
          }
        };
      };
      const imageUrlHandler = async () => {
        const url = await sprompt('Enter image URL:');
        if (url) {
          const range = quillInstance.current.getSelection(true);
          quillInstance.current.insertEmbed(range.index, 'image', url);
        }
      };


      // window.Quill.register('modules/markdownShortcuts', window.MarkdownShortcuts);
      quillInstance.current = new window.Quill(editorRef.current, {
        theme: 'snow',
        modules: {

          // markdownShortcuts: {},
          toolbar: {
            container: [
              [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
              ['bold', 'italic', 'underline', 'strike'],
              [{ 'color': [] }, { 'background': [] }],
              [{ 'align': [] }],
              [{ 'list': 'ordered' }, { 'list': 'bullet' }],
              [{ 'indent': '-1' }, { 'indent': '+1' }],
              [{ 'script': 'sub' }, { 'script': 'super' }],
              ['blockquote', 'code-block'],
              ['link', 'image'],
              ['clean']
            ],
            handlers: {
              image: async () => {
                const selection = await sconfirm('Would you like to upload a file instead of using a URL?');
                if (selection) {
                  imageHandler();
                } else {
                  imageUrlHandler();
                }
              },
              link: function (value) {
                if (value) {
                  const href = prompt('Enter the URL:');
                  if (href) {
                    const quill = quillInstance.current;
                    const range = quill.getSelection();
                    if (range && range.length > 0) {
                      quill.format('link', href);
                    } else {
                      quill.insertText(range.index, href, 'link', href);
                      quill.setSelection(range.index + href.length);
                    }
                  }
                } else {
                  quillInstance.current.format('link', false);
                }
              }
            }
          },
          clipboard: {
            matchVisual: true
          }
        },
        placeholder: 'Write your blog content here...',
      });

      const toolbar = quillInstance.current.getModule('toolbar');
      toolbar.addHandler('image', async () => {
        const selection = await sconfirm('Would you like to upload a file instead of using a URL?');
        if (selection) {
          imageHandler();
        } else {
          imageUrlHandler();
        }
      });

      if (formData.content) {
        quillInstance.current.root.innerHTML = formData.content;
      }
      quillInstance.current.on('text-change', () => {
        if (!isQuillUpdate.current) {
          const htmlContent = quillInstance.current.root.innerHTML;
          setFormData(prev => ({
            ...prev,
            content: htmlContent
          }));
        }
      });

      editorRef.current.addEventListener('paste', (e) => {
        const clipboardData = e.clipboardData;
        if (clipboardData && clipboardData.items) {
          const items = clipboardData.items;
          for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
              e.preventDefault();
              const file = items[i].getAsFile();
              const reader = new FileReader();
              reader.onload = (e) => {
                const range = quillInstance.current.getSelection(true);
                quillInstance.current.insertEmbed(range.index, 'image', e.target.result);
              };
              reader.readAsDataURL(file);
              break;
            }
          }
        }
      });
    }

    return () => {
      if (quillInstance.current) {
      }
    };
  }, []);

  useEffect(() => {
    if (!editorRef.current) return;

    if (editorMode === 'rich' && quillInstance.current) {
      const editorElement = editorRef.current;
      if (editorElement && editorElement.style) {
        editorElement.style.display = 'block';
        document.querySelector('.ql-toolbar').style.display = "block";
        if (formData.content && !formData.content.includes('<')) {
          isQuillUpdate.current = true;
          const htmlContent = DOMPurify.sanitize(marked.parse(formData.content));
          const delta = quillInstance.current.clipboard.convert(htmlContent);
          quillInstance.current.setContents(delta, 'silent');
          isQuillUpdate.current = false;
        }
      }
    } else if (editorMode === 'markdown' && quillInstance.current) {
      const editorElement = editorRef.current;
      if (editorElement && editorElement.style) {
        editorElement.style.display = 'none';
        document.querySelector('.ql-toolbar').style.display = "none";
      }
    }
  }, [editorMode]);

  useEffect(() => {
    if (post) {
      const initialMode = isMarkdownContent(post.content) ? 'markdown' : 'rich';
      setEditorMode(initialMode);
      
      setFormData({
        title: post.title,
        content: post.content,
        tags: post.tags ? post.tags.join(',') : '',
        images: [],
        imageUrl: post.imageUrl || ''
      });
  
      if (quillInstance.current && post.content && initialMode === 'rich') {
        quillInstance.current.root.innerHTML = post.content;
      }
  
      if (post.imageUrl) {
        setImagePreview(post.imageUrl);
      } else if (post.image) {
        setImagePreview(`data:image/jpeg;base64,${post.image}`);
      }
    }
  }, [post]);

  // const handleEditorModeSwitch = () => {
  //   if (editorMode === 'rich') {
  //     const htmlContent = quillInstance.current.root.innerHTML;
  //     const cleanHtml = htmlContent.replace(/(<p><br><\/p>)+/g, '<p><br></p>');
  //     const markdownContent = htmlToMarkdown(cleanHtml);
  //     setFormData(prev => ({
  //       ...prev,
  //       content: markdownContent
  //     }));
  //   } else {
  //     const htmlContent = DOMPurify.sanitize(marked.parse(formData.content));
  //     const delta = quillInstance.current.clipboard.convert(formData.content);
  //     quillInstance.current.setContents(delta, 'silent');
  //   }
  //   setEditorMode(prev => prev === 'rich' ? 'markdown' : 'rich');
  // };

  const handleEditorModeSwitch = () => {
    if (editorMode === 'rich') {
      const htmlContent = quillInstance.current.root.innerHTML;
    
      let cleanHtml = htmlContent.replace(/(<p><br><\/p>)+/g, '<p><br></p>');

      cleanHtml = cleanHtml.replace(/<hr\s*\/?>/g, '\n---\n');
      cleanHtml = cleanHtml.replace(/<br\s*\/?>/g, '\n');
    
      cleanHtml = cleanHtml.replace(
        /<table[^>]*>([\s\S]*?)<\/table>/g,
        (match, tableContent) => {
          const rows = tableContent.match(/<tr[^>]*>([\s\S]*?)<\/tr>/g) || [];
          const markdownRows = rows.map(row => {
            const cells = row.match(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g) || [];
            return `|${cells.map(cell => {
              const content = cell.replace(/<\/?t[dh][^>]*>/g, '').trim();
              return ` ${content} `;
            }).join('|')}|`;
          });
          
          if (markdownRows.length > 0) {
            const columnCount = (markdownRows[0].match(/\|/g) || []).length - 1;
            const separator = `|${' --- |'.repeat(columnCount)}`;
            markdownRows.splice(1, 0, separator);
          }
          
          return '\n' + markdownRows.join('\n') + '\n';
        }
      );
      
      const markdownContent = htmlToMarkdown(cleanHtml);
      
      const finalMarkdown = markdownContent
        .replace(/\n---\n/g, '\n\n---\n\n')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/(\n\|[^\n]+\|)\n(?!\|)/g, '$1\n\n');
      
      setFormData(prev => ({
        ...prev,
        content: finalMarkdown
      }));

      if (editorRef.current) {
        editorRef.current.style.display = 'none';
        const toolbar = document.querySelector('.ql-toolbar');
        if (toolbar) {
          toolbar.style.display = 'none';
        }
      }

      setEditorMode('markdown');
    }

  };

  const renderEditorModeButton = () => (
    <button
      className='btn-publish'
      style={{
        background: editorMode === 'markdown' ? '#ccc' : 'none',
        cursor: editorMode === 'markdown' ? 'not-allowed' : 'pointer'
      }}
      type="button"
      onClick={async () => {

        if (editorMode === 'rich') {
          let res = await sconfirm("Are you sure you want to switch editor to markdown mode?");
          if(res){
            handleEditorModeSwitch();
          }

        }
      }}
      disabled={editorMode === 'markdown'}
    >
      {editorMode === "rich" ? "Switch to Markdown" : "Markdown Mode"}
    </button>
  );
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };


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
        {/* <div className="filter-container">
          <label className="filter-label">Tags</label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="Add tags separated by commas"
          />
        </div> */}

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
            <label className="filter-label">Editor Mode</label>
            {renderEditorModeButton()}

     
            {/* <button
              onClick={handleSubmit}
              type="submit"
              className="btn-publish"
              disabled={!formData.title || !formData.content || isSubmitting}
            >
              {isSubmitting ? 'Publishing...' : 'Publish'}
            </button> */}

            <div className="action-buttons">

            </div>

          </div>
          <div className='filter-container'>
            <label className="filter-label">Action</label>
            {/* <button
              type="button"
              className="btn-preview"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? 'Edit' : 'Preview'}
            </button> */}
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


          <div className="form-group">
            <div ref={editorRef} className="editor-content" />
            {
              editorMode !== 'rich' && !showPreview && <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Write your blog content here using Markdown..."
                className="editor-content h-96 w-full p-4 border rounded"
                required
              />
            }


          </div>

          {showPreview && (
            <div className="form-group mt-4">
              <div
                className="preview-content"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(marked.parse(formData.content))
                }}
              />
            </div>
          )}
          <div className='small-controls'>
            {/* <div className="filter-container">
              <label className="filter-label">Tags</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="Add tags separated by commas"
              />
            </div> */}

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
            <label className="filter-label">Current Editor Mode</label>
            {renderEditorModeButton()}


            <div className="action-buttons">

            </div>

          </div>
            <div className='filter-container'>
              <label className="filter-label">Action</label>
              {/* <button
                type="button"
                className="btn-preview"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? 'Edit' : 'Preview'}
              </button> */}
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