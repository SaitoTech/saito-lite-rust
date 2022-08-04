const saito = require("../../lib/saito/saito");
const ModTemplate = require("../../lib/templates/modtemplate");
var serialize = require('serialize-javascript');
const VideoChatManager = require('./lib/components/video-chat-manager');
const StunxAppspace = require('./lib/appspace/main');
const InviteOverlay = require("./lib/invite/main");

class Stunx extends ModTemplate {

    constructor(app, mod) {
        super(app);
        this.appname = "Stunx";
        this.name = "Stunx";
        this.description = "Dedicated Video chat Module";
        this.categories = "Video Call"
        this.app = app;
        this.remoteStreamPosition = 0;
        this.peer_connections = {};
        this.videoMaxCapacity = 5;
        this.VideoChatManager = new VideoChatManager(app, this);
        this.InviteOverlay = new InviteOverlay(app, this);
        this.icon = "fas fa-video"
        this.localStream = null;
        this.servers = [
            {
                urls: "stun:stun-sf.saito.io:3478"
            },
            {
                urls: "turn:stun-sf.saito.io:3478",
                username: "guest",
                credential: "somepassword",
            },
        ];
    }



    respondTo(type) {
        if (type === 'invite') {
            this.styles = ['/stunx/css/style.css',];
            super.render(this.app, this);
	    return new StunInvite(this.app, this);
        }
        if (type === 'appspace') {
            this.styles = ['/stunx/css/style.css',];
            super.render(this.app, this);
            return new StunxAppspace(this.app, this);
        }
        return null;
    }








    onConfirmation(blk, tx, conf, app) {
        let txmsg = tx.returnMessage();
        if (conf === 0) {
            if (txmsg.module === 'Stunx') {
                if (tx.msg.request === "answer") {
                    this.receiveAnswerTransaction(blk, tx, conf, app)
                }
                if (tx.msg.request === "offer") {
                    this.receiveOfferTransaction(blk, tx, conf, app)
                }
            }
        }
    }



    handlePeerRequest(app, message, peer, mycallback) {
        if (message.request == null) {
            return;
        }
        if (message.data == null) {
            return;
        }
        if (message.request === "stunx offchain update") {
            let tx = message.data.tx;
            if (tx.msg.request === "create room") {
                this.receiveCreateRoomTransaction(app, tx);

            }
            if (tx.msg.request === "update room") {
                this.receiveUpdateRoomTransaction(app, tx);
            }
        }
        super.handlePeerRequest(app, message, peer, mycallback)
    }



    async sendCreateRoomTransaction() {
        let roomCode = this.app.crypto.generateRandomNumber().substring(0, 6);
        let room = { code: roomCode, peers: "[]", peerCount: 0, isMaxCapicity: 0, validityPeriod: 86400, startTime: Date.now() };
        let newtx = this.app.wallet.createUnsignedTransaction();

        // get recipient -- server in this case
        let server_pub_key = this.app.network.peers[0].peer.publicKey;
        let server = this.app.network.peers[0];
        newtx.transaction.to.push(new saito.default.slip(server_pub_key));
        newtx.msg.module = "Stunx";
        newtx.msg.request = "create room"
        newtx.msg.room = {
            room
        };
        newtx = this.app.wallet.signTransaction(newtx);
        let message = {
            data: {}
        };
        message.request = "stunx offchain update";
        message.data.tx = newtx;
        server.sendRequest(message.request, message.data);

        this.app.connection.emit('show-invite-overlay-request', roomCode);
        siteMessageNew("Room created successfully", 5000);
    }

    async sendUpdateRoomTransaction(room_code, data) {
        const { peers_in_room, peer_count, is_max_capacity } = data;
        let newtx = this.app.wallet.createUnsignedTransaction();
        // get recipient -- server in this case
        let server_pub_key = this.app.network.peers[0].peer.publicKey;
        let server = this.app.network.peers[0];
        newtx.transaction.to.push(new saito.default.slip(server_pub_key));
        newtx.msg.module = "Stunx";
        newtx.msg.request = "update room"
        newtx.msg.data = {
            room_code,
            peers_in_room,
            peer_count,
            is_max_capacity
        };
        newtx = this.app.wallet.signTransaction(newtx);

        let message = {
            data: {}
        };
        message.request = "stunx offchain update";
        message.data.tx = newtx;
        server.sendRequest(message.request, message.data);
    }



    async receiveCreateRoomTransaction(app, tx) {
        let room = tx.msg.room.room;
        let sql = `INSERT INTO rooms (
            room_code,
            peers,
            peer_count,
            is_max_capacity,
            start_time,
            created_at,
            validity_period
          ) VALUES (
            $room_code,
            $peers,
            $peer_count,
            $is_max_capacity,
            $start_time,
            $created_at,
            $validity_period
          )`;

        let params = {
            $room_code: room.code,
            $peers: room.peers,
            $peer_count: room.peerCount,
            $is_max_capacity: room.isMaxCapicity,
            $start_time: room.startTime,
            $created_at: Date.now(),
            $validity_period: room.validityPeriod,
        };
        const result = await app.storage.executeDatabase(sql, params, "stunx");
        console.log('db result ', result, app.storage.executeDatabase);
    }

    receiveUpdateRoomTransaction(app, tx) {
        let peers_in_room = tx.msg.data.peers_in_room;
        let room_code = tx.msg.data.room_code;
        let peer_count = tx.msg.data.peer_count;
        let is_max_capacity = tx.msg.data.is_max_capacity;
        let sql = "UPDATE rooms SET peers = $peers_in_room, peer_count = $peer_count, is_max_capacity = $is_max_capacity WHERE room_code = $room_code";
        let params = {
            $peers_in_room: peers_in_room,
            $room_code: room_code,
            $peer_count: peer_count,
            $is_max_capacity: is_max_capacity
        }
        app.storage.executeDatabase(sql, params, "stunx");

        return;



    }

    acceptOfferAndBroadcastAnswer(app, offer_creator, offer) {

        console.log('accepting offer');
        console.log('from:', offer_creator, offer)
        this.app.connection.emit('add-remote-stream-request', null, offer_creator, null, 'fromCreator');
        const createPeerConnection = async () => {
            let reply = {
                answer: "",
                ice_candidates: []
            }
            const pc = new RTCPeerConnection({
                iceServers: this.servers,
            });
            try {
                pc.onicecandidate = (ice) => {
                    if (!ice || !ice.candidate || !ice.candidate.candidate) {
                        console.log('ice candidate check closed');
                        let stunx_mod = app.modules.returnModule("Stunx");
                        stunx_mod.peer_connections[offer_creator] = pc;
                        stunx_mod.sendAnswerTransaction(stunx_mod.app.wallet.returnPublicKey(), offer_creator, reply);
                        return;
                    };
                    reply.ice_candidates.push(ice.candidate);
                }
                pc.onconnectionstatechange = e => {
                    console.log("connection state ", pc.connectionState)
                    switch (pc.connectionState) {
                        case "connected":
                            break;
                        case "disconnected":
                            break;
                        default:
                            ""
                            break;
                    }
                }

                // add data channels 
                const data_channel = pc.createDataChannel('channel');
                pc.dc = data_channel;
                pc.dc.onmessage = (e) => {

                    console.log('new message from client : ', e.data);

                };
                pc.dc.open = (e) => {
                    console.log('connection opened');
                }

                // add local stream tracks to send
                const localStream = this.localStream;
                localStream.getTracks().forEach(track => {
                    pc.addTrack(track, localStream);
                });

                const remoteStream = new MediaStream();
                pc.addEventListener('track', (event) => {
                    console.log('got remote stream from offer creator ', event.streams);
                    event.streams[0].getTracks().forEach(track => {
                        remoteStream.addTrack(track);
                    });
                    this.app.connection.emit('add-remote-stream-request', remoteStream, offer_creator, pc, 'fromCreator');
                });
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
            } catch (error) {
                console.log("error", error);
            }
        }
        createPeerConnection();
    }

    createPeerConnectionOffer(publicKey) {
        const createPeerConnection = new Promise((resolve, reject) => {
            let ice_candidates = [];
            const execute = async () => {
                try {
                    const pc = new RTCPeerConnection({
                        iceServers: this.servers,
                    });

                    pc.onicecandidate = (ice) => {
                        if (!ice || !ice.candidate || !ice.candidate.candidate) {
                            let offer_sdp = pc.localDescription;
                            resolve({ recipient: publicKey, offer_sdp, ice_candidates, pc });
                            return;
                        } else {
                            ice_candidates.push(ice.candidate);
                        }

                    };
                    pc.onconnectionstatechange = e => {
                        console.log("connection state ", pc.connectionState)
                        switch (pc.connectionState) {
                            case "connected":
                                // siteMessageNew("Connected");
                                break;

                            case "disconnecting":
                                break;

                            default:
                                ""
                                break;
                        }
                    }

                    const stunx_self = this.app.modules.returnModule('Stunx');
                    let localStream = stunx_self.localStream;
                    if (!localStream) return console.log('there is no localstream');
                    stunx_self.localStream.getTracks().forEach(track => {
                        pc.addTrack(track, localStream);

                    });

                    const remoteStream = new MediaStream();
                    pc.addEventListener('track', (event) => {
                        console.log('got remote stream', event.streams);
                        event.streams[0].getTracks().forEach(track => {
                            remoteStream.addTrack(track);
                            this.remoteStreamPosition += 1;
                        });
                        this.app.connection.emit('add-remote-stream-request', remoteStream, publicKey, pc, 'fromRecipient');
                    });

                    const data_channel = pc.createDataChannel('channel');
                    pc.dc = data_channel;
                    pc.dc.onmessage = (e) => {
                        console.log('new message from client : ', e.data);
                    };
                    pc.dc.open = (e) => console.log("connection opened");
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





    async createStunConnectionWithPeers(public_keys) {
        let peerConnectionOffers = [];
        if (public_keys.length > 0) {
            // send connection to other peers if they exit
            for (let i = 0; i < public_keys.length; i++) {
                peerConnectionOffers.push(this.createPeerConnectionOffer(public_keys[i]));
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
                this.sendOfferTransaction(this.app.wallet.returnPublicKey(), offers);
            }

        } catch (error) {
            console.log('an error occurred with peer connection creation', error);
        }
        console.log("peer connections ", this.peer_connections);
        siteMessageNew("Starting video connection", 5000);
    }


    setLocalStream(localStream) {
        this.localStream = localStream;
    }

    sendOfferTransaction(offer_creator, offers) {
        let newtx = this.app.wallet.createUnsignedTransaction();
        console.log('broadcasting offers');
        for (let i = 0; i < offers.length; i++) {
            newtx.transaction.to.push(new saito.default.slip(offers[i].recipient));
        }
        newtx.msg.module = "Stunx";
        newtx.msg.request = "offer"
        newtx.msg.offers = {
            offer_creator,
            offers
        }
        newtx = this.app.wallet.signTransaction(newtx);
        console.log(this.app.network);
        this.app.network.propagateTransaction(newtx);
    }



    sendAnswerTransaction(answer_creator, offer_creator, reply) {
        let newtx = this.app.wallet.createUnsignedTransaction();
        console.log('broadcasting answer to ', offer_creator);
        newtx.transaction.to.push(new saito.default.slip(offer_creator));
        newtx.msg.module = "Stunx";
        newtx.msg.request = "answer"
        newtx.msg.answer = {
            answer_creator,
            offer_creator,
            reply: reply
        };
        newtx = this.app.wallet.signTransaction(newtx);
        console.log(this.app.network);
        this.app.network.propagateTransaction(newtx);
    }

    receiveOfferTransaction(blk, tx, conf, app) {
        if (app.BROWSER !== 1) return;
        let stunx_self = app.modules.returnModule("Stunx");
        let my_pubkey = app.wallet.returnPublicKey();
        const offer_creator = tx.msg.offers.offer_creator;

        // offer creator should not respond
        if (my_pubkey === offer_creator) return;
        console.log("offer received from ", tx.msg.offers.offer_creator);
        // check if current instance is a recipent
        const index = tx.msg.offers.offers.findIndex(offer => offer.recipient === my_pubkey);
        if (index !== -1) {
            stunx_self.acceptOfferAndBroadcastAnswer(app, offer_creator, tx.msg.offers.offers[index]);
        }
    }

    receiveAnswerTransaction(blk, tx, conf, app) {
        let stunx_self = app.modules.returnModule("Stunx");
        let my_pubkey = app.wallet.returnPublicKey();
        if (my_pubkey === tx.msg.answer.offer_creator) {
            if (app.BROWSER !== 1) return;
            console.log("current instance: ", my_pubkey, " answer room: ", tx.msg.answer);
            console.log("peer connections: ", stunx_self.peer_connections);
            const reply = tx.msg.answer.reply;
            if (stunx_self.peer_connections[tx.msg.answer.answer_creator]) {
                stunx_self.peer_connections[tx.msg.answer.answer_creator].setRemoteDescription(reply.answer).then(result => {
                    console.log('setting remote description of ', stunx_self.peer_connections[tx.msg.answer.answer_creator]);

                }).catch(error => console.log(" An error occured with setting remote description for :", stunx_self.peer_connections[tx.msg.answer.answer_creator], error));
                if (reply.ice_candidates.length > 0) {
                    console.log("Adding answer candidates");
                    for (let i = 0; i < reply.ice_candidates.length; i++) {
                        stunx_self.peer_connections[tx.msg.answer.answer_creator].addIceCandidate(reply.ice_candidates[i]);
                    }
                }
            } else {
                console.log("peer connection not found");
            }
        }
    }



}

module.exports = Stunx;

