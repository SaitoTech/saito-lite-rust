

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
        this.app.connection.on('game-start-audio-call', (peers) => {
            this.startAudoCall(peers);
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
            this.app.connection.emit('show-video-chat-request', this.app, this, "small", "video");
            this.app.connection.emit('render-local-stream-request', localStream, "small", "video");
            this.app.connection.emit('render-remote-stream-placeholder-request', peer, "small", "video");
        })

        stunx_mod.createMediaConnectionWithPeers(peers, 'small', 'video');

    }


    async startAudoCall(peers) {
        if (peers.constructor !== Array) {
            peers = [peers]
        }
        const stunx_mod = this.app.modules.returnModule('Stunx');
        const localStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
        stunx_mod.setLocalStream(localStream);
        // stunx_mod.setChatType("game");
        peers.forEach(peer => {
            this.app.connection.emit('show-video-chat-request', this.app, this, "small", "audio");
            this.app.connection.emit('render-local-stream-request', localStream, "small", "audio");
            this.app.connection.emit('render-remote-stream-placeholder-request', peer, "small", "audio");
        })

        stunx_mod.createMediaConnectionWithPeers(peers, 'small', 'audio');

    }

// offer: {
//     ice_candidates
//     offer_sdp
//     recipient
//     ui_type
//     call_type
// }
  
    async receiveVideoCall(app, offer_creator, offer) {
        console.log('receiving media call : type ', offer.call_type);
        const show_video = offer.call_type === "video" ? true : false
        const promise = sconfirm(`Accept Incoming ${offer.call_type} call`);
        promise.then(async () => {
            const localStream = await navigator.mediaDevices.getUserMedia({ video: show_video, audio: true });
            const stunx_mod = this.app.modules.returnModule('Stunx');
            stunx_mod.setLocalStream(localStream);
            // stunx_mod.setChatType("game");
            this.app.connection.emit('show-video-chat-request', this.app, this, offer.ui_type, offer.call_type);
            this.app.connection.emit('render-local-stream-request', localStream, offer.ui_type);
            stunx_mod.acceptMediaConnectionOffer(app, offer_creator, offer, offer.ui_type, offer.call_type);
        }).catch(error => {
            salert("Video call rejected");
        })

    }
}


module.exports = StunxGameMenu;


