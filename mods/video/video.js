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

                        // stun_self.app.connection.emit('answer_received', tx.msg.answer.peer_a, tx.msg.answer.peer_b, tx.msg.answer.reply);
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
                    console.log('new invite')
                    video_self.invites.push(tx.msg.invite.invite);
                    console.log('peers ', video_self.app.network.peers);
                    console.log("invites: ", video_self.invites);
                }

                if (tx.msg.offers && app.BROWSER === 1) {
                    console.log("offers received from ", tx.msg.offers.offer_creator, tx.msg.offers);
                    const offer_creator = tx.msg.offers.offer_creator;
                    if (address === offer_creator) return;
                    for (let i = 0; i < tx.msg.offers.offer_recipients.length; i++) {
                        if (address === tx.msg.offers.offer_recipients[i]) {
                            stun_mod.acceptOfferAndCreateAnswer(app, offer_creator, tx.msg.offers.offers[i], tx.msg.offers.iceCandidates[i]);
                        }

                    }
                }
            }
        }
    }


    onPeerHandshakeComplete() {
        // send latest copy of invites to this peer
        // lite clients are not allowed to run this
        if (this.app.BROWSER == 0) {
            let newtx2 = this.app.wallet.createUnsignedTransaction();
            if (this.app.network.peers.length > 0) {
                newtx2.transaction.to.push(new saito.default.slip(this.app.network.peers[this.app.network.peers.length - 1].returnPublicKey()));

                console.log('sending to ', this.app.network.peers[this.app.network.peers.length - 1].returnPublicKey(), this.invites);
                newtx2.msg.module = "Video";
                newtx2.msg.invites = {
                    invites: this.invites
                };

                console.log(newtx2)
                newtx2 = this.app.wallet.signTransaction(newtx2);
                this.app.network.propagateTransaction(newtx2);
            }
        }

    }


    createVideoInvite() {
        // invite code hardcoded here for dev purposes

        let inviteCode = this.generateString(6);
        inviteCode = inviteCode.trim();
        const video_self = this.app.modules.returnModule("Video");
        const html = `
        <div style="background-color: white; padding: 2rem 3rem; border-radius: 8px; display:flex; flex-direction: column; align-items: center; justify-content: center; align-items:center">
           <p style="font-weight: bold;">  Invite Code: </p>
           <p> ${inviteCode} </p>
        </div>
        `


        // prevent dupicate invite code creation -- for development purposes
        let invite = this.invites.find(invite => invite.code === inviteCode);
        if (invite) return console.log('invite already created');


        invite = { code: inviteCode, peers: [], peerCount: 0, isMaxCapicity: false, validityPeriod: 86400, startTime: Date.now(), checkpoint: 0 };


        let newtx = this.app.wallet.createUnsignedTransaction();

        for (let i = 0; i < this.app.network.peers.length; i++) {
            if (this.app.network.peers[i].returnPublicKey() != this.app.wallet.returnPublicKey()) {
                newtx.transaction.to.push(new saito.default.slip(this.app.network.peers[i].returnPublicKey()));
            }
        }

        newtx.msg.module = "Video";
        newtx.msg.invite = {
            invite
        };
        newtx = this.app.wallet.signTransaction(newtx);
        this.app.network.propagateTransaction(newtx);

        const overlay = new SaitoOverlay(this.app);

        overlay.show(this.app, video_self, html);



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
                    peerConnectionOffers.push(stun_mod.createPeerConnectionOffer(invite.peers[i].publicKey));
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

        for (let i = 0; i < this.app.network.peers.length; i++) {
            if (this.app.wallet.returnPublicKey() !== this.app.network.peers[i].returnPublicKey()) {
                newtx.transaction.to.push(new saito.default.slip(this.app.network.peers[i].returnPublicKey()));
            }

        }

        newtx.msg.module = "Video";
        newtx.msg.invites = {
            invites: this.invites
        };

        newtx = this.app.wallet.signTransaction(newtx);
        this.app.network.propagateTransaction(newtx);






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

