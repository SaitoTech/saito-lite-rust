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
        let publicKey = "tW6qFqg66MekMWQpiCZJBK7VVevy4aYum6W2Lu4euXKw"
        let publicKeyToFetchFrom = "tW6qFqg66MekMWQpiCZJBK7VVevy4aYum6W2Lu4euXKw"
        this.fetchTransactionsFromPeer(peer, publicKey, publicKeyToFetchFrom, true)
    }


    fetchTransactionsFromPeer(peer, publicKey, publicKeyToFetchFrom, fetchFromPublicKey = false, mycallback) {
        console.log('loading public key', publicKey)
        let msg = {
            request: 'blog history',
            publicKey,
            publicKeyToFetchFrom,
        };
        this.app.network.sendRequestAsTransaction(
            'blog history',
            msg,
            (txs) => {
                console.log(txs, 'found transactions')
                if(mycallback){
                    mycallback(txs);
                }
           
            },
            peer.peerIndex
        );
    }

    async handlePeerTransaction(app, tx = null, peer, mycallback) {
        if (tx == null) {
            return 0;
        }
        console.log(tx)
        let txmsg = tx.returnMessage();
        if (txmsg.request === 'blog history') {
            let publicKey = txmsg.data.publicKey;
            let publicKeyToFetchFrom = txmsg.data.publicKeyToFetchFrom;

            console.log('Blog history request for: ', peer.publicKey, peer.peerIndex, txmsg);
            let peers = await this.app.network.getPeers();
            let peer_value;
            let myPublicKey = await this.app.wallet.getPublicKey();
            console.log(myPublicKey, "my public key");
            let from = tx.from[0];

            console.log('transaction from ', from);

            // 
            if (publicKeyToFetchFrom === myPublicKey) {
                // local fetching 
                peer_value = "localhost"
                await this.app.storage.loadTransactions(
                    { field1: 'Blog', field2: publicKey, limit: 100 },
                    async (txs) => {
                        console.log(txs, 'loadingblogTx')
                        let loadedPosts = 0;
                        let limit = 100;
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
                        mycallback(this.txs);
                    },
                    peer_value
                );


            }
            else if (publicKeyToFetchFrom !== myPublicKey) {
                // remote fetch
                peers.forEach(peer => {
                    if (peer.publicKey === publicKey) {
                        peer_value = peer;
                    }
                })
                console.log(peer_value, "peer value");
                let msg = {
                    request: "blog history fetch",
                    publicKey: txmsg.data.publicKey,
                    from,
                }
                const callbackWrapper = (txs) => {
                    console.log("Received blog history:", txs);
                    mycallback(txs);
                };
                this.app.network.sendRequestAsTransaction('blog history fetch', msg, callbackWrapper, peer_value.peerIndex);

            } else {
                await this.app.storage.loadTransactions(
                    { field1: 'Blog', field2: publicKey, limit: 100 },
                    async (txs) => {
                        console.log(txs, 'loadingblogTx')
                        let loadedPosts = 0;
                        let limit = 100;
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
                        mycallback(this.txs);
                    },
                    "localhost"
                );

            }



        }
        if (txmsg.request === 'blog history fetch') {
            if (app.BROWSER === 0) {
                let publicKey = txmsg.data.publicKey;
                // let public = this.publicKey
                console.log('current public key', publicKey);
                // let msg = {
                //     publicKey: txmsg.data.publicKey,
                //     fetchFromPublicKey: false
                // }
                await this.app.storage.loadTransactions(
                    { field1: 'Blog', field2: publicKey, limit: 100 },
                    async (txs) => {
                        console.log(txs, 'blockhistoryfetch: ', txs);
                        let loadedPosts = 0;
                        let limit = 100;
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
                        mycallback(this.txs);
                    },
                    "localhost"
                );

            }

            if (app.BROWSER === 1) {
                let peer = this.peers[0]
                let from = txmsg.data.from
                // console.log(peer.peerIndex,  await this.app.wallet.getPublicKey());
                // let publicKey = await this.app.wallet.getPublicKey()
                let publicKey = "tW6qFqg66MekMWQpiCZJBK7VVevy4aYum6W2Lu4euXKw"
                // let publicKeyToFetchFrom = "tW6qFqg66MekMWQpiCZJBK7VVevy4aYum6W2Lu4euXKw"
                let mycallback = (txs)=> {
                    console.log('send response transaction', txs)

                }

                this.fetchTransactionsFromPeer(peer, publicKey, null, false, mycallback)
            }


            // mycallback(['daviks'])
            // this.app.network.sendRequestAsTransaction(
            //     'blog history',
            //     msg,
            //     (txs) => {
            //      console.log("Fetched blog history:", txs);

            //     },
            //     peer.peerIndex
            // );
        }
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