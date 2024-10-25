// SaitoBlogWidget.js
const { createRoot } = require('react-dom/client');
const React = require('react');
const { default: BlogWidget } = require('./react-components/blog-widget');

class SaitoBlogWidget {
    constructor(app, mod, selector) {
        this.app = app;
        this.mod = mod;
        this.selector = selector;
        this.name = "SaitoBlogWidget";
        this.root = null;      
        // Bind methods
        this.render = this.render.bind(this);
        this.cleanup = this.cleanup.bind(this);    
        // Initialize state
        this.posts = [];
        this.isEditing = false;
    }

    cleanup() {
        if (this.root) {
            this.root.unmount();
            this.root = null;
        }
    }

    async render() {
        let selector = this.selector;
        if (!selector) {
            console.error("Blog Widget: No selector provided");
            return;
        }
        const container = document.querySelector(selector);    
        if (!container) {
            console.error(`Blog Widget: Container not found with selector "${selector}"`);
            return;
        }

        // Clear any existing content
        container.innerHTML = '';
       
        // Create root element
        const widgetRoot = document.createElement('div');
        widgetRoot.id = `blog-widget-${Date.now()}`;
        container.appendChild(widgetRoot);
        // Initialize React
        this.root = createRoot(widgetRoot);
        this.root.render(
            <BlogWidget 
                app={this.app}
                mod={this.mod}
                publicKey={this.mod.publicKey}
                topMargin= {false}
            />
        );
    }
}

module.exports = SaitoBlogWidget;




