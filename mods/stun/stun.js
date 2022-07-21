const saito = require("./../../lib/saito/saito");
const ModTemplate = require("../../lib/templates/modtemplate");
const StunEmailAppspace = require('./lib/email-appspace/email-appspace');
const Slip = require('../..//lib/saito/slip.ts');
var serialize = require('serialize-javascript');

class Stun extends ModTemplate {

    constructor(app) {
        super(app);
        this.app = app;
        this.appname = "Stun";
        this.name = "Stun";
        this.description = "Session Traversal Utilitiesf for NAT (STUN)";
        this.categories = "Utility Networking";

        this.stun = {};
        this.peer_connections = {};
    }

    async initialize(app) {
        this.loadStun();

        let publickey = this.app.wallet.returnPublicKey();
        let key_index = this.app.keys.keys.findIndex(key => key.publickey === publickey);

        // save key if it doesnt exist
        if (key_index === -1) {
            this.app.keys.addKey(publickey);
            this.app.keys.saveKeys();
        }
        if (!this.app.keys.keys[key_index].data.stun) {
            this.app.keys.keys[key_index].data.stun = this.stun;
            this.app.keys.saveKeys();
        }
    }


    loadStun() {
        if (this.app.options.stun) {
            this.stun = this.app.options.invites;
            return;
        }

        // load default values for stun if not avl in local storage
        this.stun.ip_address = "";
        this.stun.port = "";
        this.stun.offer_sdp = "";
        this.stun.listeners = [];
        this.stun.pc = "";
        this.stun.iceCandidates = [];
        this.stun.counter = 0;
        this.stun.servers = [
            {
                urls: "stun:stun.davikstone.com:3478"
            },
            {
                urls: "turn:turn.davikstone.com:3478",
                username: "guest",
                credential: "somepassword",
            },
            // {
            //     urls: "stun:stun-sf.saito.io:3478"
            // },
            // {
            //     urls: "turn:stun-sf.saito.io:3478",
            //     username: "stun",
            //     credential: "stun123",
            // },
            //   {
            //     urls: "turn:openrelay.metered.ca:443",
            //     username: "openrelayproject",
            //     credential: "openrelayproject",
            //   },
            //   {
            //     urls: "turn:openrelay.metered.ca:443?transport=tcp",
            //     username: "openrelayproject",
            //     credential: "openrelayproject",
            //   },
        ];
    }

    saveStun() {
        this.app.options.stun = this.stun;
        this.app.options.saveOptions();
    }


    respondTo(type) {
        if (type === 'email-appspace') {
            return new StunEmailAppspace(this.app, this);
        }
        return null;
    }

    onConfirmation(blk, tx, conf, app) {
        if (conf == 0) {
            let txmsg = tx.returnMessage();
            let my_pubkey = app.wallet.returnPublicKey();

            if (txmsg.module === this.appname) {

                if (tx.msg.stun) {
                    // check if key exists in key chain
                    let key_index = this.app.keys.keys.findIndex((key) => key.publickey === tx.transaction.from[0].add);
                    console.log(key_index, "key index");

                    // save key if it doesn't exist
                    if (key_index === -1) {
                        this.app.keys.addKey(tx.transaction.from[0].add);
                        this.app.keys.saveKeys();
                    }
                    for (let i = 0; i < app.keys.keys.length; i++) {

                        if (tx.transaction.from[0].add === this.app.keys.keys[i].publickey) {
                            console.log(JSON.stringify(this.app.keys.keys[i].data.stun), JSON.stringify(tx.msg.stun))
                            if (JSON.stringify(this.app.keys.keys[i].data.stun) != JSON.stringify(tx.msg.stun)) {
                                let my_pubkey = app.wallet.returnPublicKey();
                                console.log("stun changed, saving changes..", tx.msg.stun);
                                this.app.keys.keys[i].data.stun = {
                                    ...tx.msg.stun
                                };

                                this.app.keys.saveKeys();

                            }

                        }
                    }

                    app.connection.emit("stun-update", app, this);
                }


                if (tx.msg.request === "answer") {
                    this.receiveAnswerTransaction(blk, tx, conf, app);
                }


                if (tx.msg.request === "offers") {
                    this.receiveOffersTransaction(blk, tx, conf, app);
                }


                if (tx.msg.request === "offer") {
                    this.receiveOfferTransaction(blk, tx, conf, app);
                }

                if (tx.msg.request === "broadcast_details") {
                    this.receiveBroadcastDetailsTransaction(blk, tx, conf, app);
                }

                if (tx.msg.request === "listeners") {
                    this.receiveSendKeyToListenersTransaction(blk, tx, conf, app);
                }
            }
        }
    }

    onPeerHandshakeComplete() {
        if (this.app.BROWSER === 0) {

            // browser instance's public key
            const instance_pubkey = this.app.network.peers[this.app.network.peers.length - 1].returnPublicKey();

            let newtx = this.app.wallet.createUnsignedTransaction();

            const pubKeys = [];
            this.app.network.peers.forEach(peer => {
                pubKeys.push(peer.returnPublicKey());
            })


            console.log('instance ', instance_pubkey, ' pubkeys ', pubKeys)
            // newtx.transaction.to.push(new saito.default.slip(instance_pubkey));

            newtx.msg.module = "Stun";
            newtx.msg.pubKeys = {
                pubKeys
            };

            newtx.msg = {
                module: this.appname,
                request: "listener",
                listeners: pubKeys,
                pubKeys
            };

            console.log(newtx.msg);

            newtx = this.app.wallet.signTransaction(newtx);
            this.app.network.propagateTransaction(newtx);

            let relay_mod = this.app.modules.returnModule('Relay');

            relay_mod.sendRelayMessage(instance_pubkey, 'get_public_keys', newtx);
        }

    }

    handlePeerRequest(app, req, peer, mycallback) {

        if (req.request == null) {
            return;
        }
        if (req.data == null) {
            return;
        }

        let tx = req.data;

        switch (req.request) {

            case "get_public_keys":

                console.log('got public keys: ', tx.msg.pubKeys);

                if (app.BROWSER !== 1) return;
                // create peer connection offers

                this.public_keys = tx.msg.pubKeys;
                app.options.public_keys = this.public_keys;
                app.storage.saveOptions();

                this.createPeerConnectionOffers(app, app.options.public_keys);
                break;

        }

    }


    async createPeerConnectionOffers(app, pubKeys) {
        let peerConnectionOffers = [];


        if (pubKeys.length > 1) {

            // send connection to other peers if they exit
            for (let i = 0; i < pubKeys.length; i++) {
                if (pubKeys[i] !== this.app.wallet.returnPublicKey()) {
                    peerConnectionOffers.push(this.createPeerConnectionOffer(app, pubKeys[i]));
                }
            }
        }

        try {
            peerConnectionOffers = await Promise.all(peerConnectionOffers);


            if (peerConnectionOffers.length > 0) {

                const offers = [];
                peerConnectionOffers.forEach((offer) => {
                    // map key to pc
                    console.log('offer :', offer)
                    this.peer_connections[offer.recipient] = offer.pc
                    offers.push({
                        ice_candidates: offer.ice_candidates,
                        offer_sdp: offer.offer_sdp,
                        recipient: offer.recipient,
                    })
                })

                // const offers = peerConnectionOffers.map(item => item.offer_sdp);

                this.sendOffersTransaction(this.app.wallet.returnPublicKey(), offers);
            } else {

                console.log("no pair to connect to");
            }

        } catch (error) {
            console.log('an error occurred with peer connection creation', error);
        }
    }


    createPeerConnectionOffer(app, publicKey) {


        const createPeerConnection = new Promise((resolve, reject) => {
            let ice_candidates = [];
            const execute = async () => {

                try {
                    const pc = new RTCPeerConnection({
                        iceServers: this.stun.servers,
                    });



                    pc.onicecandidate = (ice) => {
                        if (!ice || !ice.candidate || !ice.candidate.candidate) {

                            // pc.close();

                            let offer_sdp = pc.localDescription;
                            resolve({
                                recipient: publicKey,
                                offer_sdp,
                                ice_candidates,
                                pc
                            });
                            // this.broadcastIceCandidates(my_key, peer_key, ['savior']);

                            return;
                        } else {
                            ice_candidates.push(ice.candidate);
                        }

                    };

                    pc.onconnectionstatechange = e => {
                        console.log("connection state ", pc.connectionState)
                        switch (pc.connectionState) {


                            case "connected":

                                break;

                            case "disconnecting":

                                break;

                            default:
                                ""
                                break;
                        }
                    }



                    const data_channel = pc.createDataChannel('channel');
                    pc.dc = data_channel;
                    pc.dc.onmessage = (e) => {
                        console.log('new message from client : ', e.data);
                        this.receiveMesssage(e);

                    };
                    pc.dc.onopen = (e) => console.log("peer connection opened");

                    const offer = await pc.createOffer();
                    pc.setLocalDescription(offer);

                } catch (error) {
                    console.log(error);
                }

            }
            execute();

        })

        return createPeerConnection;

    }

    async updateKey(publicKey) {
        console.log('updating key');
        let newtx = this.app.wallet.createUnsignedTransaction();
        newtx.msg.module = "Stun";

        newtx = this.app.wallet.signTransaction(newtx);
        console.log(this.app.network);
        this.app.network.propagateTransaction(newtx);

    }

    transmitMessage(app, sender, msg, callback, recipients = null) {

        if (!recipients || recipients?.length === 0) {
            this.peer_connections.forEach(pc => {
                if (pc.connectionState === "connected") {
                    pc.dc.send({
                        from: sender,
                        msg: JSON.stringify(msg),
                        callback
                    })
                }
            })
        } else {
            recipients.forEach(recipient => {
                // check if exists 
                for (let i in this.peer_connections) {
                    if (i === recipient) {
                        this.peer_connections[i].dc.send({
                            from: sender,
                            msg: JSON.stringify(msg),
                            callback
                        })
                    }
                }
            })
        }
    }

    receiveMesssage(msg) {
        console.log(msg, " from ");
    }

    addListenersFromPeers(peers) {
        // only lite clients allowed to run this
        if (this.app.BROWSER === 0) return;
        console.log("adding peers as listeners ...");
        if (peers.length === 0) return console.log("No peers to add");

        let filteredListeners;

        // remove current istance public key
        filteredListeners = peers.filter(peer => peer !== this.app.wallet.returnPublicKey());

        // remove duplicates
        const seen = new Map();
        let filteredPeers = [];
        for (let i = 0; i < filteredListeners.length; i++) {
            if (!seen[filteredListeners[i]]) {
                seen[filteredListeners[i]] = 1;
                filteredPeers.push(filteredListeners[i]);

            } else {
                seen[filteredListeners[i]] += 1;
            }
        }
        console.log('filtered peers ', filteredPeers, ' seen ', seen);

        // save key if it doesnt exist
        let publickey = this.app.wallet.returnPublicKey();
        let key_index = this.app.keys.keys.findIndex(key => key.publickey === publickey);
        if (key_index === -1) {
            this.app.keys.addKey(publickey);
            this.app.keys.saveKeys();
        }
        if (!this.app.keys.keys[key_index].data.stun) {
            this.app.keys.keys[key_index].data.stun = this.stun;
            this.app.keys.saveKeys();

        }
        this.app.keys.keys[key_index].data.stun.listeners = filteredPeers;
        this.app.keys.saveKeys();
        // this.app.connection.emit('listeners-update', this.app, this.app.keys.keys[key_index].data.stun.listeners);
    }


    addListeners(listeners) {
        if (this.app.BROWSER === 0) return;
        console.log("adding listeners ...");
        if (listeners.length === 0) return console.log("No listeners to add");

        let publickey = this.app.wallet.returnPublicKey();
        let key_index = this.app.keys.keys.findIndex(key => key.publickey === publickey);

        // save key if it doesnt exist
        if (key_index === -1) {
            this.app.keys.addKey(publickey);
            this.app.keys.saveKeys();
        }
        if (!this.app.keys.keys[key_index].data.stun) {
            this.app.keys.keys[key_index].data.stun = this.stun;
            this.app.keys.saveKeys();

        }

        let validated_listeners;

        // check if key is valid
        validated_listeners = listeners.map(listener => listener.trim());
        validated_listeners = listeners.filter(listener => listener.length === 44);

        // filter out already existing keys
        validated_listeners = listeners.filter(listener => !this.app.keys.keys[key_index].data.stun.listeners.includes(listener));

        // this.sendKeyToListenersTransaction(validated_listeners);

        // add listeners to existing listeners
        this.app.keys.keys[key_index].data.stun.listeners = [...this.app.keys.keys[key_index].data.stun.listeners, ...validated_listeners];
        this.app.keys.saveKeys();
        this.app.connection.emit('listeners-update', this.app, this.app.keys.keys[key_index].data.stun.listeners);
    }


    sendKeyToListenersTransaction(listeners) {
        let newtx = this.app.wallet.createUnsignedTransaction();
        let from = this.app.wallet.returnPublicKey();
        console.log('Adding contacts :', listeners, " to ", from);

        for (let i = 0; i < listeners.length; i++) {
            newtx.transaction.to.push(new saito.default.slip(listeners[i]));
        }

        newtx.msg = {
            module: this.appname,
            request: "broadcast_details",
            listeners,
            from
        };
        newtx = this.app.wallet.signTransaction(newtx);

        this.app.network.propagateTransaction(newtx);

    }

    receiveSendKeyToListenersTransaction(blk, tx, conf, app) {
        this.addListenersFromPeers(tx.msg.listeners);
    }


    sendOfferTransaction(my_key, peer_key, offer) {
        let newtx = this.app.wallet.createUnsignedTransaction();
        console.log('broadcasting offer  to ', peer_key);
        newtx.transaction.to.push(new saito.default.slip(peer_key));
        console.log("offer ", offer);
        newtx.msg = {
            module: this.appname,
            request: "offer",
            peer_a: my_key,
            peer_b: peer_key,
            offer
        }
        console.log('new tx', newtx);
        newtx = this.app.wallet.signTransaction(newtx);
        console.log(this.app.network);
        this.app.network.propagateTransaction(newtx);
    }

    receiveOfferTransaction(blk, tx, conf, app) {
        let my_pubkey = app.wallet.returnPublicKey();
        console.log("offer received");
        if (my_pubkey === tx.msg.peer_b) {
            this.app.connection.emit('offer_received', tx.msg.peer_a, tx.msg.peer_b, tx.msg.offer);
        } else {
            console.log('tx peer key not equal');
        }
    }


    sendOffersTransaction(offer_creator, offers) {
        let newtx = this.app.wallet.createUnsignedTransaction();


        console.log('broadcasting offers now');
        for (let i = 0; i < offers.length; i++) {
            newtx.transaction.to.push(new saito.default.slip(offers[i].recipient));

        }

        console.log(offer_creator, offers)

        newtx.msg.module = "Stun";
        newtx.msg = {
            request: "offers",
            offer_creator,
            offers
        }

        newtx = this.app.wallet.signTransaction(newtx);
        console.log(this.app.network);
        this.app.network.propagateTransaction(newtx);
    }

    receiveOffersTransaction(blk, tx, conf, app) {
        if (app.BROWSER !== 1) return;

        let my_pubkey = app.wallet.returnPublicKey();

        const offer_creator = tx.msg.offer_creator;

        // offer creator should not respond
        if (my_pubkey === offer_creator) return;
        console.log("offers received from ", tx.msg.offer_creator, tx.msg);

        // check if current instance is a recipent
        const index = tx.msg.offers.findIndex(offer => offer.recipient === my_pubkey);

        if (index !== -1) {
            this.receiveOfferBroadcastAnswerTransaction(app, offer_creator, tx.msg.offers[index]);
        }
    }


    sendAnswerTransaction(answer_creator, offer_creator, reply) {
        let newtx = this.app.wallet.createUnsignedTransaction();
        console.log('broadcasting answer to ', offer_creator);
        newtx.transaction.to.push(new saito.default.slip(offer_creator));

        newtx.msg = {
            module: this.appname,
            request: "answer",
            answer_creator,
            offer_creator,
            reply: reply
        };
        newtx = this.app.wallet.signTransaction(newtx);

        this.app.network.propagateTransaction(newtx);
    }

    receiveAnswerTransaction(blk, tx, conf, app) {
        if (app.BROWSER !== 1) return;

        let my_pubkey = app.wallet.returnPublicKey();

        if (my_pubkey === tx.msg.offer_creator) {
            console.log("current instance: ", my_pubkey, " answer room: ", tx.msg);
            console.log("peer connections: ", this.peer_connections, this);
            const reply = tx.msg.reply;

            if (this.peer_connections[tx.msg.answer_creator]) {
                this.peer_connections[tx.msg.answer_creator].setRemoteDescription(reply.answer).then(result => {
                    console.log('setting remote description of ', this.peer_connections[tx.msg.answer_creator]);

                }).catch(error => console.log(" An error occured with setting remote description for :", this.peer_connections[tx.msg.answer_creator], error));
                if (reply.ice_candidates.length > 0) {
                    console.log("Adding answer candidates");
                    for (let i = 0; i < reply.ice_candidates.length; i++) {
                        this.peer_connections[tx.msg.answer_creator].addIceCandidate(reply.ice_candidates[i]);
                    }
                }

            } else {
                console.log("peer connection not found");
            }
        }
    }


    receiveBroadcastDetailsTransaction(blk, tx, conf, app) {
        let my_pubkey = app.wallet.returnPublicKey();
        const listeners = tx.msg.listeners;
        const from = tx.msg.from;
        if (my_pubkey === from) return;

        console.log("listeners: ", listeners, "from: ", from);
        const index = this.app.keys.keys.findIndex(key => key.publickey === my_pubkey);
        if (index !== -1) {
            this.app.keys.keys[index].data.stun.listeners.push(from);
            this.app.keys.saveKeys();

            app.connection.emit('listeners-update', this.app, this.app.keys.keys[index].data.stun.listeners);
            console.log("keys updated, added: ", from, " updated listeners: ", this.app.keys.keys[index].data.stun.listeners);
        }
    }

    receiveOfferBroadcastAnswerTransaction(app, offer_creator, offer) {
        if (app.BROWSER !== 1) return;


        console.log('accepting offer');
        console.log('from:', offer_creator, offer)

        const createPeerConnection = async () => {
            let reply = {
                answer: "",
                ice_candidates: []
            }
            const pc = new RTCPeerConnection({
                iceServers: this.stun.servers,
            });
            try {

                pc.onicecandidate = (ice) => {
                    if (!ice || !ice.candidate || !ice.candidate.candidate) {
                        console.log('ice candidate check closed');


                        this.peer_connections[offer_creator] = pc;

                        this.sendAnswerTransaction(this.app.wallet.returnPublicKey(), offer_creator, reply);
                        return;

                    };

                    reply.ice_candidates.push(ice.candidate);





                }

                pc.onconnectionstatechange = e => {
                    console.log("connection state ", pc.connectionState)
                    // switch (pc.connectionState) {


                    //     // case "connected":
                    //     //     vanillaToast.cancelAll();
                    //     //     vanillaToast.success(`${offer_creator} Connected`, { duration: 3000, fadeDuration: 500 });
                    //     //     break;

                    //     // case "disconnected":
                    //     //     vanillaToast.error(`${offer_creator} Disconnected`, { duration: 3000, fadeDuration: 500 });
                    //     //     break;

                    //     // default:
                    //     //     ""
                    //     //     break;
                    // }
                }

                // add data channels 
                const data_channel = pc.createDataChannel('channel');
                pc.dc = data_channel;


                pc.dc.onmessage = (e) => {
                    console.log('new message from client : ', e.data);
                    this.receiveMesssage(e);
                    // main.displayMessage(peer_key, e.data);
                };
                pc.dc.onopen = (e) => {
                    console.log('connection opened');
                    // $('#connection-status').html(` <p style="color: green" class="data">Connected to ${peer_key}</p>`);
                }



                await pc.setRemoteDescription(offer.offer_sdp);

                const offer_ice_candidates = offer.ice_candidates;
                // console.log('peer ice candidates', offer_ice_candidates);
                if (offer_ice_candidates.length > 0) {
                    console.log('adding offer icecandidates');
                    for (let i = 0; i < offer_ice_candidates.length; i++) {
                        pc.addIceCandidate(offer_ice_candidates[i]);
                    }
                }


                console.log('remote description  is set');

                reply.answer = await pc.createAnswer();

                console.log("answer ", reply.answer);


                pc.setLocalDescription(reply.answer);

                // console.log("peer connection ", pc);





            } catch (error) {
                console.log("error", error);
            }

        }

        createPeerConnection();

    }

}

module.exports = Stun;