const saito = require("../../lib/saito/saito");
const ModTemplate = require("../../lib/templates/modtemplate");
const EmailUI = require('./lib/email-ui');
const Slip = require('../..//lib/saito/slip.ts');
var serialize = require('serialize-javascript');
const VideoChat = require('../../lib/saito/ui/video-chat/video-chat');
const SaitoOverlay = require("../../lib/saito/ui/saito-overlay/saito-overlay");
const StunEmailAppspace = require('./lib/email-appspace/email-appspace');
const SaitoHeader = require("../../lib/saito/ui/saito-header/saito-header");
const VideoCallMain = require('./lib/main/videocall-main.template');


class VideoCall extends ModTemplate {

    constructor(app, mod) {
        super(app);
        this.appname = "VideoCall";
        this.name = "VideoCall";
        this.description = "Dedicated Video chat Module";
        this.categories = "Video Call"
        this.app = app;
        this.rooms = [];
        this.remoteStreamPosition = 0;

        this.peer_connections = {};
        this.videoMaxCapacity = 5;
        this.videoChat = new VideoChat(app, mod);

        this.overlay = new SaitoOverlay(app, this);

        this.styles = [
            '/videocall/css/videocall-main.css',
        ];


    }




    respondTo(type) {
        if (type === 'email-appspace') {
            return new StunEmailAppspace(this.app, this);
        }
        return null;
    }



    render(app, mod) {
        if (app.BROWSER != 1 || this.browser_active != 1) {
            return;
        }
        if (this.header == null) {
            this.header = new SaitoHeader(app, this);
        }

        this.header.render(app, this);
        this.header.attachEvents(app, this);
        new StunEmailAppspace(this.app, this).render(this.app, this);
        super.render(app, mod);
    }


    renderEmail(app, mod) {
        EmailUI.render(app, mod);
    }

    attachEmailEvents(app, mod) {
        EmailUI.attachEvents(app, mod);
    }


    async handleUrlParams(params) {
        // if (this.app.BROWSER === 0) return;
        if (params.has('invite_code')) {
            const invite_code = params.get('invite_code');
            const videocall_mod = this.app.modules.returnModule('VideoCall');
            const result = await videocall_mod.joinVideoInvite(invite_code);
            if (result) {
                salert(result);
            }


        }
    }


    onConfirmation(blk, tx, conf, app) {

        let txmsg = tx.returnMessage();

        if (conf === 0) {
            if (txmsg.module === 'VideoCall') {
                let videocall_self = app.modules.returnModule("VideoCall");
                let stun_mod = app.modules.returnModule('Stun');

                let my_pubkey = app.wallet.returnPublicKey();
                if (tx.msg.answer) {
                    if (my_pubkey === tx.msg.answer.offer_creator) {
                        if (app.BROWSER !== 1) return;
                        console.log("current instance: ", my_pubkey, " answer room: ", tx.msg.answer);
                        console.log("peer connections: ", videocall_self.peer_connections);
                        const reply = tx.msg.answer.reply;

                        if (videocall_self.peer_connections[tx.msg.answer.answer_creator]) {
                            videocall_self.peer_connections[tx.msg.answer.answer_creator].setRemoteDescription(reply.answer).then(result => {
                                console.log('setting remote description of ', videocall_self.peer_connections[tx.msg.answer.answer_creator]);

                            }).catch(error => console.log(" An error occured with setting remote description for :", videocall_self.peer_connections[tx.msg.answer.answer_creator], error));
                            if (reply.ice_candidates.length > 0) {
                                console.log("Adding answer candidates");
                                for (let i = 0; i < reply.ice_candidates.length; i++) {
                                    videocall_self.peer_connections[tx.msg.answer.answer_creator].addIceCandidate(reply.ice_candidates[i]);
                                }
                            }

                        } else {
                            console.log("peer connection not found");
                        }
                    }
                }
                if (tx.msg.rooms) {
                    videocall_self.rooms = tx.msg.rooms.rooms
                    console.log("rooms ", videocall_self.rooms);
                }

                if (tx.msg.offers && app.BROWSER === 1) {
                    if (app.BROWSER !== 1) return;

                    const offer_creator = tx.msg.offers.offer_creator;
                    // offer creator should not respond
                    if (my_pubkey === offer_creator) return;
                    console.log("offers received from ", tx.msg.offers.offer_creator);
                    // check if current instance is a recipent
                    const index = tx.msg.offers.offers.findIndex(offer => offer.recipient === my_pubkey);
                    if (index !== -1) {
                        videocall_self.acceptOfferAndBroadcastAnswer(app, offer_creator, tx.msg.offers.offers[index]);
                    }


                }
            }
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
        let videocall_self = app.modules.returnModule("VideoCall");
        switch (req.request) {

            case "onboard_rooms":
                console.log('room onboarded: ', tx.msg.rooms.rooms);
                videocall_self.rooms = tx.msg.rooms.rooms
                app.options.rooms = tx.msg.rooms.rooms
                app.storage.saveOptions();
                break;

            case "create_new_room":



                console.log('new room created: ', tx.msg.room.room);

                app.options.rooms.push(tx.msg.room.room);
                app.storage.saveOptions();
                console.log("rooms: ", videocall_self.rooms);
                break;

            case "update_rooms":

                console.log('room updated: ', tx.msg.rooms.rooms);
                app.options.rooms = tx.msg.rooms.rooms;
                app.storage.saveOptions();
                // videocall_self.rooms = tx.msg.rooms.rooms

                break;

            case "videochat_broadcast":
                app.network.peers.forEach(peer => {
                    console.log('sending to: ', peer.returnPublicKey());

                    if (tx.msg.room) {
                        peer.sendRequest('create_new_room', tx);
                    }
                    if (tx.msg.rooms) {
                        peer.sendRequest('update_rooms', tx);
                    }

                })

                // update server 
                if (tx.msg.room) {
                    this.rooms.push(tx.msg.room.room);
                }
                if (tx.msg.rooms) {
                    this.rooms = tx.msg.rooms.rooms;
                }

            // app.network.(tx);
        }
    }


    onPeerHandshakeComplete() {
        // send latest copy of rooms to this peer
        // lite clients are not allowed to run this
        if (this.app.BROWSER === 0) {
            let newtx2 = this.app.wallet.createUnsignedTransaction();
            // newtx2.transaction.to.push(new saito.default.slip(this.app.network.peers[this.app.network.peers.length - 1].returnPublicKey()));

            // console.log('sending to ', this.app.network.peers[this.app.network.peers.length - 1].returnPublicKey(), this.rooms);
            const recipient = this.app.network.peers[this.app.network.peers.length - 1].returnPublicKey();
            newtx2.msg.module = "VideoCall";
            newtx2.msg.rooms = {
                rooms: this.rooms
            };

            console.log('get rooms from server :', recipient, this.rooms);

            console.log(newtx2)
            newtx2 = this.app.wallet.signTransaction(newtx2);


            let relay_mod = this.app.modules.returnModule('Relay');
            relay_mod.sendRelayMessage(recipient, 'onboard_rooms', newtx2);

        }

    }

    acceptOfferAndBroadcastAnswer(app, offer_creator, offer) {
        let stun_mod = app.modules.returnModule("Stun");

        console.log('accepting offer');
        console.log('from:', offer_creator, offer)

        const createPeerConnection = async () => {
            let reply = {
                answer: "",
                ice_candidates: []
            }
            const pc = new RTCPeerConnection({
                iceServers: stun_mod.servers,
            });
            try {

                pc.onicecandidate = (ice) => {
                    if (!ice || !ice.candidate || !ice.candidate.candidate) {
                        console.log('ice candidate check closed');
                        let videocall_mod = app.modules.returnModule("VideoCall");
                        videocall_mod.peer_connections[offer_creator] = pc;
                        videocall_mod.broadcastAnswer(videocall_mod.app.wallet.returnPublicKey(), offer_creator, reply);
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
                    // $('#connection-status').html(` <p style="color: green" class="data">Connected to ${peer_key}</p>`);
                }

                // add tracks

                const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                localStream.getTracks().forEach(track => {
                    pc.addTrack(track, localStream);
                    console.log('got my local stream');
                });

                let videocall_self = app.modules.returnModule("VideoCall");
                videocall_self.videoChat.show(pc, app, videocall_self);
                videocall_self.videoChat.addLocalStream(localStream);


                const remoteStream = new MediaStream();
                pc.addEventListener('track', (event) => {
                    let videocall_self = app.modules.returnModule("VideoCall");
                    console.log('got remote stream from offer creator ', event.streams);
                    event.streams[0].getTracks().forEach(track => {
                        remoteStream.addTrack(track);
                    });
                    videocall_self.videoChat.addRemoteStream(remoteStream, offer_creator);

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

                // console.log("peer connection ", pc);





            } catch (error) {
                console.log("error", error);
            }

        }

        createPeerConnection();

    }


    createVideoInvite() {
        // room code hardcoded here for dev purposes

        let roomCode = this.generateString(6);
        roomCode = roomCode.trim();
        const videocall_self = this.app.modules.returnModule("VideoCall");
        const html = `
        <div style="background-color: white; padding: 2rem 3rem; border-radius: 8px; display:flex; flex-direction: column; align-items: center; justify-content: center; align-items:center">
           <p style= margin-bottom: 1.5rem;">  Invite Created </p>
           <div style="display: grid; align-item: center; grid-template-columns:max-content 1fr;"> 
           <p style="margin-right: .5rem;  color: var(--saito-red)"> ${roomCode} </p>   <div style="margin-right: .5rem" id="copyVideoInviteCode"> <i class="fa fa-copy"> </i> </div> 
           <p style="margin-right: .5rem;  color: var(--saito-red);"> ${window.location.host}/videocall?invite_code=${roomCode} </p>  <div style="margin-right: .5rem" id="copyVideoInviteLink"> <i class="fa fa-copy"> </i> </div>
           </div>
           
        </div>
        `
        document.querySelector('#inviteCode').value = roomCode;


        // prevent dupicate room code creation -- for development purposes
        let room = this.rooms.find(room => room.code === roomCode);
        if (room) return console.log('room already created');


        room = { code: roomCode, peers: [], peerCount: 0, isMaxCapicity: false, validityPeriod: 86400, startTime: Date.now(), checkpoint: 0 };


        let newtx = this.app.wallet.createUnsignedTransaction();

        // get recipient -- server in this case
        let recipient = this.app.network.peers[0].peer.publickey;
        newtx.transaction.to.push(new saito.default.slip(recipient));



        newtx.msg.module = "VideoCall";
        newtx.msg.room = {
            room
        };
        newtx = this.app.wallet.signTransaction(newtx);


        let relay_mod = this.app.modules.returnModule('Relay');
        relay_mod.sendRelayMessage(recipient, 'videochat_broadcast', newtx);

        const overlay = new SaitoOverlay(this.app);


        overlay.show(this.app, videocall_self, html, null, () => {
            console.log("attaching copy event")
            document.querySelector('#copyVideoInviteCode i').addEventListener('click', (e) => {
                navigator.clipboard.writeText(`${roomCode}`);
                document.querySelector("#copyVideoInviteCode").textContent = "Copied to clipboard";
            });
            document.querySelector('#copyVideoInviteLink i').addEventListener('click', (e) => {
                navigator.clipboard.writeText(`${window.location.host}/videocall?invite_code=${roomCode}`);
                document.querySelector("#copyVideoInviteLink").textContent = "Copied to clipboard";
            });
        });

        siteMessage("Room created successfully", 5000);
    }



    createPeerConnectionOffer(publicKey) {
        const stun_mod = this.app.modules.returnModule('Stun');

        const createPeerConnection = new Promise((resolve, reject) => {
            let ice_candidates = [];
            const execute = async () => {

                try {
                    const pc = new RTCPeerConnection({
                        iceServers: stun_mod.servers,
                    });



                    pc.onicecandidate = (ice) => {
                        if (!ice || !ice.candidate || !ice.candidate.candidate) {

                            // pc.close();

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

                                // siteMessage("Connected");
                                break;

                            case "disconnecting":
                                break;

                            default:
                                ""
                                break;
                        }
                    }

                    const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                    localStream.getTracks().forEach(track => {
                        pc.addTrack(track, localStream);

                    });


                    const videocall_self = this.app.modules.returnModule('VideoCall');
                    this.videoChat.show(pc, this.app, videocall_self);
                    this.videoChat.addLocalStream(localStream)



                    pc.LOCAL_STREAM = localStream
                    const remoteStream = new MediaStream();

                    pc.addEventListener('track', (event) => {

                        console.log('current peer connection ', this.peer_connections);



                        console.log('got remote stream', event.streams);
                        event.streams[0].getTracks().forEach(track => {
                            remoteStream.addTrack(track);
                            this.remoteStreamPosition += 1;
                        });


                        this.videoChat.addRemoteStream(remoteStream, publicKey);


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

    generateString(length) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = ' ';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }

        return result.trim();
    }


    async joinVideoInvite(roomCode) {
        if (!roomCode) return siteMessage("Please insert a room code", 5000);
        const stun_mod = this.app.modules.returnModule("stun");
        const room = this.app.options.rooms.find(room => room.code === roomCode);
        const index = this.app.options.rooms.findIndex(room => room.code === roomCode);

        console.log('rooms :', this.app.options.rooms, 'result :', room, index);


        if (!room) {
            console.log('Invite code is invalid');
            return "Invite code is invalid";
        }

        if (room.isMaxCapicity) {
            console.log("Room has reached max capacity");
            return "Room has reached max capacity";

        }

        if (Date.now() < room.startTime) {
            siteMessage("Video call time is not yet reached", 5000);
            console.log("Video call time is not yet reached");
            return "Video call time is not yet reached";
        }




        // check if peer  already exists

        let publicKey = this.app.wallet.returnPublicKey();
        let peerPosition = room.peerCount + 1;

        const peer_data = {
            publicKey,
            peerPosition,
        }


        // check if publicKey is already in list of peers
        const keyIndex = room.peers.findIndex(peer => peer.publicKey === this.app.wallet.returnPublicKey())

        if (keyIndex === -1) {
            console.log("key doesn't exist in room list, adding now...");
            room.peers.push(peer_data);
            room.peerCount = room.peerCount + 1;
            if (room.peerCount === this.videoMaxCapacity) {
                room.isMaxCapicity = true;
            }

        }

        let peerConnectionOffers = [];
        if (room.peers.length > 1) {
            // send connection to other peers if they exit
            for (let i = 0; i < room.peers.length; i++) {
                if (room.peers[i].publicKey !== this.app.wallet.returnPublicKey()) {
                    peerConnectionOffers.push(this.createPeerConnectionOffer(room.peers[i].publicKey));
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
                this.broadcastOffers(this.app.wallet.returnPublicKey(), offers);
            } else {
                const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                let videocall_self = this.app.modules.returnModule("VideoCall");
                videocall_self.videoChat.show(new RTCPeerConnection({}), this.app, videocall_self);
                videocall_self.videoChat.addLocalStream(localStream);
                console.log("you are the only participant in the room");
                siteMessage("Room joined, you are the only participant in the room", 5000)
            }

        } catch (error) {
            console.log('an error occurred with peer connection creation', error);
        }



        console.log("peer connections ", this.peer_connections);


        // update rooms 
        this.app.options.rooms[index] = room;
        this.app.storage.saveOptions();
        let newtx = this.app.wallet.createUnsignedTransaction();

        let recipient = this.app.network.peers[0].returnPublicKey();
        // for (let i = 0; i < this.app.network.peers.length; i++) {
        //     if (this.app.wallet.returnPublicKey() !== this.app.network.peers[i].returnPublicKey()) {
        //         newtx.transaction.to.push(new saito.default.slip(this.app.network.peers[i].returnPublicKey()));
        //     }

        // }

        newtx.msg.module = "VideoCall";
        newtx.msg.rooms = {
            rooms: this.app.options.rooms
        };

        newtx = this.app.wallet.signTransaction(newtx);
        let relay_mod = this.app.modules.returnModule('Relay');
        relay_mod.sendRelayMessage(recipient, 'videochat_broadcast', newtx);
        siteMessage("Starting video connection", 5000)
        // this.app.network.propagateTransaction(newtx);








    }




    broadcastOffers(offer_creator, offers) {
        let newtx = this.app.wallet.createUnsignedTransaction();
        console.log('broadcasting offers');
        for (let i = 0; i < offers.length; i++) {
            newtx.transaction.to.push(new saito.default.slip(offers[i].recipient));
        }

        newtx.msg.module = "VideoCall";
        newtx.msg.offers = {
            offer_creator,
            offers
        }

        newtx = this.app.wallet.signTransaction(newtx);
        console.log(this.app.network);
        this.app.network.propagateTransaction(newtx);
    }



    broadcastAnswer(answer_creator, offer_creator, reply) {
        let newtx = this.app.wallet.createUnsignedTransaction();
        console.log('broadcasting answer to ', offer_creator);
        newtx.transaction.to.push(new saito.default.slip(offer_creator));

        newtx.msg.module = "VideoCall";
        newtx.msg.answer = {
            answer_creator,
            offer_creator,
            reply: reply
        };
        newtx = this.app.wallet.signTransaction(newtx);
        console.log(this.app.network);
        this.app.network.propagateTransaction(newtx);
    }


}

module.exports = VideoCall;

