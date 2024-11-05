const { default: Transaction } = require("saito-js/lib/transaction");
const SaitoHeader = require("../../lib/saito/ui/saito-header/saito-header");
const ModTemplate = require("../../lib/templates/modtemplate");
const pageHome = require('./index');
const SaitoBlogWidget = require("./lib/saito-blog-widget");
const { default: BlogWidget } = require("./lib/react-components/blog-widget");
const { createRoot } = require("react-dom/client");
const React = require('react');
const { default: BlogPostDetail } = require("./lib/react-components/blog-post-detail");

class Blog extends ModTemplate {
    constructor(app) {
        super(app);
        this.app = app;
        this.name = 'Blog';
        this.slug = 'blog';
        this.description = 'Blod Module';
        this.archive_public_key;
        this.cache = {};
        this.txs = []
        this.peers = []
        this.social = {
            twitter: '@SaitoOfficial',
            title: '🟥 Saito User - Web3 Social Media',
            url: 'https://saito.io/blog',
            description: 'Peer to peer Web3 social media platform',
            image: 'https://saito.tech/wp-content/uploads/2022/04/saito_card.png' 
        };


        this.styles = ['/saito/saito.css', '/blog/style.css'];

        app.connection.on('blog-update-widget', () => {
            console.log('blog-update-widget')
        });



    }


    async onConfirmation(blk, tx, conf) {
        let txmsg = tx.returnMessage();
        if (conf == 0) {
            if (txmsg.request === 'create blog post request') {
                console.log("Blog onConfirmation");
                await this.receiveBlogPostTransaction(tx);
            }
            if (txmsg.request === 'update blog post request') {
                console.log("Blog onConfirmation");
                await this.receiveBlogPostUpdateTransaction(tx);
            }
            if (txmsg.request === 'delete blog post request') {
                console.log("Blog onConfirmation");
                await this.receiveBlogPostDeleteTransaction(tx);
            }
        }
    }

    respondTo(type, obj) {
        if (type === "blog-widget") {
            if (this.browser_active) {
                return;
            }
            this.attachStyleSheets();
            // Get container from selector
            const { container: selector, publicKey } = obj;
            console.log(obj, 'object')

            if (!selector) {
                console.error("A selector is needed for the blog widget");
                return;
            }
            let widget = new SaitoBlogWidget(this.app, this, publicKey, selector)
            return widget
        }
    }

    async onPeerServiceUp(app, peer, service = {}) {
        console.log('peer service up', service.service);
        let self = this
        if (service.service === 'archive') {
            if (this.browser_active) {
                // Get post_id from URL parameters
                const urlParams = new URLSearchParams(window.location.search);
                const postId = urlParams.get('id');
                const author = urlParams.get('author')

                if (postId && author) {
                    // Load specific post
                    await this.loadSinglePost(postId, author);
                }
                else {
                    // Load post by author
                    this.loadPosts(author);
                }
            }
        }
    }

    convertTransactionsToPosts(txs) {
        return txs.map(tx => {
            const msg = tx.returnMessage();
            const data = msg.data;

            return {
                title: data.title || "Untitled",
                content: data.content,
                timestamp: tx.updated_at || data.timestamp,
                sig: tx.signature
            };
        });
    }

    convertTransactionToPost(tx) {
        const msg = tx.returnMessage();
        const data = msg.data;

        return {
            title: data.title || "Untitled",
            content: data.content,
            timestamp: tx.updated_at || data.timestamp,
            sig: tx.signature,
        };
    }
    async loadBlogPostTransactions(key, peer) {
        let self = this
        this.app.storage.loadTransactions({ field1: 'Blog', field2: key, limit: 100 },
            function (txs) {
                const filteredTxs = self.filterBlogPosts(txs);
                const posts = self.convertTransactionsToPosts(filteredTxs);
                self.app.connection.emit('blog-update-widget', key, posts);
                console.log('transactions converted and emitted', posts);
            },
            peer.peerIndex)

    }

    async loadBlogPostTransactionsForWidget(key, callback, limit = 10,) {
        let self = this
        if (key === this.publicKey) {
            let peers = await this.app.network.getPeers();
            console.log(peers, "on peer service up")
            let peer = peers[0]
            this.app.storage.loadTransactions({ field1: 'Blog', field2: key, limit },
                function (txs) {
                    const filteredTxs = self.filterBlogPosts(txs);
                    console.log(filteredTxs, 'filtered transactions')
                    const posts = self.convertTransactionsToPosts(filteredTxs);
                    callback(posts)
                    console.log('posts gotten', posts);
                },
                peer.peerIndex)
        } else {
            this.app.storage.loadTransactions({ field1: 'Blog', field2: key, limit },
                function (txs) {
                    const filteredTxs = self.filterBlogPosts(txs);
                    console.log(filteredTxs, 'filtered transactions')
                    const posts = self.convertTransactionsToPosts(filteredTxs);
                    callback(posts)
                    console.log('posts gotten', posts);
                },
                key)
        }
    }



    filterBlogPosts(txs) {
        return txs.filter(tx => tx.returnMessage().data.type === 'blog_post').slice(0, 100);
    }

    async createBlogPostTransaction(post = {
        title: '',
        content: '',
        tags: [],
        timestamp: Date.now()
    }, callback) {

        let { title, content, tags, timestamp } = post
        console.log(title, content, tags, timestamp)
        try {
            // Create new transaction
            let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee(this.publicKey);

            // Validate and sanitize the post data
            const data = {
                type: 'blog_post',
                title: post.title || "Untitled",
                content: typeof post.content === 'string' ? post.content : JSON.stringify(post.content),
                tags: Array.isArray(post.tags) ? post.tags : [],
                timestamp: post.timestamp || Date.now()
            };

            // Set the transaction message
            newtx.msg = {
                module: this.name,
                request: 'create blog post request',
                data: data
            };

            await newtx.sign();

            await this.app.network.propagateTransaction(newtx);

            callback()
            return newtx;
        } catch (error) {
            console.error("Error creating blog transaction:", error);
            this.app.connection.emit("saito-header-update-message", {
                msg: "Error creating blog post",
                timeout: 2000
            });
            throw error;
        }
    }



    async saveBlogPostTransaction(tx, from) {
        try {
            let peers = await this.app.network.getPeers();
            let peer = peers[0];

            if (!peer) {
                console.error("No peers available to save blog transaction");
                return;
            }

            await this.app.storage.saveTransaction(tx, {
                field1: 'Blog',
            }, "localhost");

            return true;
        } catch (error) {
            console.error("Error saving blog transaction:", error);
            throw error;
        }
    }

    async updateBlogPostTransaction(signature, title, content) {
        try {

            let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee(this.publicKey);

            const data = {
                title,
                content,
                signature
            }

            newtx.msg = {
                module: this.name,
                request: 'update blog post request',
                data: data
            };

            // Sign the transaction
            await newtx.sign();
            await this.app.network.propagateTransaction(newtx);

        } catch (error) {
            console.error("Error updating blog transaction:", error);
            throw error;
        }
    }

    async receiveBlogPostTransaction(tx) {
        let from = tx?.from[0]?.publicKey;
        if (!from) {
            console.error("Blog: Invalid TX");
            return;
        }

        let txmsg = tx.returnMessage();
        console.log("BLOG POST: ", txmsg.data);

        if (!this.cache[from]) {
            this.cache[from] = {};
        }
        if (!this.cache[from].blogPosts) {
            this.cache[from].blogPosts = [];
        }
        let data = { ...txmsg.data, sig: tx.signature }
        this.cache[from].blogPosts.push(data);
        if (tx.isFrom(this.publicKey)) {
            this.app.connection.emit("saito-header-update-message", { msg: "" });
            siteMessage('Blog post published', 2000);
        }
        this.saveBlogPostTransaction(tx, from)
    }


    async receiveBlogPostUpdateTransaction(tx) {
        let from = tx?.from[0]?.publicKey;
        if (!from) {
            console.error("Blog: Invalid TX");
            return;
        }
        let txmsg = tx.returnMessage();
        console.log("BLOG UPDATE: ", txmsg.data);
        if (tx.isFrom(this.publicKey)) {
            this.app.connection.emit("saito-header-update-message", { msg: "" });
            siteMessage('Blog post updated', 2000);
        }

        let { signature, content, title } = txmsg.data;
        await this.app.storage.loadTransactions(
            { signature, field1: 'Blog' },
            async (txs) => {
                if (txs?.length > 0) {
                    let tx = txs[0];
                    console.log('loaded transaction to save', tx)
                    tx.msg.data.content = content;
                    tx.msg.data.title = title;
                    console.log(tx, 'after edit')
                    await this.app.storage.updateTransaction(tx, {}, 'localhost');
                }
            },
            'localhost'
        );
        return true;
    }
    async receiveBlogPostDeleteTransaction(tx) {
        let from = tx?.from[0]?.publicKey;
        if (!from) {
            console.error("Blog: Invalid TX");
            return;
        }
        let txmsg = tx.returnMessage();
        console.log("BLOG DELETE: ", txmsg.data);
        if (tx.isFrom(this.publicKey)) {
            this.app.connection.emit("saito-header-update-message", { msg: "" });
            siteMessage('Blog post deleted', 2000);
        }

        let { signature } = txmsg.data;
        await this.app.storage.loadTransactions(
            { signature, field1: 'Blog' },
            async (txs) => {
                if (txs?.length > 0) {
                    let tx = txs[0];
                    console.log('loaded transaction to delete', tx)
                    console.log(tx, 'after edit')
                    await this.app.storage.deleteTransaction(tx, {}, 'localhost');
                }
            },
            'localhost'
        );
        return true;
    }


    webServer(app, expressapp, express) {
        let webdir = `${__dirname}/../../mods/${this.dirname}/web`;
        let mod_self = this;

        expressapp.get(
            '/' + encodeURI(this.returnSlug()),
            async function (req, res) {
                let reqBaseURL = req.protocol + '://' + req.headers.host + '/';

                let updatedSocial = Object.assign({}, mod_self.social);

                updatedSocial.url = reqBaseURL + encodeURI(mod_self.returnSlug());

                res.setHeader('Content-type', 'text/html');
                res.charset = 'UTF-8';
                res.send(pageHome(app, mod_self, app.build_number, updatedSocial));
                return;
            }
        );

        expressapp.use(
            '/' + encodeURI(this.returnSlug()),
            express.static(webdir)
        );
    }

    async render() {
        this.header = new SaitoHeader(this.app, this);
        await this.header.initialize(this.app);
        this.addComponent(this.header);
        await super.render(this.app, this);

    }

    async loadPosts(author = null) {
        // if there is no author params or author is my key, load my own posts
        if (!author || author == this.publicKey) {
            this.app.browser.createReactRoot(BlogWidget, { app: this.app, mod: this, publicKey: this.publicKey, topMargin: true }, `blog-widget-${Date.now()}`)
        }

        if (author && author !== this.publicKey) {
            this.app.browser.createReactRoot(BlogWidget, { app: this.app, mod: this, publicKey: author, topMargin: true }, `blog-widget-${Date.now()}`)
        }



    }


    async loadSinglePost(postId, author) {
        let peer;
        if (this.publicKey === author) {
            let p = (await this.app.network.getPeers())[0];
            peer = p.peerIndex
        } else {
            peer = author
        }
        try {
            let self = this;
            this.app.storage.loadTransactions(
                { field1: 'Blog', signature: postId },
                function (txs) {
                    const filteredTxs = self.filterBlogPosts(txs);
                    console.log('gotten single post', filteredTxs)
                    const targetTx = filteredTxs.find(tx => tx.signature === postId);
                    if (targetTx) {
                        let public_key = targetTx.from[0].publicKey;
                        console.log(targetTx)
                        const post = self.convertTransactionToPost(targetTx);

                        self.app.browser.createReactRoot(BlogPostDetail, { post, app: self.app, mod: self, publicKey: public_key, topMargin:true, ondelete:()=> {
                            const baseUrl = window.location.origin;
                            window.location.href = `${baseUrl}/blog`;
                        } }, `blog-post-detail-${Date.now()}`)

                    } else {
                        console.error('Post not found');
                        self.loadPosts();
                    }
                },
                peer
            );
        } catch (error) {
            console.error('Error loading single post:', error);
            self.loadPosts(); // Fallback to main view
        }
    }

    async deleteBlogPost(postId) {
        try {
            let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee(this.publicKey);
            const data = {
                signature: postId
            }

            newtx.msg = {
                module: this.name,
                request: 'delete blog post request',
                data: data
            };

            // Sign the transaction
            await newtx.sign();
            await this.app.network.propagateTransaction(newtx);

        } catch (error) {
            console.error("Error deleting blog transaction:", error);
            throw error;
        }
    }

}

module.exports = Blog