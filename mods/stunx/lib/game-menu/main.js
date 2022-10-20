

class StunxGameMenu {

    constructor(app, mod) {
        this.app = app;
        this.mod = mod;

        this.app.connection.on('game-receive-video-call', (app, offer_creator, offer) => {
            this.receiveVideoCall(app, offer_creator, offer);
        })
        this.app.connection.on('game-start-video-call', (peers) => {
            this.startVideoCall(peers);
        })
    }


    async startVideoCall(peers) {
        if (peers.constructor !== Array) {
            peers = [peers]
        }
        const stunx_mod = this.app.modules.returnModule('Stunx');
        const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        stunx_mod.setLocalStream(localStream);
        // stunx_mod.setChatType("game");
        peers.forEach(peer => {
            this.app.connection.emit('show-video-chat-request', this.app, this, "small");
            this.app.connection.emit('render-local-stream-request', localStream, "small");
            this.app.connection.emit('render-remote-stream-placeholder-request', peer, "small");
        })

        stunx_mod.createStunConnectionWithPeers(peers, 'small');

    }

    async receiveVideoCall(app, offer_creator, offer) {
        console.log('receiving video call');
        const promise = sconfirm("Accept Incoming video call");
        promise.then(async () => {
            const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            const stunx_mod = this.app.modules.returnModule('Stunx');
            stunx_mod.setLocalStream(localStream);
            // stunx_mod.setChatType("game");
            this.app.connection.emit('show-video-chat-request', this.app, this, "small");
            this.app.connection.emit('render-local-stream-request', localStream, "small");
            stunx_mod.acceptPeerConnectionOffer(app, offer_creator, offer, 'small');
        }).catch(error => {
            salert("Video call rejected");
        })

    }
}


module.exports = StunxGameMenu;


