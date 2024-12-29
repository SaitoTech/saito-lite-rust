

const { default: Transaction } = require("saito-js/lib/transaction");
const SaitoHeader = require("../../lib/saito/ui/saito-header/saito-header");
const ModTemplate = require("../../lib/templates/modtemplate");
const pageHome = require('./index');
const React = require('react');
const { default: BlogPost } = require("./lib/react-components/blog-post");
const { default: BlogLayout } = require("./lib/react-components/blog-layout");
const markdownPage = require("./markdown.js");

class Blog extends ModTemplate {
    constructor(app) {
        super(app);
        this.app = app;
        this.name = 'Blog';
        this.slug = 'blog';
        this.description = 'Blog Module';
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

        this.callbackAfterPost = null
        this.callBackAfterDelete = null

        this.styles = ['/saito/saito.css', '/blog/style.css'];

        this.postsCache = {
            byUser: new Map(),
            lastFetch: new Map(),
            allPosts: [],
            lastAllPostsFetch: 0,
            deletedPosts: new Set() 
        };
        this.CACHE_TIMEOUT = 10000;
        this.limit = 20
    }

    async installModule(app) {
        // super.installModule(app);
        // this.processBlogPosts();
    }


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




    async loadBlogPostForUser(key, callback, useCache, limit = 20) {
        // Check cache first
        const cachedPosts = this.postsCache.byUser.get(key) || [];
        const lastFetch = this.postsCache.lastFetch.get(key) || 0;
        const isCacheValid = Date.now() - lastFetch < this.CACHE_TIMEOUT;

        if (useCache) {
            if (cachedPosts.length > 0 && isCacheValid) {
                console.log('Using cached posts for user:', key);
                callback(cachedPosts);
                return;
            }

        }


        try {
            let peers = await this.app.network.getPeers();
            let peer = peers[0];

            this.app.storage.loadTransactions(
                { field1: 'Blog', field2: key, limit: this.limit },
                (txs) => {
                    const filteredTxs = this.filterBlogPosts(txs);
                    const posts = this.convertTransactionsToPosts(filteredTxs);
                    const updatedPosts = this.updateCache(key, posts);
                    callback(updatedPosts);
                },
                peer
            );
        } catch (error) {
            console.error("Error loading posts for user:", error);
            callback(cachedPosts);
        }
    }

    async loadAllPostsFromKeys(keys, callback = null, useCache) {
        if (useCache) {
            const isCacheValid = Date.now() - this.postsCache.lastAllPostsFetch < this.CACHE_TIMEOUT;
            if (this.postsCache.allPosts.length > 0 && isCacheValid) {
                console.log('Using cached all posts');
                if (callback) callback(this.postsCache.allPosts);
                return this.postsCache.allPosts;
            }
        }

        try {
            let peers = await this.app.network.getPeers();
            let peer = peers[0];
            const loadPromises = keys.map(key =>
                new Promise((resolve) => {
                    this.app.storage.loadTransactions(
                        { field1: 'Blog', field2: key, limit: this.limit },
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

    async loadAllBlogPosts(callback, useCache = false, limit = 20) {
        if (useCache) {
            const isCacheValid = Date.now() - this.postsCache.lastAllPostsFetch < this.CACHE_TIMEOUT;
            if (this.postsCache.allPosts.length > 0 && isCacheValid) {
                console.log('Using cached all posts');
                if (callback) callback(this.postsCache.allPosts);
                return;
            }
        }

        try {
            let peers = await this.app.network.getPeers();
            let peer = peers[0];
            this.app.storage.loadTransactions(
                { field1: 'Blog', limit: this.limit },
                (txs) => {
                    console.log(txs)
                    const filteredTxs = this.filterBlogPosts(txs);
                    const posts = this.convertTransactionsToPosts(filteredTxs);
           
                    this.postsCache.allPosts = posts;
                    this.postsCache.lastAllPostsFetch = Date.now();

                    if (callback) callback(posts);
                },
                peer
            );
        } catch (error) {
            console.error("Error loading all blog posts:", error);
            // If error, return empty array through callback
            if (callback) callback([]);
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
                publicKey: tx.from[0].publicKey,
                imageUrl: data.imageUrl
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
            publicKey: tx.from[0].publicKey,
            image: data.image,
            imageUrl: data.imageUrl
        };
    }
    async loadBlogPostTransactions(key, peer) {
        let self = this
        this.app.storage.loadTransactions({ field1: 'Blog', field2: key, limit: this.limit },
            function (txs) {
                const filteredTxs = self.filterBlogPosts(txs);
                const posts = self.convertTransactionsToPosts(filteredTxs);
                self.app.connection.emit('blog-update-widget', key, posts);
            },
            peer.peerIndex)

    }




    filterBlogPosts(txs) {
        return txs.filter(tx => tx.returnMessage().data.type === 'blog_post');
    }

    async createBlogPostTransaction(post = {
        title: '',
        content: '',
        image: "",
        tags: [],
        timestamp: Date.now(),
        imageUrl: ""
    }, callback) {

        let { title, content, tags, timestamp, image, imageUrl } = post
        try {
            // Create new transaction
            let newtx = '';
            newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee(this.publicKey);



            // Validate and sanitize the post data
            const data = {
                type: 'blog_post',
                title: post.title || "Untitled",
                content: typeof post.content === 'string' ? post.content : JSON.stringify(post.content),
                tags: Array.isArray(post.tags) ? post.tags : [],
                image,
                timestamp: post.timestamp || Date.now(),
                imageUrl
            };

            // Set the transaction message
            newtx.msg = {
                module: this.name,
                request: 'create blog post request',
                data: data
            };


            await newtx.sign();

            await this.app.network.propagateTransaction(newtx);
            if (callback) {
                this.callbackAfterPost = callback;
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
                return;
            }
            await this.app.storage.saveTransaction(tx, {
                field1: 'Blog',
            }, "localhost");

            this.runCallBackAfterPost()

            return true;
        } catch (error) {
            console.error("Error saving blog transaction:", error);
            throw error;
        }
    }

    async updateBlogPostTransaction(signature, title, content, tags, image, imageUrl, callback) {
        try {

            let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee(this.publicKey);

            const data = {
                title,
                content,
                signature,
                content,
                tags,
                image,
                imageUrl
            }

            newtx.msg = {
                module: this.name,
                request: 'update blog post request',
                data: data
            };

            if (callback) {
                this.callbackAfterPost = callback
            }

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
            siteMessage('Blog post published', 1500);
        }

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

        let { signature, content, title, tags, image, imageUrl } = txmsg.data;
        await this.app.storage.loadTransactions(
            { signature, field1: 'Blog' },
            async (txs) => {
                if (txs?.length > 0) {
                    let tx = txs[0];
                    tx.msg.data.content = content;
                    tx.msg.data.title = title;
                    tx.msg.data.image = image,
                        tx.msg.data.tags = tags,
                        tx.msg.data.imageUrl = imageUrl,

                        await this.app.storage.updateTransaction(tx, {}, 'localhost');
                }
            },
            'localhost'
        );

        this.runCallBackAfterPost()
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

        this.postsCache.deletedPosts.add(signature);

        await this.app.storage.loadTransactions(
            { signature, field1: 'Blog' },
            async (txs) => {
                if (txs?.length > 0) {
                    let tx = txs[0];
                    await this.app.storage.deleteTransaction(tx, {}, 'localhost');
                }
            },
            'localhost'
        );
        if (this.callBackAfterDelete) {
            this.callBackAfterDelete();
            this.callBackAfterDelete = null
        }
        return true;
    }


    // async fetchAllBlogPosts() {
    //     try {
    //         const self = this;
    //         const BATCH_SIZE = 3;

    //         return new Promise((resolve, reject) => {
    //             let processedCount = 0;
    //             const processBatch = () => {
    //                 this.app.storage.loadTransactions(
    //                     {
    //                         field1: 'Blog',
    //                         limit: BATCH_SIZE,
    //                         offset: processedCount
    //                     },
    //                     function (transactions) {
    //                         const filteredPosts = self.filterBlogPosts(transactions);
    //                         processedCount += transactions.length;
    //                         const isLastBatch = transactions.length < BATCH_SIZE;

    //                         resolve({
    //                             posts: filteredPosts,
    //                             isComplete: isLastBatch,
    //                             nextBatchStartIndex: processedCount
    //                         });
    //                     },
    //                     'localhost'
    //                 );
    //             };

    //             processBatch();
    //         });
    //     } catch (error) {
    //         console.error("Error in fetchAllBlogPosts:", error);
    //         throw error;
    //     }
    // }




    async processBlogPosts() {
        try {
            let isComplete = false;
            let processedCount = 0;
            while (!isComplete) {
                const result = await this.fetchAllBlogPosts();

                for (const post of result.posts) {
                    await this.app.network.propagateTransaction(post);
                }
                if (!result.isComplete) {
                    await new Promise(resolve => setTimeout(resolve, 3000));
                }
                isComplete = result.isComplete;
                processedCount = result.nextBatchStartIndex;
            }
            console.log(`Finished processing ${processedCount} blog posts`);

        } catch (error) {
            console.error("Error processing blog posts:", error.message);
        }
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

        expressapp.get(
            '/' + encodeURI(this.returnSlug()) + '/markdown',
            async function (req, res) {
                let reqBaseURL = req.protocol + '://' + req.headers.host + '/';
                res.setHeader('Content-type', 'text/html');
                res.charset = 'UTF-8';
                res.send(markdownPage(app, mod_self, app.build_number, mod_self.social));
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
        this.app.browser.createReactRoot(BlogLayout, { app: this.app, mod: this, publicKey: author, topMargin: true }, `blog-layout-${Date.now()}`)

    }


    async loadSinglePost(postId, author) {
        let peer = (await this.app.network.getPeers())[0];

        // if (this.publicKey === author) {
            
        // } else {
        //     peer = author
        // }
        try {
            let self = this;
            this.app.storage.loadTransactions(
                { field1: 'Blog', signature: postId },
                function (txs) {
                    const filteredTxs = self.filterBlogPosts(txs);
                    const targetTx = filteredTxs.find(tx => tx.signature === postId);
                    if (targetTx) {
                        let public_key = targetTx.from[0].publicKey;
                        const post = self.convertTransactionToPost(targetTx);

                        self.app.browser.createReactRoot(BlogLayout, {
                            post, app: self.app, mod: self, publicKey: public_key, topMargin: true, ondelete: () => {
                                const baseUrl = window.location.origin;
                                window.location.href = `${baseUrl}/blog`;
                            }
                        }, `blog-post-detail-${Date.now()}`)

                    } else {
                        console.error('Post not found');
                        self.loadPosts();
                    }
                },
                peer
            );
        } catch (error) {
            console.error('Error loading single post:', error);
            self.loadPosts();
        }
    }

    async deleteBlogPost(sig, callback) {
        try {
            let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee(this.publicKey);
            const data = {
                signature: sig
            }

            console.log('post data', data)

            newtx.msg = {
                module: this.name,
                request: 'delete blog post request',
                data: data
            };

            if (callback) {
                this.callBackAfterDelete = callback;
            }
            // Sign the transaction
            await newtx.sign();
            await this.app.network.propagateTransaction(newtx);


        } catch (error) {
            console.error("Error deleting blog transaction:", error);
            throw error;
        }
    }

    runCallBackAfterPost() {
        if (this.callbackAfterPost) {
            this.callbackAfterPost()
            this.callbackAfterPost = null
        }
    }

}

module.exports = Blog
