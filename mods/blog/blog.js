const { default: Transaction } = require("saito-js/lib/transaction");
const SaitoHeader = require("../../lib/saito/ui/saito-header/saito-header");
const ModTemplate = require("../../lib/templates/modtemplate");
const pageHome = require('./index');
const BlogMain = require("./lib/blogMain");
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
            image: 'https://saito.tech/wp-content/uploads/2022/04/saito_card.png' //square image with "Saito" below logo
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
                await this.receiveBlogTransaction(tx);
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
            const selector = obj.container;
            console.log(obj, 'object')

            if (!selector) {
                console.error("A selector is needed for the blog widget");
                return;
            }
            let widget = new SaitoBlogWidget(this.app, this, selector)
            return widget
        }
    }

    // async initialize(app) {
    //     if (app.BROWSER === 0) {

    //     }
    // }


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
                else{
                     // Load post by author
                    this.loadPosts(author);
                }
            }
        }
    }

    async onPeerHandshakeComplete() {
        // if(this.app.BROWSER === 0){
        //     await this.loadBlogTransactions(this.publicKey);
        // }
        console.log('peer handshake complete')

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
    async loadBlogTransactions(key, peer) {
        let self = this
        this.app.storage.loadTransactions({ field1: 'Blog', field2: key, limit: 100 },
            function (txs) {
                const filteredTxs = self.filterBlogPosts(txs);
                const posts = self.convertTransactionsToPosts(filteredTxs);
                console.log('posts gotten', posts);
                self.app.connection.emit('blog-update-widget', key, posts);
                console.log('transactions converted and emitted', posts);
            },
            peer.peerIndex)

    }

    async loadBlogTransactionsForWidget(key, callback, limit = 10,) {
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
        }
    }




    async handlePeerTransaction(app, tx = null, peer, mycallback) {
        if (tx == null) return 0;

        const txmsg = tx.returnMessage();
        const { request, data } = txmsg;

        switch (request) {
            case 'blog history':
                await this.handleBlogHistoryRequest(data, peer, mycallback, tx);
                break;
            // case 'blog history fetch':
            //     await this.handleBlogHistoryFetch(data, app, peer, mycallback);
            //     break;
            default:
                console.log('Unknown request type:', request, txmsg, mycallback);
        }
    }

    async handleBlogHistoryRequest(data, peer, mycallback, tx) {
        const { publicKey, publicKeyToFetchFrom } = data;
        const myPublicKey = await this.app.wallet.getPublicKey();
        console.log(data, 'data')

        console.log(this.app.options, 'returned keys');
        this.fetchTransactionsFromPeer(publicKeyToFetchFrom, publicKey, false);


        // if(tx.from[0].publicKey === myPublicKey) return;
        // if (publicKeyToFetchFrom === myPublicKey) {
        //     if(this.app.BROWSER === 1){
        //         const peers = await this.app.network.getPeers();
        //         const targetPeer = peers[0];
        //         let internalCallBack = (txs) => {
        //             console.log('internal callback', txs)
        //     }
        //         this.fetchTransactionsFromPeer(targetPeer, publicKey, targetPeer.publicKey, false, internalCallBack);
        //     }else {
        //         await this.fetchLocalBlogHistory(publicKey, mycallback);
        //     }
        // } else {
        //     if(this.app.BROWSER === 1){
        //         // this is a browser node
        //         const peers = await this.app.network.getPeers();
        //         const targetPeer = peers[0];
        //         let internalCallBack = (txs) => {
        //             console.log('internal callback', txs)
        //     }
        //         this.fetchTransactionsFromPeer(targetPeer, publicKey, targetPeer.publicKey, false, internalCallBack);
        //     }else {
        //         // this is the server node and needs to search for all peers
        //         const peers = await this.app.network.getPeers();
        //         const targetPeer = peers.find(p => p.publicKey === publicKeyToFetchFrom) || peer;
        //         this.fetchTransactionsFromPeer(targetPeer, publicKey, targetPeer.publicKey, false);



        //     }

        // }
    }


    async fetchTransactionsFromPeer(peer, publicKey, mycallback = null) {
        await this.app.storage.loadTransactions(
            { field1: 'Blog', limit: 100 },
            async (txs) => {
                let txs_found = [];
                if (txs?.length > 0) {
                    for (let i = 0; i < txs.length && loadedPosts < limit; i++) {
                        let txmsg = txs[i].returnMessage();
                        if (txmsg.data.type === 'blog_post') {
                            txs_found.push(txs[i]);
                            loadedPosts++;
                        }
                    }
                }
                this.txs = txs_found;
                if (mycallback) {
                    mycallback(txs)
                }
            },
            peer
        );
    }

    filterBlogPosts(txs) {
        return txs.filter(tx => tx.returnMessage().data.type === 'blog_post').slice(0, 100);
    }

    async createBlogTransaction(post = {
        title: '',
        content: '',
        tags: [],
        timestamp: Date.now()
    }, callback) {

        let { title, content, tags, timestamp } = post
        console.log(title, content, tags, timestamp)
        try {
            // // Update UI to show broadcasting status
            // this.app.connection.emit("saito-header-update-message", { msg: "broadcasting blog post" });

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

            // Sign the transaction
            await newtx.sign();

            // await this.saveBlogTransaction(newtx);
            // Save and propagate the transaction

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



    async saveBlogTransaction(tx, from) {
        try {
            // Get first available peer
            let peers = await this.app.network.getPeers();
            let peer = peers[0];

            if (!peer) {
                console.error("No peers available to save blog transaction");
                return;
            }

            // Save the transaction to storage with metadata
            await this.app.storage.saveTransaction(tx, {
                field1: 'Blog',
            }, "localhost");

            return true;
        } catch (error) {
            console.error("Error saving blog transaction:", error);
            throw error;
        }
    }

    async receiveBlogTransaction(tx) {
        let from = tx?.from[0]?.publicKey;
        if (!from) {
            console.error("Blog: Invalid TX");
            return;
        }

        let txmsg = tx.returnMessage();
        console.log("BLOG UPDATE: ", txmsg.data);

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

        this.saveBlogTransaction(tx, from)





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
        // this.main = new BlogMain(this.app, this)
        // this.addComponent(this.main);
        this.addComponent(this.header);
        await super.render(this.app, this);
        // this.renderPost()


    }

    async loadPosts(author = null) {
        const widgetRoot = document.createElement('div');
        widgetRoot.id = `blog-widget-${Date.now()}`;
        document.body.appendChild(widgetRoot)

        // Initialize React
        let root = createRoot(widgetRoot);

        // if there is no author params or author is my key, load my own posts
        if(!author || author == this.publicKey){
            root.render(
                <BlogWidget
                    app={this.app}
                    mod={this}
                />
            );
        }
      
       

    }


    async loadSinglePost(postId, author) {
        let peer;
        if (this.publicKey === author) {
            let p =(await this.app.network.getPeers())[0];
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

                        // Create container and render the detail view
                        const container = document.createElement('div');
                        container.id = `blog-post-detail-${Date.now()}`;
                        document.body.appendChild(container);

                        // Initialize React with the post detail view
                        const root = createRoot(container);
                        root.render(
                            <BlogPostDetail
                                post={post} app={self.app} mod={self} publicKey={public_key}
                            />
                        );
                    } else {
                        console.error('Post not found');
                        // Optionally redirect to main blog page or show error
                        self.renderPost();
                    }
                },
                peer
            );
        } catch (error) {
            console.error('Error loading single post:', error);
            this.renderPost(); // Fallback to main view
        }
    }




}

module.exports = Blog