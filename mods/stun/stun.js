const saito = require("../../lib/saito/saito");
const ModTemplate = require("../../lib/templates/modtemplate");
var serialize = require('serialize-javascript');
const StunAppspace = require('./lib/appspace/main');
const ChatManagerLarge = require('./lib/components/chat-manager-large');
const ChatManagerSmall = require("./lib/components/chat-manager-small");
const InviteOverlay = require("./lib/components/invite-overlay");
const StunxGameMenu = require("./lib/game-menu/main");
// const StunxGameMenu = require("./lib/game-menu/main");
// const StunxInvite = require("./lib/invite/main");
const ChatInvitationLink = require("./lib/overlays/chat-invitation-link");
const Relay = require("../relay/relay");



class Stun extends ModTemplate {
    constructor(app, mod) {
        super(app);

        this.appname = "Video Call";
        this.name = "Stun";
        this.slug = this.returnSlug();
        this.description = "Dedicated Video Chat Module";
        this.categories = "Video Call"
        this.app = app;
        this.appspaceRendered = false;
        this.remoteStreamPosition = 0;
        this.peer_connections = {};
        this.videoMaxCapacity = 5;
        this.ChatManagerLarge = new ChatManagerLarge(app, this);
        this.ChatManagerSmall = new ChatManagerSmall(app, this);
        this.InviteOverlay = new InviteOverlay(app, this);
        this.icon = "fas fa-video"
        //this.stunxGameMenu = new StunxGameMenu(app, this);
        this.localStream = null;
        this.hasRendered = true
        this.chatType = null;
        this.peer_connections = {}
        this.stunGameMenu = new StunxGameMenu(app, mod);
        this.current_step = 0;

        this.servers = [
            {
                urls: "stun:stun-sf.saito.io:3478"
            },
            {
                urls: "turn:stun-sf.saito.io:3478",
                username: "guest",
                credential: "somepassword",
            },
            {
                urls: "stun:stun-sg.saito.io:3478"
            },
            {
                urls: "turn:stun-sg.saito.io:3478",
                username: "guest",
                credential: "somepassword",
            },
            {
                urls: "stun:stun-de.saito.io:3478"
            },
            {
                urls: "turn:stun-de.saito.io:3478",
                username: "guest",
                credential: "somepassword",
            }
        ];
    }


    onPeerHandshakeComplete(app, peer) {

        if (!this.video_chat_loaded) {
            if (app.browser.returnURLParameter("stun_video_chat")) {
                let room_obj = JSON.parse(app.crypto.base64ToString(app.browser.returnURLParameter("stun_video_chat")));
                console.log(room_obj, 'stun video chat')
                // JOIN THE ROOM
                this.styles = [`/${this.returnSlug()}/style.css`,];
                this.attachStyleSheets();
                super.render(this.app, this);
                    let interval = setInterval(()=> {
                        if(document.readyState === "complete"){
                            app.connection.emit('join-direct-room-with-link', room_obj); 
                            clearInterval(interval) 
                        }
                    }, 500)
                     
                 }
            
              
            }

            this.video_chat_loaded = 1;
        }

    


    initialize(app) {
        super.initialize(app);
        this.app.connection.on("stun-create-peer-connection", (array_of_publickeys) => {
            this.createDataChannelConnectionWithPeers(array_of_publickeys);
        });
    }

    canRenderInto(qs) {
        if (qs === ".saito-main") { return true; }
        return false;
    }

    renderInto(qs) {
        if (qs == ".saito-main") {
            if (!this.renderIntos[qs]) {
                this.renderIntos[qs] = [];
                this.renderIntos[qs].push(new StunAppspace(this.app, this, qs));
            }
            this.styles = [`/${this.returnSlug()}/style.css`];
            this.attachStyleSheets();
            this.renderIntos[qs].forEach((comp) => { comp.render(); });
        }
    }

    respondTo(type) {
        if (type === 'invite') {
            this.styles = [`/stun/style.css`,];
            super.render(this.app, this);
            return new StunxInvite(this.app, this);
        }
        if (type === 'appspace') {
            this.styles = [`/${this.returnSlug()}/css/style.css`,];
            super.render(this.app, this);
            return new StunxAppspace(this.app, this);
        }
        if (type === 'saito-header') {
          return {
            text: this.appname,
            icon: this.icon,
            allowed_mods: ["redsquare"],
            callback: function (app, id) {
	      let stun_self = app.modules.returnModule("Stun");
	      stun_self.renderInto(".saito-main"); 
            }
        }

        if (type == "game-menu") {
            this.styles = [`/${this.returnSlug()}/css/style.css`,];
            super.render(this.app, this);
            return {
                id: "game-chat",
                text: "Chat",
                submenus: [
                    {
                        text: "Video Chat",
                        id: "game-video-chat",
                        class: "game-video-chat",
                        callback: function (app, game_mod) {
                            console.log('all players ', game_mod.game.players);
                            if (game_mod.game.player.length > 1) {
                                app.connection.emit('game-start-video-call', [...game_mod.game.players]);
                            } else {
                                //Open a modal to invite someone to a video chat

                            }

                        },
                    }
                ],
            };


            /*
            return {
                init: (app, game_mod) => {
                    game_mod.menu.addMenuOption({
                        text: "Video Chat",
                        id: "game-video-chat",
                        class: "game-video-chat",
                        callback: function (app, game_mod) {
                            game_mod.menu.showSubMenu("game-video-chat");
                        },
                    });
                    let shortNames = null;
                    let longNames = null;
                    for (let i = 0; i < game_mod.game.players.length; i++) {
                        if (game_mod.game.players[i] != app.wallet.returnPublicKey()) {
                            let nickname = shortNames ? shortNames[i] : "Player " + (i + 1);
                            game_mod.menu.addSubMenuOption("game-video-chat", {
                                text: nickname,
                                id: "game-video-chat-" + (i + 1),
                                class: "game-video-chat-" + (i + 1),
                                callback: function (app, game_mod) {
                                    const stunx = app.modules.returnModule('Stun');
                                    console.log('player ', game_mod.game.players[i]);
                                    app.connection.emit('game-start-video-call', [game_mod.game.players[i]]);
                                },
                            });
                        }
                    }
                    game_mod.menu.addSubMenuOption("game-video-chat", {
                        text: "All players",
                        id: "game-video-chat",
                        class: "game-video-chat",
                        callback: function (app, game_mod) {
                            const stunx = app.modules.returnModule('Stun');
                            console.log('all players ', game_mod.game.players);
                            app.connection.emit('game-start-video-call', [...game_mod.game.players]);
                        },
                    });


                },
                menus: []
            
            }
            */
        }

        if (type === 'user-menu') {
            this.styles = [`/${this.returnSlug()}/style.css`,];
            this.attachStyleSheets();
            super.render(this.app, this);
            return [{
                text: "Video/Audio Call",
                icon: "fas fa-video",
                callback: function (app, public_key) {
                    app.connection.emit('game-start-video-call', public_key);
                }
            }];
        }
        return null;
    }
    }






    onConfirmation(blk, tx, conf, app) {
        let txmsg = tx.returnMessage();
        
        if (conf === 0) {
            if (txmsg.module === 'Stun') {
                if (tx.msg.request === "stun media channel answer") {
                    this.receiveMediaChannelAnswerTransaction(app, tx, conf, blk)
                }
                if (tx.msg.request === "stun data channel answer") {
                    this.receiveDataChannelAnswerTransaction(app, tx, conf, blk)
                }
                if (tx.msg.request === "stun media channel offer") {
                    this.receiveMediaChannelOfferTransaction(app, tx, conf, blk)
                }
                if (tx.msg.request === "stun data channel offer") {
                    this.receiveDataChannelOfferTransaction(app, tx, conf, blk)
                }
                if (tx.msg.request === "receive room code") {
                    this.receiveRoomCodeTransaction(app, tx, conf, blk)
                }
            }
        }
    }



    async handlePeerTransaction(app, tx=null, peer, mycallback) {
        if (tx.msg.request === "stun media channel offer") {
                this.receiveMediaChannelOfferTransaction(app, tx)
            }
            if (tx.msg.request === "stun data channel offer") {
                this.receiveDataChannelOfferTransaction(app, tx)
            }
            if (tx.msg.request === "stun media channel answer") {
                this.receiveMediaChannelAnswerTransaction(app, tx)
            }
            if (tx.msg.request === "stun data channel answer") {
                this.receiveDataChannelAnswerTransaction(app, tx)
            }
            if (tx.msg.request === "receive room code") {
                this.receiveRoomCodeTransaction(app, tx)
            }
            if (tx.msg.request === "create room") {
                this.receiveCreateRoomTransaction(app, tx)
            }
            if (tx.msg.request === "update room") {
                this.receiveUpdateRoomTransaction(app, tx)
            }


        
        
        super.handlePeerTransaction(app, tx, peer, mycallback)

    }




    async sendCreateRoomTransaction(callback = null) {
        let roomCode = this.app.crypto.generateRandomNumber().substring(0, 6);
        let room = { code: roomCode, peers: "[]", peerCount: 0, isMaxCapicity: 0, validityPeriod: 86400, startTime: Date.now() };
        let newtx = this.app.wallet.createUnsignedTransaction();

        // get recipient -- server in this case
        let server_pub_key = this.app.network.peers[0].peer.publicKey;
        let server = this.app.network.peers[0];
         
        newtx = this.app.wallet.signTransaction(newtx);
        console.log(newtx.returnMessage(), 'return new tx message');
        server.sendRequestAsTransaction('create room', room);
        if (callback) {
            callback(this.app, this.mod, roomCode)
        }
    }

    async receiveCreateRoomTransaction(app, tx) {
        if(app.BROWSER === 1) return;
        let room = tx.msg.data;
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
        const result = await app.storage.executeDatabase(sql, params, "videocall");
        console.log('db result ', result, app.storage.executeDatabase);
    }

    async sendUpdateRoomTransaction(room_code, data) {
        const { peers_in_room, peer_count, is_max_capacity } = data;
        let newtx = this.app.wallet.createUnsignedTransaction();
        // get recipient -- server in this case
        let server = this.app.network.peers[0];

       let data_ = {
            room_code,
            peers_in_room,
            peer_count,
            is_max_capacity
        };

        server.sendRequestAsTransaction('update room', data_);
    }


    receiveUpdateRoomTransaction(app, tx) {
        if(app.BROWSER === 1) return;
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
        app.storage.executeDatabase(sql, params, "videocall");
        return;
    }



    createMediaConnectionOffer(publicKey, ui_type, call_type, room_code) {
        console.log('call type ', call_type)
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
                            resolve({ recipient: publicKey, offer_sdp, ice_candidates, pc, ui_type, call_type });
                            return;
                        } else {
                            ice_candidates.push(ice.candidate);
                        }

                    };
                    pc.onconnectionstatechange = e => {
                        console.log("connection state ", pc.connectionState);

                        switch (pc.connectionState) {
                            case "connecting":
                                this.app.connection.emit('change-connection-state-request', publicKey, pc.connectionState, ui_type, call_type, room_code);
                                break;
                            case "connected":
                                this.app.connection.emit('change-connection-state-request', publicKey, pc.connectionState, ui_type, call_type, room_code);
                                break;
                            case "disconnected":
                                this.app.connection.emit('change-connection-state-request', publicKey, pc.connectionState, ui_type, call_type, room_code);
                                break;
                            case "failed":
                                this.app.connection.emit('change-connection-state-request', publicKey, pc.connectionState, ui_type, call_type, room_code);
                                break;
                            default:
                                ""
                                break;
                        }
                    }

                    const stunx_self = this.app.modules.returnModule('Stun');
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

                        console.log('ui_type ', ui_type, 'public key ', publicKey, "call type", call_type);

                        console.log(remoteStream, pc, publicKey, "This is for the offer creator")
                        this.app.connection.emit('add-remote-stream-request', publicKey, remoteStream, pc, ui_type, call_type, room_code);

                    });
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
    createStunConnectionOffer(publickey, app) {
        const createPeerConnection = new Promise((resolve, reject) => {
            let ice_candidates = [];
            const execute = async (app) => {
                try {
                    const pc = new RTCPeerConnection({
                        iceServers: this.servers,
                    });

                    pc.onicecandidate = (ice) => {
                        if (!ice || !ice.candidate || !ice.candidate.candidate) {
                            let offer_sdp = pc.localDescription;
                            console.log(offer_sdp)
                            resolve({ recipient: publickey, offer_sdp, ice_candidates, pc });
                            return;
                        } else {
                            ice_candidates.push(ice.candidate);
                        }
                    };

                    pc.onconnectionstatechange = e => {
                        console.log("connection state ", pc.connectionState);
                        switch (pc.connectionState) {
                            case "connected":
                                // this.app.network.addStunPeer({publickey, peer_connection: pc })
                                break;
                            default:
                                ""
                                break;
                        }

                    }


                    const data_channel = pc.createDataChannel('channel');
                    // pc.dc = data_channel;
                    // let stunx_mod = this.app.modules.returnModule("Stun");
                    // pc.dc.onmessage = (e) => {
                    // console.log('new message from client : ', e.data);
                    app.network.addStunPeer({ publickey, peer_connection: pc, data_channel });
                    // };
                    // pc.dc.onopen = (e) =>  { 
                    //     pc.dc.send("new message");
                    //     console.log("connection opened")
                    // };

                    pc.createOffer().then(offer => {
                        pc.setLocalDescription(offer)
                    })
                    // pc.setLocalDescription(offer);
                } catch (error) {
                    console.log(error);
                }

            }

            execute(app)


        })

        return createPeerConnection;

    }


    acceptMediaChannelConnectionOffer(app, offer_creator, offer) {
        console.log('rendering remote stream place holder');
        // this.app.connection.emit('render-remote-stream-placeholder-request', offer_creator, offer.ui_type);
        const room_code = offer.room_code
        const createPeerConnection = async () => {
            let reply = {
                room_code,
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
                        let stunx_mod = app.modules.returnModule("Stun");
                        stunx_mod.peer_connections[offer_creator] = pc;
                        stunx_mod.sendMediaChannelAnswerTransaction(stunx_mod.app.wallet.returnPublicKey(), offer_creator, reply);
                        return;
                    };
                    reply.ice_candidates.push(ice.candidate);
                }
                pc.onconnectionstatechange = e => {
                    console.log("connection state ", pc.connectionState)
                    switch (pc.connectionState) {
                        case "connecting":
                            this.resetStep();
                            this.app.connection.emit('change-connection-state-request', offer_creator, pc.connectionState, offer.ui_type, offer.call_type, room_code);
                            break;
                        case "connected":
                            this.app.connection.emit('change-connection-state-request', offer_creator, pc.connectionState, offer.ui_type, offer.call_type, room_code);
                            this.resetStep();
                            break;
                        case "disconnected":
                            this.resetStep();
                            this.app.connection.emit('change-connection-state-request', offer_creator, pc.connectionState, offer.ui_type, offer.call_type, room_code);
                            break;
                        case "failed":
                            this.resetStep();
                            this.app.connection.emit('change-connection-state-request', offer_creator, pc.connectionState, offer.ui_type, offer.call_type, room_code);
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
                pc.dc.onopen = (e) => {
                    console.log('connection opened');
                }

                // add local stream tracks to send
                const localStream = this.localStream;
                localStream.getTracks().forEach(track => {
                    pc.addTrack(track, localStream);
                    console.log('adding local stream to track')
                });

                const remoteStream = new MediaStream();
                pc.addEventListener('track', (event) => {
                    console.log('got remote stream from offer creator ', event.streams);
                    event.streams[0].getTracks().forEach(track => {
                        remoteStream.addTrack(track);
                    });
                    this.app.connection.emit('add-remote-stream-request', offer_creator, remoteStream, pc, offer.ui_type);

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

    acceptDataChannelConnectionOffer(app, offer_creator, offer) {
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
                        let stunx_mod = app.modules.returnModule("Stun");
                        stunx_mod.peer_connections[offer_creator] = pc;
                        // stunx_mod.initializeStun(stunx_mod.peer_connections[offer_creator]);
                        stunx_mod.sendDataChannelAnswerTransaction(stunx_mod.app.wallet.returnPublicKey(), offer_creator, reply);
                        return;
                    };
                    reply.ice_candidates.push(ice.candidate);
                }
                pc.onconnectionstatechange = e => {
                    console.log("connection state ", pc.connectionState)
                    switch (pc.connectionState) {
                        // case "connecting":
                        //     this.app.connection.emit('change-connection-state-request', offer_creator, pc.connectionState, ui_type);
                        //     break;
                        case "connected":
                            // this.app.network.addStunPeer({publicKey:offer_creator, peer_connection: pc})
                            break;
                        // case "disconnected":
                        //     this.app.connection.emit('change-connection-state-request', offer_creator, pc.connectionState, ui_type);
                        //     break;
                        // case "failed":
                        //     this.app.connection.emit('change-connection-state-request', offer_creator, pc.connectionState, ui_type);
                        //     break;
                        default:
                            ""
                            break;
                    }
                }

                pc.ondatachannel = (e) => {
                    console.log('new data channel', e.channel);
                    let data_channel = e.channel;
                    app.network.addStunPeer({ publickey: offer_creator, peer_connection: pc, data_channel });
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
            } catch (error) {
                console.log("error", error);
            }
        }
        createPeerConnection();
    }


    async createMediaChannelConnectionWithPeers(public_keys, ui_type, call_type, room_code) {
        console.log('this current step ', this.current_step)
        let peerConnectionOffers = [];
        if (public_keys.length > 0) {
            // send connection to other peers if they exit
            for (let i = 0; i < public_keys.length; i++) {
                console.log('public key ', public_keys[i], ' ui_type ', ui_type);
                peerConnectionOffers.push(this.createMediaConnectionOffer(public_keys[i], ui_type, call_type, room_code));
            }
        }


        try {
            peerConnectionOffers = await Promise.all(peerConnectionOffers);
            if (peerConnectionOffers.length > 0) {
                const offers = [];
                peerConnectionOffers.forEach((offer) => {
                    console.log('offer :', offer)
                    this.peer_connections[offer.recipient] = offer.pc
                    offers.push({
                        ice_candidates: offer.ice_candidates,
                        offer_sdp: offer.offer_sdp,
                        recipient: offer.recipient,
                        ui_type: offer.ui_type,
                        call_type: offer.call_type,
                        room_code
                    })
                })

                let index = 0;
                let interval = setInterval(() => {
                    let offer;
                    offer = offers[index];
                    this.sendMediaChannelOfferTransaction(this.app.wallet.returnPublicKey(), offer)
                    console.log('sending offer', index)
                    if (offers.length - 1 === index) {
                        clearInterval(interval)
                    }
                    index++;
                }, 3000);


            }

        } catch (error) {
            console.log('an error occurred with peer connection creation', error);
        }
        console.log("peer connections ", this.peer_connections);
        siteMessage(`Starting ${call_type} connection`, 5000);
    }


    async createDataChannelConnectionWithPeers(public_keys) {
        
        let peerConnectionOffers = [];
        if (public_keys.length > 0) {
            // send connection to other peers if they exit
            for (let i = 0; i < public_keys.length; i++) {
                console.log('public key ', public_keys[i]);
                peerConnectionOffers.push(this.createStunConnectionOffer(public_keys[i], this.app));
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
                    // this.initializeStun(this.peer_connections[offer.recipient]);
                    offers.push({
                        ice_candidates: offer.ice_candidates,
                        offer_sdp: offer.offer_sdp,
                        recipient: offer.recipient,
                    })
                })
                // const offers = peerConnectionOffers.map(item => item.offer_sdp);         
                this.sendDataChannelOfferTransaction(this.app.wallet.returnPublicKey(), offers);
            }
        } catch (error) {
            console.log('an error occurred with peer connection creation', error);
        }
        console.log("peer connections ", this.peer_connections);
    }

    setLocalStream(localStream) {
        this.localStream = localStream;
    }



    createMediaChannelOfferTransaction(offer_creator, offer){
        console.log('broadcasting offer', offer)
        let _data = {
            offer_creator,
            offer
        }
        let request = "stun media channel offer"

        // onchain 
        let newtx = this.app.wallet.createUnsignedTransaction();
        newtx.transaction.to.push(new saito.default.slip(offer.recipient));
        newtx.msg.module = "Stun";
        newtx.msg.request = request
        newtx.msg.data = _data
   
        newtx = this.app.wallet.signTransaction(newtx);

         // offchain data
        let data = {
            recipient: [offer_creator, offer.recipient],
            request,
            data: _data
        }
        return [newtx, data]
    }

    sendMediaChannelOfferTransaction(offer_creator, offer) {
         let [newtx, data ] = this.createMediaChannelOfferTransaction(offer_creator, offer);

         // offchain
        this.app.connection.emit('relay-send-message', data);

        // onchain
        this.app.network.propagateTransaction(newtx);
    }

    receiveMediaChannelOfferTransaction(app, tx, conf, blk) {
        if (app.BROWSER !== 1) return;
        if(this.current_step >= 1) return;
        this.current_step = 1;
        let stunx_self = app.modules.returnModule("Stun");
        let my_pubkey = app.wallet.returnPublicKey();
        console.log(tx, 'stun media channel offer')
        const offer_creator = tx.msg.data.offer_creator;
        const room_code = tx.msg.data.offer.room_code
        const recipient = tx.msg.data.offer.recipient;

        if(!this.ChatManagerLarge.isActive || this.ChatManagerLarge.room_code !== room_code) return;
        app.connection.emit('stun-receive-media-offer', {
            room_code,
            offer_creator,
            recipient
        })


        // offer creator should not respond
        if (my_pubkey === offer_creator) return;
        console.log("offer received from ", offer_creator);
        // check if current instance is a recipent
        if (my_pubkey === recipient) {
            stunx_self.acceptMediaChannelOfferAndBroadcastAnswer(app, offer_creator, tx.msg.data.offer);
        }

    }

    createMediaChannelAnswerTransaction(answer_creator, offer_creator, reply){
        console.log('broadcasting answer to ', offer_creator);
        let _data = {
            answer_creator,
            offer_creator,
            reply,
            
        };
        let request = "stun media channel answer"

        // onchain
        let newtx = this.app.wallet.createUnsignedTransaction();
        newtx.transaction.to.push(new saito.default.slip(offer_creator));
        newtx.msg.module = "Stun";
        newtx.msg.request = request
        newtx.msg.data= _data;
        newtx = this.app.wallet.signTransaction(newtx);

       
        // offchain
          let data = {
              request,
              recipient: [offer_creator, answer_creator],
              data:_data
          }

          return [newtx, data]
    }

    sendMediaChannelAnswerTransaction(answer_creator, offer_creator, reply) {
        [newtx, data]=  this.createMediaChannelAnswerTransaction(answer_creator, offer_creator, reply)

        // offchain
        this.app.connection.emit('relay-send-message', data)

        // onchain
        this.app.network.propagateTransaction(newtx);
    }


    receiveMediaChannelAnswerTransaction(app, tx, conf, blk) {
        if (app.BROWSER !== 1) return;
        if(this.current_step >= 2) return;

        this.current_step = 2;;
        if(!this.ChatManagerLarge.isActive) return;
        let stunx_self = app.modules.returnModule("Stun");
        let my_pubkey = app.wallet.returnPublicKey();
        console.log('receiving stun media channel answer');

        app.connection.emit('stun-receive-media-answer', {
            room_code:tx.msg.data.reply.room_code,
            offer_creator: tx.msg.data.offer_creator,
            recipient:tx.msg.data.answer_creator
        })
        if (my_pubkey === tx.msg.data.offer_creator) {

            console.log('receiving stun media channel answer');
            console.log("current instance: ", my_pubkey, " answer room: ", tx.msg.data);
            console.log("peer connections: ", stunx_self.peer_connections);
            const reply = tx.msg.data.reply;
            if (stunx_self.peer_connections[tx.msg.data.answer_creator]) {
                stunx_self.peer_connections[tx.msg.data.answer_creator].setRemoteDescription(reply.answer).then(result => {
                    console.log('setting remote description of ', stunx_self.peer_connections[tx.msg.data.answer_creator], 'reply ', reply);

                }).catch(error => console.log(" An error occured with setting remote description for :", stunx_self.peer_connections[tx.msg.data.answer_creator], error));
                if (reply.ice_candidates.length > 0) {
                    console.log("Adding answer candidates");
                    for (let i = 0; i < reply.ice_candidates.length; i++) {
                        stunx_self.peer_connections[tx.msg.data.answer_creator].addIceCandidate(reply.ice_candidates[i]);
                    }
                }
            } else {
                console.log("peer connection not found");
            }
        }
    }





    sendDataChannelOfferTransaction(offer_creator, offers) {
        let newtx = this.app.wallet.createUnsignedTransaction();
        console.log('broadcasting offers');
        for (let i = 0; i < offers.length; i++) {
            newtx.transaction.to.push(new saito.default.slip(offers[i].recipient));
        }

        newtx.msg.module = "Stun";
        newtx.msg.request = "stun data channel offer"
        newtx.msg.offers = {
            offer_creator,
            offers
        }
        newtx = this.app.wallet.signTransaction(newtx);
        console.log(this.app.network);
        this.app.network.propagateTransaction(newtx);
    }




    acceptMediaChannelOfferAndBroadcastAnswer(app, offer_creator, offer) {

        console.log('accepting offer');
        console.log('from:', offer_creator, offer);
        // if (offer.ui_type == "small") {
        //     this.app.connection.emit('game-receive-video-call', app, offer_creator, offer);
        //     return;
        // }

        if (offer.ui_type == "large") {
            this.acceptMediaChannelConnectionOffer(app, offer_creator, offer);
        }






    }



    acceptDataChannelOfferAndBroadcastAnswer(app, offer_creator, offer) {
        console.log('accepting offer');
        console.log('from:', offer_creator, offer);
        this.acceptDataChannelConnectionOffer(app, offer_creator, offer);
    }



   
    sendDataChannelAnswerTransaction(answer_creator, offer_creator, reply) {
        let newtx = this.app.wallet.createUnsignedTransaction();
        console.log('broadcasting answer to ', offer_creator);
        newtx.transaction.to.push(new saito.default.slip(offer_creator));
        newtx.msg.module = "Stun";
        newtx.msg.request = "stun data channel answer"
        newtx.msg.data = {
            answer_creator,
            offer_creator,
            reply: reply
        };
        newtx = this.app.wallet.signTransaction(newtx);
        console.log(this.app.network);
        this.app.network.propagateTransaction(newtx);
    }

  

    receiveDataChannelOfferTransaction(app, tx, conf, blk) {
        if (app.BROWSER !== 1) return;
        let stunx_self = app.modules.returnModule("Stun");
        let my_pubkey = app.wallet.returnPublicKey();
        const offer_creator = tx.msg.offers.offer_creator;

        // offer creator should not respond
        if (my_pubkey === offer_creator) return;
        console.log("offer received from ", tx.msg.offers.offer_creator);
        // check if current instance is a recipent
        const index = tx.msg.offers.offers.findIndex(offer => offer.recipient === my_pubkey);
        if (index !== -1) {
            stunx_self.acceptDataChannelOfferAndBroadcastAnswer(app, offer_creator, tx.msg.offers.offers[index]);
        }
    }

 
    receiveDataChannelAnswerTransaction(app, tx, conf, blk) {
        let stunx_self = app.modules.returnModule("Stun");
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





    receiveRoomCodeTransaction(app, tx, conf, blk) {
        if (app.BROWSER !== 1) return;
        console.log(tx.msg.data)
        if (tx.msg.data.creator === app.wallet.returnPublicKey()) {
            return;
        }
        sconfirm("Accept video call from " + tx.msg.data.creator).then((e) => {
            console.log(e, 'result')
            if (e === false) {
                salert("Video call rejected")
                return;
            }
            this.styles = [`/${this.returnSlug()}/style.css`];
            this.attachStyleSheets();
            setTimeout(() => {
                this.app.connection.emit('join-direct-room-with-code', tx.msg.data.roomCode);
            }, 3000)
        })
    }

    sendVideoEffectsTransaction(effects_obj){

    }


    closeMediaConnections(peer) {
        if(peer){
            for (let i in this.peer_connections) {
                console.log(i, this.peer_connections);
                if(i === peer){
                    this.peer_connections[i].close();
                    delete this.peer_connections[i];
                    console.log('closing peer connection', this.peer_connections);
                }
            }

            return
        }

        for (let i in this.peer_connections) {
                this.peer_connections[i].close();
                delete this.peer_connections[i];
                console.log('closing peer connection', this.peer_connections);
        }


      
        // update database and delete public key from room
    }





    showShareLink(room_obj = {}) {


        let base64string = this.app.crypto.toBase58(JSON.stringify(room_obj));

        let inviteLink = window.location.href;
        if (!inviteLink.includes("#")) { inviteLink += "#"; }

        if (inviteLink.includes("?")) {
            inviteLink = inviteLink.replace("#", "&stun_video_chat=" + base64string);
        } else {
            inviteLink = inviteLink.replace("#", "?stun_video_chat=" + base64string);
        }


        let linkModal = new ChatInvitationLink(this.app, this, inviteLink);
        linkModal.render();

    }


    resetStep(){
        this.current_step = 0;
    }


}

module.exports = Stun;

