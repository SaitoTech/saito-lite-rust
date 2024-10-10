const { default: Transaction } = require("saito-js/lib/transaction");
const SaitoHeader = require("../../lib/saito/ui/saito-header/saito-header");
const ModTemplate = require("../../lib/templates/modtemplate");
const pageHome = require('./index');
const BlogMain = require("./lib/blogMain");

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



    async initialize(app) {
        if (app.BROWSER === 0) {
            let key = "h7aNzZAN2HJTDUvayRDv6LXgx5qcdRs3swEM6HvmPomg"
            await this.loadBlogTransactions(key)
        }
    }


    async onPeerServiceUp(app, peer, service) {
        if (service.service === "archive") {
            this.peers.push(peer)
            // this.loadBlogTransactions()
        }
    }



    async onPeerHandshakeComplete(app) {
    }

    async loadOlderBlogTransactions() {
        let peer = this.peers[0]
        // console.log(peer.peerIndex,  await this.app.wallet.getPublicKey());
        // let publicKey = await this.app.wallet.getPublicKey()
        let publicKey = "mynWa9dNFxomcWyQg2vCdnC86TEausDJRcwJx4s81cb7"
        // let publicKeyToFetchFrom = peer.publicKey;
        let publicKeyToFetchFrom = "pLHgNKt9UHq4JhbtwQhQbPJY9A12648UYgRQb5htuNGp"
        this.fetchTransactionsFromPeer(peer, publicKey, publicKeyToFetchFrom, true);
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
                console.log('Unknown request type:', request);
        }
    }

    async handleBlogHistoryRequest(data, peer, mycallback, tx) {
        const { publicKey, publicKeyToFetchFrom } = data;
        const myPublicKey = await this.app.wallet.getPublicKey();
        console.log(data, 'data')
        
        if(tx.from[0].publicKey === myPublicKey) return;
        if (publicKeyToFetchFrom === myPublicKey) {
            if(this.app.BROWSER === 1){
                const peers = await this.app.network.getPeers();
                const targetPeer = peers[0];
                let internalCallBack = (txs) => {
                    console.log('internal callback', txs)
            }
                this.fetchTransactionsFromPeer(targetPeer, publicKey, targetPeer.publicKey, false, internalCallBack);
            }else {
                await this.fetchLocalBlogHistory(publicKey, mycallback);
            }
        } else {
            if(this.app.BROWSER === 1){
                // this is a browser node
                const peers = await this.app.network.getPeers();
                const targetPeer = peers[0];
                let internalCallBack = (txs) => {
                    console.log('internal callback', txs)
            }
                this.fetchTransactionsFromPeer(targetPeer, publicKey, targetPeer.publicKey, false, internalCallBack);
            }else {
                // this is the server node and needs to search for all peers
                const peers = await this.app.network.getPeers();
                const targetPeer = peers.find(p => p.publicKey === publicKeyToFetchFrom) || peer;
                this.fetchTransactionsFromPeer(targetPeer, publicKey, targetPeer.publicKey, false);


                // await this.fetchLocalBlogHistory(publicKey, mycallback);
                // const peers = await this.app.network.getPeers();
            }
   
            // const targetPeer = peers.find(p => p.publicKey === publicKeyToFetchFrom) || peer;

            
           
            // this.fetchTransactionsFromS(publicKey, mycallback);
        }
    }

    async fetchLocalBlogHistory(publicKey, mycallback) {
        await this.app.storage.loadTransactions(
            { field1: 'Blog', field2: publicKey, limit: 100 },
            (txs) => {
                const filteredTxs = this.filterBlogPosts(txs);
                this.txs = filteredTxs;
                mycallback(this.txs);
            },
            "localhost"
        );
    }

    // async handleBlogHistoryFetch(data, app, peer, mycallback) {
    //     if (app.BROWSER === 0) {
    //         await this.fetchLocalBlogHistory(data.publicKey, mycallback);
    //     } else if (app.BROWSER === 1) {
    //         // For browser, we directly fetch from the server
    //         this.fetchTransactionsFromServer(data.publicKey, mycallback);
    //     }
    // }

    async fetchTransactionsFromServer(publicKey, mycallback) {
        // Assuming the first peer is always the server
        let peers = await this.app.network.getPeers();
        const serverPeer = peers[0];
        console.log(serverPeer.publicKey, 'serverpublickey' )
        let msg = {
            request: 'blog history',
            publicKey,
            publicKeyToFetchFrom: serverPeer.publicKey, // We're fetching from the server
        };
        this.app.network.sendRequestAsTransaction(
            'blog history',
            msg,
            (txs) => {
                console.log(txs, 'found transactions from server');
                if(mycallback){
                    mycallback(txs);
                }
            },
            serverPeer.peerIndex
        );
    }

    fetchTransactionsFromPeer(peer, publicKey, publicKeyToFetchFrom, fetchFromPublicKey = false, mycallback) {
        console.log('loading public key', publicKey);
        let msg = {
            request: 'blog history',
            publicKey,
            publicKeyToFetchFrom,
        };
        this.app.network.sendRequestAsTransaction(
            'blog history',
            msg,
            (txs) => {
                console.log(txs, 'found transactions');
                if(mycallback){
                    mycallback(txs);
                }
            },
            peer.peerIndex
        );
    }

    filterBlogPosts(txs) {
        return txs.filter(tx => tx.returnMessage().data.type === 'blog_post').slice(0, 100);
    }

    async createBlogTransaction(content, title = '', tags = []) {
        this.app.connection.emit("saito-header-update-message", { msg: "broadcasting blog post" });
        let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee(this.publicKey);

        const data = {
            type: 'blog_post',
            title: title,
            content: JSON.stringify(content),
            tags: tags,
            timestamp: Date.now(),
        };

        newtx.msg = {
            module: this.name,
            request: 'create blog post request',
            data: data
        };
        await newtx.sign();
        if (!this.cache[this.publicKey]) {
            this.cache[this.publicKey] = {};
        }
        if (!this.cache[this.publicKey].blogPosts) {
            this.cache[this.publicKey].blogPosts = [];
        }

        this.cache[this.publicKey].blogPosts.push(data);

        this.app.connection.emit('blog-update-dom', this.publicKey, this.cache[this.publicKey].blogPosts);

        // Propagate the transaction
        await this.app.network.propagateTransaction(newtx);
        return newtx;
    }



    async loadBlogTransactions(key, limit = 100) {
        let loadedPosts = 0;
        await this.app.storage.loadTransactions(
            { field1: 'Blog', field2: key, limit: 100 },
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
            },
            "localhost"
        );

    }

    async saveBlogTransaction(tx, key) {
        await this.app.storage.saveTransaction(tx,
            { field1: 'Blog', field2: key },
            'localhost'
        );
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
        await this.saveBlogTransaction(tx, from);


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

        // // Check for URL param (since that is the prime use case)  

        this.header = new SaitoHeader(this.app, this);
        await this.header.initialize(this.app);
        this.main = new BlogMain(this.app, this)
        this.addComponent(this.main);
        this.addComponent(this.header);

        await super.render(this.app, this);
    }




}

module.exports = Blog