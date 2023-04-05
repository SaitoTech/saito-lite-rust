


const saito = require("../../lib/saito/saito");
const ModTemplate = require("../../lib/templates/modtemplate");
var serialize = require('serialize-javascript');
const StunAppspace = require('./lib/appspace/main');
const ChatManagerLarge = require('./lib/components/chat-manager-large');
const ChatManagerSmall = require("./lib/components/chat-manager-small");
const InviteOverlay = require("./lib/components/invite-overlay");
const StunxGameMenu = require("./lib/game-menu/main");
const ChatInvitationLink = require("./lib/overlays/chat-invitation-link");
const Relay = require("../relay/relay");
const adapter = require('webrtc-adapter');
const PeerManager = require('./lib/components/PeerManager');
const ChatSetting = require('./lib/components/chat-setting');



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
        this.localStream = null;
        this.hasRendered = true
        this.chatType = null;
        this.central = false;
        this.peer_connections = {}
        this.peer_connection_states = {}
        this.stunGameMenu = new StunxGameMenu(app, this);
        this.current_step = 0;
        this.gotten_keys = false
        this.commands = [];
        this.rooms = new Map();
        this.chatSetting = new ChatSetting(app, mod)
        // this.receiving_from = {}


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


        this.styles = [
            '/saito/saito.css',
            '/videocall/style.css',
        ];



        app.connection.on('stun-send-message-to-server', (data) => {
            this.sendStunMessageToServerTransaction(data)
        })

        app.connection.on('stun-init-peer-manager', ()=> {
            this.peerManager = new PeerManager(app, mod);
            this.peerManager.showSetting();
        })

    }


    onPeerHandshakeComplete(app, peer) {
        if(app.BROWSER !==1 ){
            return;
        }
        if (!this.video_chat_loaded) {
            if (app.browser.returnURLParameter("stun_video_chat")) {
                let room_obj = JSON.parse(app.crypto.base64ToString(app.browser.returnURLParameter("stun_video_chat")));

                // JOIN THE ROOM
                let stun_self = app.modules.returnModule("Stun");
                stun_self.renderInto("body");

                let interval = setInterval(() => {
                    if (document.readyState === "complete") {
                        let room_code = room_obj.room_code;
                        // stun_self.peerManager = new PeerManager(app, stun_self, room_code);
                        // stun_self.peerManager.showSetting(true);
                        app.connection.emit('stun-to-join-room', true, room_code);
                        clearInterval(interval)
                  }
                }, 500)

            }


        }

        this.video_chat_loaded = 1;
    }




    render() {
        this.renderInto('body');
    }

    canRenderInto(qs) {
        if (qs === ".saito-overlay") { return true; }
        return false;
    }

    renderInto(qs) {
        if (qs == ".saito-overlay") {
            if (!this.renderIntos[qs]) {
                this.renderIntos[qs] = [];
                this.renderIntos[qs].push(new StunAppspace(this.app, this, qs));
            }
            this.attachStyleSheets();
            this.renderIntos[qs].forEach((comp) => { comp.render(); });
            this.renderedInto = qs;
        }
        if (qs == "body") {
            if (!this.renderIntos[qs]) {
                this.renderIntos[qs] = [];
                this.renderIntos[qs].push(new StunAppspace(this.app, this, qs));
            }
            this.attachStyleSheets();
            this.renderIntos[qs].forEach((comp) => { comp.render(); });
            this.renderedInto = "body";
        }


    }

    respondTo(type) {
        if (type === 'invite') {
            // this.styles = [`/stun/style.css`,];
            super.render(this.app, this);
            return new StunxInvite(this.app, this);
        }
        if (type === 'saito-header') {
            return [{
                text: "Video Call",
                icon: this.icon,
                callback: function (app, id) {
                    let stun_self = app.modules.returnModule("Stun");
                    stun_self.renderInto(".saito-overlay");
                }
            }];
        }
        if (type == "game-menu") {
            this.styles = [`/${this.returnSlug()}/style.css`,];
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
                            if (game_mod.game.player.length > 1) {
                                app.connection.emit('game-start-video-call', [...game_mod.game.players]);
                            } else {
                                //Open a modal to invite someone to a video chat

                            }

                        },
                    }
                ],
            };



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

        if (type === 'saito-header') {
            let m = [{
                text: "Video Call",
                icon: this.icon,
                allowed_mods: ["redsquare", 'arcade'],
                callback: function (app, id) {
                    let pub_key = app.wallet.returnPublicKey();
                    app.connection.emit('game-start-video-call', pub_key);
                }
            }
            ];
            return m;
        }
        return null;
    }






    onConfirmation(blk, tx, conf, app) {
        let txmsg = tx.returnMessage();

        if (conf === 0) {
            if (txmsg.module === 'Stun') {
                // if (txmsg.request === "stun media channel offer") {
                //     this.receiveMediaChannelOfferTransaction(app, tx)
                // }
                // if (txmsg.request === "stun data channel offer") {
                //     this.receiveDataChannelOfferTransaction(app, tx)
                // }
                // if (txmsg.request === "stun media channel answer") {
                //     this.receiveMediaChannelAnswerTransaction(app, tx)
                // }
                // if (txmsg.request === "stun data channel answer") {
                //     this.receiveDataChannelAnswerTransaction(app, tx)
                // }
                // if (txmsg.request === "stun notifcation transmission request") {
                //     this.receiveMediaChannelNotificationTransaction(app, tx)
                // }
                // if (txmsg.request === "stun key update") {
                //     this.receiveKeyUpdateTransaction(app, tx)
                // }
                // if (txmsg.request === "receive room code") {
                //     this.receiveRoomCodeTransaction(app, tx)
                // }
                // if (txmsg.request === "stun command transmission request") {
                //     this.receiveCommandToPeerTransaction(app, tx, conf, blk)
                // }

            }
        }
    }


    async handlePeerTransaction(app, tx = null, peer, mycallback) {

        if (tx == null) { return; }
        let txmsg = tx.returnMessage();

        if (app.BROWSER === 0) {
            if (txmsg.request === "stun-create-room-transaction") {
                let stun_mod = app.modules.returnModule('Stun');
                stun_mod.receiveCreateRoomTransaction(app, tx);

            }
            if (txmsg.request === "stun-send-message-to-server") {
                let stun_mod = app.modules.returnModule('Stun');
                stun_mod.receiveStunMessageToServerTransaction(app, tx, peer);

            }

        }

        if (app.BROWSER === 1) {
            if (txmsg.request === "stun-send-message-to-peers") {
                let stun_mod = app.modules.returnModule('Stun');
                stun_mod.receiveStunMessageToPeersTransaction(app, tx);

            }

        }
        super.handlePeerTransaction(app, tx, peer, mycallback)

    }






    async sendCreateRoomTransaction(room_code) {
        let public_key = this.app.wallet.returnPublicKey();
        let newtx = this.app.wallet.createUnsignedTransaction();

        let _data = {
            public_key,
            room_code
        }
        let request = "stun command transmission request"
        let server = this.app.network.peers[0];

        // offchain data
        let data = {
            request,
            data: _data
        }

        server.sendRequestAsTransaction('stun-create-room-transaction', data);

    }


    // server receives this
    async receiveCreateRoomTransaction(app, tx) {
        let txmsg = tx.returnMessage();
        let stun_mod = app.modules.returnModule('Stun');

        let room_code = txmsg.data.data.room_code;
        let public_key = txmsg.data.data.public_key;
        stun_mod.addRoom(room_code);
        stun_mod.addKeyToRoom(room_code, public_key)
    }


    async sendStunMessageToServerTransaction(_data) {
        let request = "stun-send-message-to-server"
        let server = this.app.network.peers[0];

        // offchain data
        let data = {
            request,
            data: _data
        }
        server.sendRequestAsTransaction('stun-send-message-to-server', data);
    }

    // server receives this
    async receiveStunMessageToServerTransaction(app, tx, peer) {
        let txmsg = tx.returnMessage();
        let stun_mod = app.modules.returnModule('Stun');

        let room_code = txmsg.data.data.room_code;
        let type = txmsg.data.data.type;
        let public_key = peer.peer.publickey

        if (type === "peer-joined") {
            this.addKeyToRoom(room_code, public_key);
        }
        if (type === "peer-left") {
            this.removeKeyFromRoom(room_code, public_key);
        }
        // public keys in the room and relay;
        let recipients = [];
        if (txmsg.data.data.targetPeerId) {
            recipients.push(txmsg.data.data.targetPeerId);
        } else {
            recipients = stun_mod.rooms.get(room_code)?.filter(p => p !== public_key)
        }


        let data = {
            ...txmsg.data.data,
            public_key
        }

        this.sendStunMessageToPeersTransaction(data, recipients)

    }


    sendStunMessageToPeersTransaction(_data, recipients) {
        // send data to the peers in the room
        let request = "stun-send-message-to-peers"

        // offchain data
        let data = {
            recipient: recipients,
            request,
            data: _data
        }

        this.app.connection.emit('relay-send-message', data);
    }

    receiveStunMessageToPeersTransaction(app, tx) {
        let txmsg = tx.returnMessage();
        let data = tx.msg.data;
        app.connection.emit('stun-event-message', data);

    }





    // server functions
    addRoom(room_code) {
        if (!this.rooms.has(room_code)) {
            this.rooms.set(room_code, []);
        }
    }

    addKeyToRoom(room_code, public_key) {
        if (this.rooms.has(room_code)) {
            let public_keys = this.rooms.get(room_code);
            if (!public_keys.includes(public_key)) {
                public_keys.push(public_key)
            }
            this.rooms.set(room_code, public_keys)
        }
    }

    removeKeyFromRoom(room_code, public_key) {
        if (this.rooms.has(room_code)) {
            let public_keys = this.rooms.get(room_code).filter(p => p !== public_key);
            this.rooms.set(room_code, public_keys);
        }
    }


}

module.exports = Stun;


