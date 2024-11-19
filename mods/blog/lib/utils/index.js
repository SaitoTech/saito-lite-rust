import DOMPurify from 'dompurify';
import { marked } from 'marked';


marked.setOptions({
    breaks: true,
    gfm: true
});

export const parseMarkdown = (content) => {
    return DOMPurify.sanitize(marked.parse(content));
};


export const getImageUrl = (base64String) => {
    if (!base64String) return null;
    if (base64String.startsWith('data:image/')) return base64String;
    if (base64String.startsWith('http')) return base64String;
    
    // Try to detect image type from the base64 string
    // This is a simple version - you might want to add more sophisticated detection
    const isPNG = base64String.charAt(0) === 'i';
    const isJPEG = base64String.charAt(0) === '/';
    const isGIF = base64String.charAt(0) === 'R';
    
    let mimeType = 'jpeg'; // default
    if (isPNG) mimeType = 'png';
    if (isGIF) mimeType = 'gif';
    
    return `data:image/${mimeType};base64,${base64String}`;
  };


  export const copyPostLinkToClipboard = async (post) => {
    try {
        const url = new URL(window.location.origin + window.location.pathname);
        url.searchParams.set('public_key', post.publicKey);
        url.searchParams.set('tx_id', post.sig);
        await navigator.clipboard.writeText(url.toString());
        salert('Post link copied to clipboard!');
    } catch (err) {
        console.error('Failed to copy link:', err);
        salert('Failed to copy link');
    }
};



    // const createPreview = (content) => {
    //     const lines = content.split('\n');

    //     const firstTextLine = lines.find(line => {
    //         const trimmed = line.trim();
    //         if (!trimmed) return false;
    //         if (
    //             trimmed.startsWith('![') ||
    //             trimmed.includes('base64') ||
    //             trimmed.match(/^\[!\[.*?\]\(.*?\)\]\(.*?\)$/) ||
    //             trimmed.startsWith('<img') ||
    //             trimmed.startsWith('http') ||
    //             trimmed.startsWith('<iframe')
    //         ) return false;
    //         return true;
    //     }) || '';

    //     const cleanContent = firstTextLine.replace(/[#*`_~]/g, '').trim();
    //     const preview = cleanContent.slice(0, 59);
    //     return preview + (cleanContent.length > 59 ? '...' : '');
    // };
