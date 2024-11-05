import React, { useEffect, useRef } from "react";

const BlogEditor = ({ value, onEditorChange }) => {
    const editorRef = useRef(null);

    useEffect(() => {
        // Load TinyMCE from CDN So I won't have to deal with API keys yet
        if (!window.tinymce) {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.7.0/tinymce.min.js';
            script.referrerPolicy = 'origin';
            document.head.appendChild(script);

            script.onload = () => initEditor();
        } else {
            initEditor();
        }

        const iframe = document.querySelector('mce_0_ifr');
        console.log(iframe, 'iframe')
        return () => {
            // Cleanup
            if (window.tinymce) {
                window.tinymce.remove(editorRef.current);
            }
        };
    }, []);

    const initEditor = () => {
        window.tinymce.init({
            target: editorRef.current,
            height: 400,
            menubar: false,
            branding: false,
            promotion: false,
            plugins: [
                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                'insertdatetime', 'media', 'table', 'help', 'wordcount'
            ],
            toolbar: `undo redo | blocks | bold italic backcolor | \
                    alignleft aligncenter alignright alignjustify | \
                    bullist numlist outdent indent | removeformat | help`,
                    content_style: `
                    html { color: var(--saito-font-color) !important; }
                    body { 
                        color: var(--saito-font-color) !important;
                        background: var(--saito-background-color);
                    }
                `,            setup: (editor) => {
                editor.on('change', () => {
                    const content = editor.getContent();
                    onEditorChange(content);
                });

                // Set initial content if any
                if (value) {
                    editor.on('init', () => {
                        editor.setContent(value);
                    });
                }
            }
        });
    };

    return <textarea ref={editorRef} />;
};

export default BlogEditor