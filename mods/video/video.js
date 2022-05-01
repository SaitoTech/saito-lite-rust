const saito = require("./../../lib/saito/saito");
const ModTemplate = require("../../lib/templates/modtemplate");
// const StunUI = require('./lib/stun-ui');
const Slip = require('../..//lib/saito/slip.ts');
var serialize = require('serialize-javascript');
const VideoChat = require('../../lib/saito/ui/video-chat/video-chat');
const SaitoOverlay = require("../../lib/saito/ui/saito-overlay/saito-overlay");


class Video extends ModTemplate {

    constructor(app, mod) {
        super(app);
        this.appname = "Video";
        this.name = "Video";
        this.description = "Dedicated Video chat Module";
        this.categories = "Video Call"
        this.app = app;
        this.invites = [];
        this.remoteStreamPosition = 0;

        this.peer_connections = {};
        this.videoMaxCapacity = 5;
        this.videoChat = new VideoChat(app, mod);
    }

    onConfirmation(blk, tx, conf, app) {
        let txmsg = tx.returnMessage();

        if (conf === 0) {
            if (txmsg.module === 'Video') {
                console.log("video testing ...");
                let video_self = app.modules.returnModule("Video");
                let stun_mod = app.modules.returnModule('Stun');

                let address = app.wallet.returnPublicKey();
                if (tx.msg.answerInvite) {

                    if (address === tx.msg.answerInvite.peer_b) {
                        if (app.BROWSER !== 1) return;
                        console.log("current instance: ", address, " answer invite: ", tx.msg.answerInvite);
                        console.log("peer connections: ", video_self.peer_connections);
                        const reply = tx.msg.answerInvite.reply;

                        if (video_self.peer_connections[tx.msg.answerInvite.peer_a]) {
                            video_self.peer_connections[tx.msg.answerInvite.peer_a].setRemoteDescription(reply.answer).then(result => {
                                console.log('remote description set', video_self.peer_connections[tx.msg.answerInvite.peer_a]);

                            }).catch(error => console.log(" An error occured with setting remote description :", error));
                            if (reply.iceCandidates.length > 0) {
                                console.log("Adding answerInvite candidates");
                                for (let i = 0; i < reply.iceCandidates.length; i++) {
                                    video_self.peer_connections[tx.msg.answerInvite.peer_a].addIceCandidate(reply.iceCandidates[i]);
                                }
                            }
                            console.log('peer connections', video_self.peer_connections);
                        } else {
                            console.log("peer connection not found");
                        }


                    }
                }
                if (tx.msg.invites) {
                    video_self.invites = tx.msg.invites.invites
                    console.log("invites ", video_self.invites);
                }


                if (tx.msg.invite) {
                    // console.log('new invite')
                    // video_self.invites.push(tx.msg.invite.invite);
                    // console.log('peers ', video_self.app.network.peers);
                    // console.log("invites: ", video_self.invites);
                }

                if (tx.msg.offers && app.BROWSER === 1) {
                    if (app.BROWSER !== 1) return;

                    const offer_creator = tx.msg.offers.offer_creator;
                    console.log("offers received from ", tx.msg.offers.offer_creator, tx.msg.offers);
                    if (address === offer_creator) return;
                    const index = tx.msg.offers.offer_recipients.findIndex(item => item === address);

                    if (index !== -1) {
                        video_self.acceptOfferAndCreateAnswer(app, offer_creator, tx.msg.offers.offers[index], tx.msg.offers.iceCandidates[index]);
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
        let video_self = app.modules.returnModule("Video");
        switch (req.request) {

            case "onboard_invites":
                console.log('invite onboarded: ', tx.msg.invites.invites);
                video_self.invites = tx.msg.invites.invites
                break;

            case "new_create_invite":



                console.log('new invite created: ', tx.msg.invite.invite);
                video_self.invites.push(tx.msg.invite.invite);
                console.log('peers ', app.network.peers);
                console.log("invites: ", video_self.invites);
                break;

            case "update_invites":

                console.log('invite updated: ', tx.msg.invites.invites);
                video_self.invites = tx.msg.invites.invites

                break;

            case "videochat_broadcast":
                app.network.peers.forEach(peer => {
                    console.log('sending to: ', peer.returnPublicKey());
                    tx.transaction.to.push(new saito.default.slip(peer.returnPublicKey()));
                    if (tx.msg.invite) {
                        peer.sendRequest('new_create_invite', tx);
                    }
                    if (tx.msg.invites) {
                        peer.sendRequest('update_invites', tx);
                    }

                })

                // update server 
                if (tx.msg.invite) {
                    this.invites.push(tx.msg.invite.invite);
                }
                if (tx.msg.invites) {
                    this.invites = tx.msg.invites.invites;
                }

            // app.network.(tx);
        }
    }


    onPeerHandshakeComplete() {
        // send latest copy of invites to this peer
        // lite clients are not allowed to run this
        if (this.app.BROWSER === 0) {
            let newtx2 = this.app.wallet.createUnsignedTransaction();

            newtx2.transaction.to.push(new saito.default.slip(this.app.network.peers[this.app.network.peers.length - 1].returnPublicKey()));

            // console.log('sending to ', this.app.network.peers[this.app.network.peers.length - 1].returnPublicKey(), this.invites);
            const recipient = this.app.network.peers[this.app.network.peers.length - 1].returnPublicKey();
            newtx2.msg.module = "Video";
            newtx2.msg.invites = {
                invites: this.invites
            };

            console.log('onboarding invite :', recipient, this.invites);

            console.log(newtx2)
            newtx2 = this.app.wallet.signTransaction(newtx2);
            // this.app.network.propagateTransaction(newtx2);

            let relay_mod = this.app.modules.returnModule('Relay');
            relay_mod.sendRelayMessage(recipient, 'onboard_invites', newtx2);

        }

    }

    acceptOfferAndCreateAnswer(app, offer_creator, offer_sdp, iceCandidates) {
        let stun_mod = app.modules.returnModule("Stun");

        console.log('accepting offer');
        console.log('info ', offer_creator, offer_sdp, iceCandidates)
        const createPeerConnection = async () => {
            let reply = {
                answer: "",
                iceCandidates: []
            }
            const pc = new RTCPeerConnection({
                iceServers: [
                    {
                        urls: "stun:openrelay.metered.ca:80",
                    },
                    {
                        urls: "turn:openrelay.metered.ca:80",
                        username: "openrelayproject",
                        credential: "openrelayproject",
                    },
                    {
                        urls: "turn:openrelay.metered.ca:443",
                        username: "openrelayproject",
                        credential: "openrelayproject",
                    },
                    {
                        urls: "turn:openrelay.metered.ca:443?transport=tcp",
                        username: "openrelayproject",
                        credential: "openrelayproject",
                    },
                ],
            });
            try {

                pc.onicecandidate = (ice) => {
                    if (!ice || !ice.candidate || !ice.candidate.candidate) {
                        console.log('ice candidate check closed');

                        let video_mod = app.modules.returnModule("Video");
                        video_mod.peer_connections[offer_creator] = pc;
                        console.log('broadcasting answer ', video_mod.peer_connections);
                        video_mod.broadcastAnswerInvite(video_mod.app.wallet.returnPublicKey(), offer_creator, reply);
                        return;

                    };

                    reply.iceCandidates.push(ice.candidate);





                }

                // pc.onconnectionstatechange = e => {
                //   console.log("connection state ", pc.connectionState)
                //   switch (pc.connectionState) {


                //     case "connected":
                //       vanillaToast.cancelAll();
                //       vanillaToast.success('Connected', { duration: 3000, fadeDuration: 500 });
                //       break;

                //     case "disconnected":
                //       StunUI.displayConnectionClosed();
                //       vanillaToast.error('Disconnected', { duration: 3000, fadeDuration: 500 });
                //       break;

                //     default:
                //       ""
                //       break;
                //   }
                // }

                // add data channels 
                const data_channel = pc.createDataChannel('channel');
                pc.dc = data_channel;
                pc.dc.onmessage = (e) => {

                    console.log('new message from client : ', e.data);
                    // StunUI.displayMessage(peer_key, e.data);
                };
                pc.dc.open = (e) => {
                    console.log('connection opened');
                    // $('#connection-status').html(` <p style="color: green" class="data">Connected to ${peer_key}</p>`);
                }

                // add tracks

                const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                localStream.getTracks().forEach(track => {
                    pc.addTrack(track, localStream);
                    console.log('got local stream for answerer');
                });

                let video_self = app.modules.returnModule("Video");

                video_self.videoChat.show(pc);
                video_self.videoChat.addLocalStream(localStream);


                const remoteStream = new MediaStream();
                pc.addEventListener('track', (event) => {
                    let video_self = app.modules.returnModule("Video");
                    console.log('got remote stream ', event.streams);
                    event.streams[0].getTracks().forEach(track => {
                        remoteStream.addTrack(track);
                    });
                    video_self.videoChat.addRemoteStream(remoteStream, offer_creator);

                });


                await pc.setRemoteDescription(offer_sdp);

                const peerIceCandidates = iceCandidates;
                // console.log('peer ice candidates', peerIceCandidates);
                if (peerIceCandidates.length > 0) {
                    console.log('adding offer candidates');
                    for (let i = 0; i < peerIceCandidates.length; i++) {
                        pc.addIceCandidate(peerIceCandidates[i]);
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
        // invite code hardcoded here for dev purposes

        let inviteCode = this.generateString(6);
        inviteCode = inviteCode.trim();
        const video_self = this.app.modules.returnModule("Video");
        const html = `
        <div style="background-color: white; padding: 2rem 3rem; border-radius: 8px; display:flex; flex-direction: column; align-items: center; justify-content: center; align-items:center">
           <p style="font-weight: bold; margin-bottom: 3px;">  Invite Code: </p>
           <p> ${inviteCode} </p>
        </div>
        `


        // prevent dupicate invite code creation -- for development purposes
        let invite = this.invites.find(invite => invite.code === inviteCode);
        if (invite) return console.log('invite already created');


        invite = { code: inviteCode, peers: [], peerCount: 0, isMaxCapicity: false, validityPeriod: 86400, startTime: Date.now(), checkpoint: 0 };


        let newtx = this.app.wallet.createUnsignedTransaction();

        // get recipient -- server in this case
        let recipient = this.app.network.peers[0].peer.publickey;
        newtx.transaction.to.push(new saito.default.slip(recipient));



        newtx.msg.module = "Video";
        newtx.msg.invite = {
            invite
        };
        newtx = this.app.wallet.signTransaction(newtx);


        let relay_mod = this.app.modules.returnModule('Relay');
        relay_mod.sendRelayMessage(recipient, 'videochat_broadcast', newtx);

        const overlay = new SaitoOverlay(this.app);

        overlay.show(this.app, video_self, html);



    }

    createPeerConnectionOffer(publicKey) {
        const stun_mod = this.app.modules.returnModule('Stun');

        const createPeerConnection = new Promise((resolve, reject) => {
            let iceCandidates = [];
            const execute = async () => {

                try {
                    const pc = new RTCPeerConnection({
                        iceServers: [
                            {
                                urls: "stun:openrelay.metered.ca:80",
                            },
                            {
                                urls: "turn:openrelay.metered.ca:80",
                                username: "openrelayproject",
                                credential: "openrelayproject",
                            },
                            {
                                urls: "turn:openrelay.metered.ca:443",
                                username: "openrelayproject",
                                credential: "openrelayproject",
                            },
                            {
                                urls: "turn:openrelay.metered.ca:443?transport=tcp",
                                username: "openrelayproject",
                                credential: "openrelayproject",
                            },
                        ],
                    });



                    pc.onicecandidate = (ice) => {
                        if (!ice || !ice.candidate || !ice.candidate.candidate) {

                            // pc.close();

                            let offer_sdp = pc.localDescription;
                            resolve({ publicKey, offer_sdp, iceCandidates, pc });
                            // stun_mod.broadcastIceCandidates(my_key, peer_key, ['savior']);

                            return;
                        } else {
                            iceCandidates.push(ice.candidate);
                        }

                    };

                    const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                    localStream.getTracks().forEach(track => {
                        pc.addTrack(track, localStream);

                    });



                    this.videoChat.show(pc);
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


    async joinVideoInvite(inviteCode) {
        const stun_mod = this.app.modules.returnModule("Stun");
        const video_self = this.app.modules.returnModule("Video");
        const invite = video_self.invites.find(invite => invite.code === inviteCode);
        const index = video_self.invites.findIndex(invite => invite.code === inviteCode);

        console.log('invites :', video_self.invites, 'result :', invite, index);


        if (!invite) return console.log('invite does not exist');

        if (invite.isMaxCapicity) {
            return console.log("Room has reached max capacity");
        }

        if (Date.now() < invite.startTime) {
            return console.log("Video call time not reached");
        }


        // check if peer already exists

        // check if peer  already exists

        let publicKey = this.app.wallet.returnPublicKey();
        let peerPosition = invite.peerCount + 1;

        const peer_data = {
            publicKey,
            peerPosition,
        }


        // check if publicKey is already in list of peers
        const keyIndex = invite.peers.findIndex(peer => peer.publicKey === this.app.wallet.returnPublicKey())

        if (keyIndex === -1) {
            console.log("key doesn't exist in invite list, adding now...");
            invite.peers.push(peer_data);
            invite.peerCount = invite.peerCount + 1;

        }



        const peerConnectionOffers = []

        if (invite.peers.length > 1) {

            // send connection to other peers if they exit
            for (let i = 0; i < invite.peers.length; i++) {
                if (invite.peers[i].publicKey !== this.app.wallet.returnPublicKey()) {
                    peerConnectionOffers.push(this.createPeerConnectionOffer(invite.peers[i].publicKey));
                }
            }
        }


        try {
            const peerConnections = await Promise.all(peerConnectionOffers);


            if (peerConnections.length > 0) {
                console.log('peer connection offers ', peerConnections);
                for (let i = 0; i < peerConnections.length; i++) {
                    this.peer_connections[peerConnections[i].publicKey] = peerConnections[i].pc

                }
                const offer_recipients = peerConnections.map(item => item.publicKey);
                const offers = peerConnections.map(item => item.offer_sdp);
                const iceCandidates = peerConnections.map(item => item.iceCandidates);
                this.broadcastOffers(this.app.wallet.returnPublicKey(), offer_recipients, offers, iceCandidates);
            } else {
                console.log("there needs to be more than 1 participant in the room");
            }

        } catch (error) {
            console.log('an error occurred with peer connection creation', error);
        }



        console.log("peer connections ", this.peer_connections);


        // update invites 
        this.invites[index] = invite;
        let newtx = this.app.wallet.createUnsignedTransaction();

        let recipient = this.app.network.peers[0].returnPublicKey();
        // for (let i = 0; i < this.app.network.peers.length; i++) {
        //     if (this.app.wallet.returnPublicKey() !== this.app.network.peers[i].returnPublicKey()) {
        //         newtx.transaction.to.push(new saito.default.slip(this.app.network.peers[i].returnPublicKey()));
        //     }

        // }

        newtx.msg.module = "Video";
        newtx.msg.invites = {
            invites: this.invites
        };

        newtx = this.app.wallet.signTransaction(newtx);
        let relay_mod = this.app.modules.returnModule('Relay');
        relay_mod.sendRelayMessage(recipient, 'videochat_broadcast', newtx);
        // this.app.network.propagateTransaction(newtx);






    }




    broadcastOffers(my_key, offer_recipients, offers, iceCandidates) {
        let newtx = this.app.wallet.createUnsignedTransaction();
        console.log('broadcasting offers');
        for (let i = 0; i < offers.length; i++) {
            if (offers.length === offer_recipients.length) {
                newtx.transaction.to.push(new saito.default.slip(offer_recipients[i]));
            } else {
                return console.log("offer and receipent length not equal");
            }
        }

        newtx.msg.module = "Video";
        newtx.msg.offers = {
            offer_creator: my_key,
            offer_recipients: offer_recipients,
            offers,
            iceCandidates
        }
        console.log('new tx', newtx);
        newtx = this.app.wallet.signTransaction(newtx);
        console.log(this.app.network);
        this.app.network.propagateTransaction(newtx);
    }



    broadcastAnswerInvite(my_key, peer_key, reply) {
        let newtx = this.app.wallet.createUnsignedTransaction();
        console.log('broadcasting answer  to ', peer_key);
        newtx.transaction.to.push(new saito.default.slip(peer_key));

        newtx.msg.module = "Video";
        newtx.msg.answerInvite = {
            peer_a: my_key,
            peer_b: peer_key,
            reply: reply
        };
        newtx = this.app.wallet.signTransaction(newtx);
        console.log(this.app.network);
        this.app.network.propagateTransaction(newtx);
    }


}

module.exports = Video;

