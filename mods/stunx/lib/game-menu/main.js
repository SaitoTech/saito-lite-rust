

class StunxGameMenu {
    constructor(app, mod) {
        this.app = app;
        this.mod = mod;

        this.app.connection.on('game-receive-video-call', (app, offer_creator, offer) => {
            this.receiveVideoCall(app, offer_creator, offer);
        })
        this.app.connection.on('game-start-video-call', (peer) => {
            this.startVideoCall(peer);
        })
    }


    async startVideoCall(peer) {
        const stunx_mod = this.app.modules.returnModule('Stunx');
        const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        stunx_mod.setLocalStream(localStream);
        stunx_mod.setChatType("game");
        this.app.connection.emit('game-show-video-chat-request', this.app, this);
        this.app.connection.emit('game-render-local-stream-request', localStream);
        this.app.connection.emit('game-render-remote-stream-placeholder-request', peer);
        stunx_mod.createStunConnectionWithPeers([peer], 'game');

    }

    async receiveVideoCall(app, offer_creator, offer) {
        console.log('receiving video call');
        const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        const stunx_mod = this.app.modules.returnModule('Stunx');
        stunx_mod.setLocalStream(localStream);
        stunx_mod.setChatType("game");
        this.app.connection.emit('game-show-video-chat-request', this.app, this);
        this.app.connection.emit('game-render-local-stream-request', localStream);
        stunx_mod.acceptPeerConnectionOffer(app, offer_creator, offer, 'game');
    }
}


module.exports = StunxGameMenu;


