const { default: Transaction } = require("saito-js/lib/transaction");
const SaitoHeader = require("../../lib/saito/ui/saito-header/saito-header");
const ModTemplate = require("../../lib/templates/modtemplate");
const pageHome = require('./index');
const React = require('react');
const { default: BlogPost } = require("./lib/react-components/blog-post");
const { default: BlogLayout } = require("./lib/react-components/blog-layout");

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

        this.postsCache = {
            byUser: new Map(), 
            lastFetch: new Map(), 
            allPosts: [], 
            lastAllPostsFetch: 0 
        };

         // Cache timeout (10 seconds)
         this.CACHE_TIMEOUT = 10000;

        //  app.connection.on('blog-update-widget', () => {
        //      console.log('blog-update-widget');
        //      this.clearCache();
        //  });




    }

    // clearCache() {
    //     this.postsCache.byUser.clear();
    //     this.postsCache.lastFetch.clear();
    //     this.postsCache.allPosts = [];
    //     this.postsCache.lastAllPostsFetch = 0;
    // }

    updateCache(key, posts) {
        const existingPosts = this.postsCache.byUser.get(key) || [];
        
        const allPosts = [...posts];
        existingPosts.forEach(existingPost => {
            if (!allPosts.some(p => p.sig === existingPost.sig)) {
                allPosts.push(existingPost);
            }
        });

        allPosts.sort((a, b) => b.timestamp - a.timestamp);

        this.postsCache.byUser.set(key, allPosts);
        this.postsCache.lastFetch.set(key, Date.now());

        return allPosts;
    }

    async loadBlogPostForUser(key, callback, limit = 10) {
        // Check cache first
        const cachedPosts = this.postsCache.byUser.get(key) || [];
        const lastFetch = this.postsCache.lastFetch.get(key) || 0;
        const isCacheValid = Date.now() - lastFetch < this.CACHE_TIMEOUT;

        if (cachedPosts.length > 0 && isCacheValid) {
            console.log('Using cached posts for user:', key);
            callback(cachedPosts.slice(0, limit));
            return;
        }

        try {
            const peer = key === this.publicKey 
                ? (await this.app.network.getPeers())[0]?.peerIndex
                : key;

            this.app.storage.loadTransactions(
                { field1: 'Blog', field2: key, limit: 100 },
                (txs) => {
                    const filteredTxs = this.filterBlogPosts(txs);
                    const posts = this.convertTransactionsToPosts(filteredTxs);
                    const updatedPosts = this.updateCache(key, posts);
                    callback(updatedPosts.slice(0, limit));
                },
                peer
            );
        } catch (error) {
            console.error("Error loading posts for user:", error);
            callback(cachedPosts.slice(0, limit));
        }
    }

    async loadAllPosts(keys, callback = null) {
        const isCacheValid = Date.now() - this.postsCache.lastAllPostsFetch < this.CACHE_TIMEOUT;
        if (this.postsCache.allPosts.length > 0 && isCacheValid) {
            console.log('Using cached all posts');
            if (callback) callback(this.postsCache.allPosts);
            return this.postsCache.allPosts;
        }

        try {
            const loadPromises = keys.map(key => 
                new Promise((resolve) => {
                    const peer = key === this.publicKey 
                        ? "localhost"
                        : key;

                    this.app.storage.loadTransactions(
                        { field1: 'Blog', field2: key, limit: 100 },
                        (txs) => {
                            const filteredTxs = this.filterBlogPosts(txs);
                            const posts = this.convertTransactionsToPosts(filteredTxs);
                            this.updateCache(key, posts);
                            resolve(posts);
                        },
                        peer
                    );
                })
            );

            const postsArrays = await Promise.all(loadPromises);
            const allPosts = postsArrays
                .flat()
                .sort((a, b) => b.timestamp - a.timestamp);

            // Update all posts cache
            this.postsCache.allPosts = allPosts;
            this.postsCache.lastAllPostsFetch = Date.now();

            if (callback) callback(allPosts);
            return allPosts;
        } catch (error) {
            console.error("Error loading all posts:", error);
            if (callback) callback([]);
            return [];
        }
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


    async onPeerServiceUp(app, peer, service = {}) {
        console.log('peer service up', service.service);
        let self = this
        if (service.service === 'archive') {
            if (this.browser_active) {
                // Get post_id from URL parameters
                const urlParams = new URLSearchParams(window.location.search);
                const postId = urlParams.get('tx_id');
                const author = urlParams.get('public_key')

                if (postId && author) {
                    // Load specific post
                    await this.loadSinglePost(postId, author);
                }
                else {
                    // Load post by author
                    this.loadPosts(this.publicKey);
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
                image: data.image,
                timestamp: tx.updated_at || data.timestamp,
                sig: tx.signature,
                publicKey: data.publisher
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
            publicKey: data.publisher,
            image: data.image
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




    filterBlogPosts(txs) {
        return txs.filter(tx => tx.returnMessage().data.type === 'blog_post').slice(0, 100);
    }

    async createBlogPostTransaction(post = {
        title: '',
        content: '',
        image: "",
        tags: [],
        timestamp: Date.now(),
        publisher: ""
    }, callback) {

        let { title, content, tags, timestamp, image, publisher } = post
        console.log(title, content,image, tags, timestamp, publisher, "consoling")
        try {
            // Create new transaction
            let newtx = '';
            newtx  = await this.app.wallet.createUnsignedTransactionWithDefaultFee(this.publicKey);

        
        

            // Validate and sanitize the post data
            const data = {
                type: 'blog_post',
                title: post.title || "Untitled",
                content: typeof post.content === 'string' ? post.content : JSON.stringify(post.content),
                tags: Array.isArray(post.tags) ? post.tags : [],
                image,
                timestamp: post.timestamp || Date.now(),
                publisher: publisher || this.publicKey
            };

            // Set the transaction message
            newtx.msg = {
                module: this.name,
                request: 'create blog post request',
                data: data
            };

    
            await newtx.sign();

            await this.app.network.propagateTransaction(newtx);
            if(callback){
                callback()
            }
      
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
        console.log('from', tx.from)
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
        let publisher;

        console.log(txmsg.data, "data")


        this.saveBlogPostTransaction(tx)
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
              this.app.browser.createReactRoot(BlogLayout, { app: this.app, mod: this, publicKey: author, topMargin: true }, `blog-layout-${Date.now()}`)
        
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
                        console.log(post, 'post');

                        self.app.browser.createReactRoot(BlogLayout, { post, app: self.app, mod: self, publicKey: public_key, topMargin:true, ondelete:()=> {
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