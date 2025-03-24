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
    

    const isPNG = base64String.charAt(0) === 'i';
    const isJPEG = base64String.charAt(0) === '/';
    const isGIF = base64String.charAt(0) === 'R';
    
    let mimeType = 'jpeg'; 
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


export const initializeUsers = (app, mod) => {
    return [
        { username: 'All posts', publicKey: 'all' },
        { username: 'My contacts', publicKey: 'contacts' },
        { username: 'My posts', publicKey: mod.publicKey }
    ];
};


import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm'; // Fixed import

const turndownService = new TurndownService({
 headingStyle: 'atx',
 hr: '---',
 bulletListMarker: '-',
 codeBlockStyle: 'fenced',
 emDelimiter: '_',
 strongDelimiter: '**',
 linkStyle: 'inlined',
 linkReferenceStyle: 'full',
 preformattedCode: true,
});

turndownService.use(gfm);

turndownService.keep([
 'iframe',
 'sub', 
 'sup',
 'kbd',
 'math',
 'pre',
]);

turndownService.addRule('alignedElements', {
 filter: (node) => {
   return node.classList && (
     node.classList.contains('ql-align-center') ||
     node.classList.contains('ql-align-right') ||
     node.classList.contains('ql-align-justify')
   );
 },
 replacement: (content, node) => {
   if (node.classList.contains('ql-align-center')) {
     return `\n\n<div align="center">\n\n${content}\n\n</div>\n\n`;
   }
   if (node.classList.contains('ql-align-right')) {
     return `\n\n<div align="right">\n\n${content}\n\n</div>\n\n`;
   }
   if (node.classList.contains('ql-align-justify')) {
     return `\n\n<div align="justify">\n\n${content}\n\n</div>\n\n`;
   }
   return content;
 }
});

turndownService.addRule('indentation', {
 filter: (node) => {
   return node.classList && /ql-indent-\d+/.test(node.className);
 },
 replacement: (content, node) => {
   const indent = node.className.match(/ql-indent-(\d+)/);
   if (indent && indent[1]) {
     const spaces = '    '.repeat(parseInt(indent[1]));
     return `\n${spaces}${content}\n`;
   }
   return content;
 }
});

turndownService.addRule('fencedCodeBlock', {
 filter: (node) => {
   return node.classList && 
          (node.classList.contains('ql-syntax') || 
           node.classList.contains('code-block'));
 },
 replacement: (content, node) => {
   const language = node.getAttribute('data-language') || '';
   return `\n\`\`\`${language}\n${content}\n\`\`\`\n`;
 }
});

turndownService.addRule('images', {
 filter: 'img',
 replacement: (content, node) => {
   const alt = node.getAttribute('alt') || '';
   const src = node.getAttribute('src') || '';
   const title = node.getAttribute('title') || '';
   const titlePart = title ? ` "${title}"` : '';
   return `![${alt}](${src}${titlePart})`;
 }
});

turndownService.addRule('taskListItems', {
 filter: (node) => {
   return node.type === 'checkbox' && node.parentNode.tagName === 'LI';
 },
 replacement: (content, node) => {
   return node.checked ? '[x] ' : '[ ] ';
 }
});

turndownService.addRule('subscript', {
 filter: ['sub'],
 replacement: (content) => `~${content}~`
});

turndownService.addRule('superscript', {
 filter: ['sup'],
 replacement: (content) => `^${content}^`
});

const cleanQuillHtml = (html) => {
 return html
   .replace(/<p><br><\/p>/g, '\n\n')
   .replace(/(<p[^>]*>|<\/p>)/g, '\n')
   .replace(/\n\s*\n\s*\n/g, '\n\n')
   .trim();
};

export const htmlToMarkdown = (html) => {
 const cleanHtml = cleanQuillHtml(html);
 let markdown = turndownService.turndown(cleanHtml);
 
//  markdown = markdown
//    .replace(/\n\s*\n\s*\n/g, '\n\n')
//    .replace(/\n\n\n+/g, '\n\n')
//    .replace(/(\s*\n\s*)*$/, '\n')
//    .trim();
   
 return markdown;
};

export const isMarkdownContent = (content) => {
    const markdownPatterns = [
      /^#\s/, 
      /\*\*(.*?)\*\*/,
      /\*(.*?)\*/, 
      /\[(.*?)\]\((.*?)\)/, 
      /```[\s\S]*?```/, 
      /^\s*[-*+]\s/, 
      /^\s*\d+\.\s/,
      /^\s*>.+/,
      /\[x\]|\[ \]/,
      /\|.*\|.*\|/, 
    ];
  
    return markdownPatterns.some(pattern => pattern.test(content));
  };


