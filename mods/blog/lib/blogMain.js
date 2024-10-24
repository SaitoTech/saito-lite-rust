const blogMainTemplate = require("./blogMain.template");

class BlogMain {
    constructor(app, mod, container = '') {
        this.app = app;
        this.mod = mod;
        this.container = container;

    }

    async render() {
        if (document.querySelector('.blog-main')) {
            return;
        }
        this.app.browser.addElementToDom(blogMainTemplate(this.app, this.mod));
        this.attachEvents(this.app, this.mod)
    }
    attachEvents(app, mod) {
        document.querySelector('.load').addEventListener('click', async (e) => {
           await this.mod.testLoadBlogTransactions(this.mod.publicKey);
        })
        
        document.querySelector('.save').addEventListener('click', async (e) => {
            let peers = await app.network.getPeers();
           await this.mod.createBlogTransaction('content', 'title');
        })
    }
}

module.exports = BlogMain;