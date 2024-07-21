// captureWorker.js
import html2canvas from 'html2canvas';

function reconstructNode(serialized) {
    if (serialized.type === 'text') {
        return document.createTextNode(serialized.content);
    }
    if (serialized.type === 'element') {
        const element = document.createElement(serialized.tagName);
        
        // Set attributes
        for (let [name, value] of Object.entries(serialized.attributes)) {
            element.setAttribute(name, value);
        }
        
        // Set styles
        for (let [property, value] of Object.entries(serialized.styles)) {
            element.style[property] = value;
        }
        
        // Reconstruct children
        for (let child of serialized.children) {
            element.appendChild(reconstructNode(child));
        }
        
        return element;
    }
    return null;
}

self.onmessage = async function(e) {
    const { html, width, height, scaleFactor } = e.data;
    
    // Reconstruct the HTML
    const reconstructedHTML = reconstructNode(html);
    document.body.appendChild(reconstructedHTML);
    
    try {
        const canvas = await html2canvas(reconstructedHTML, {
            width: width,
            height: height,
            scale: scaleFactor,
            useCORS: true,
            allowTaint: true,
            logging: false,
        });
        
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        console.log(imageData, "image data")
        self.postMessage({ imageData });
    } catch (error) {
        self.postMessage({ error: error.message });
    } finally {
        // Clean up
        document.body.removeChild(reconstructedHTML);
    }
};