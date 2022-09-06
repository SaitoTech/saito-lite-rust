
const VideoBox = require('./video-box');
const ChatManagerLargeTemplate = require('./chat-manager-large.template');
class VideoChatManager {

    // peers = {};
    localStream;
    my_pc = [];
    video_boxes = {}
    videoEnabled = true;
    audioEnabled = true;


    constructor(app, mod) {
        this.app = app;
        this.mod = mod;

        this.app.connection.on('show-video-chat-request', (app, mod, type) => {
            if (type !== "large") return
            this.show(app, mod);
        })
        this.app.connection.on('render-local-stream-request', (localStream, type) => {
            if (type !== "large") return
            this.renderLocalStream(localStream)
        })
        this.app.connection.on('add-remote-stream-request', (peer, remoteStream, pc, type) => {
            if (type !== "large") return
            this.addRemoteStream(peer, remoteStream, pc)
        });
        this.app.connection.on('render-remote-stream-placeholder-request', (peer, type) => {
            if (type !== "large") return
            this.renderRemoteStreamPlaceholder(peer);
        });

        this.app.connection.on('change-connection-state-request', (peer, state, type) => {
            if (type !== "large") return
            this.updateConnectionState(peer, state)
        })
    }


    render() {
        this.app.browser.addElementToDom(ChatManagerLargeTemplate(), document.getElementById('content__'));
    }

    attachEvents(app, mod) {
        app.browser.makeDraggable("stunx-chatbox");

        document.querySelector('.disconnect_btn').addEventListener('click', (e) => {

            this.disconnect()

            siteMessage("You have been disconnected", 5000);
        })
        document.querySelector('.audio_control').addEventListener('click', (e) => {
            this.toggleAudio();
        })
        document.querySelector('.video_control').addEventListener('click', (e) => {
            this.toggleVideo();
        })
    }

    show(app, mod) {
        if (!document.querySelector('.stunx-chatbox')) {
            this.render();
            this.attachEvents(app, mod);
        }
    }

    hide() {
        console.log('hiding')
        document.querySelector('#stunx-chatbox').parentElement.removeChild(document.querySelector('#stunx-chatbox'));

    }

    disconnect() {
        let stunx_mod = this.app.modules.returnModule("Videocall");
        console.log("peer connections ", stunx_mod.peer_connections);
        for (let i in stunx_mod.peer_connections) {
            if (stunx_mod.peer_connections[i]) {
                stunx_mod.peer_connections[i].close();
                console.log('closing peer connection');
            }
        }
        this.localStream.getTracks().forEach(track => {
            track.stop();
            console.log(track);
            console.log('stopping track');
        })
        this.hide();
    }


    addRemoteStream(peer, remoteStream, pc) {
        this.video_boxes[peer].video_box.addStream(remoteStream);
        this.video_boxes[peer].peer_connection = pc;
    }

    renderLocalStream(localStream) {
        const videoBox = new VideoBox(this.app, this.mod);
        videoBox.render(localStream, 'local', 'large-wrapper');
        this.video_boxes['local'] = { video_box: videoBox, peer_connection: null }
        this.localStream = localStream;
    }



    renderRemoteStreamPlaceholder(peer) {
        if (!this.video_boxes[peer]) {
            const videoBox = new VideoBox(this.app, this.mod);
            this.video_boxes[peer] = { video_box: videoBox, peer_connection: null }
        }
        this.video_boxes[peer].video_box.render(null, peer, 'large-wrapper');
    }


    updateConnectionState(peer, state) {
        console.log('connection state ', state);
        if (!this.video_boxes[peer].video_box) {
            return console.log("An error occured with updating connections state");
        }
        this.video_boxes[peer].video_box.handleConnectionStateChange(state);
    }




    toggleAudio() {
        console.log('toggling audio');
        if (this.audioEnabled === true) {
            this.localStream.getAudioTracks()[0].enabled = false;
            this.audioEnabled = false
            document.querySelector('.audio_control').classList.remove('fa-microphone')
            document.querySelector('.audio_control').classList.add('fa-microphone-slash')
        } else {

            this.localStream.getAudioTracks()[0].enabled = true;

            this.audioEnabled = true;
            document.querySelector('.audio_control').classList.remove('fa-microphone-slash')
            document.querySelector('.audio_control').classList.add('fa-microphone')
        }

    }

    toggleVideo() {
        console.log('toggling video');
        if (this.videoEnabled === true) {
            this.localStream.getVideoTracks()[0].enabled = false;
            this.videoEnabled = false
            document.querySelector('.video_control').classList.remove('fa-video')
            document.querySelector('.video_control').classList.add('fa-video-slash')
        } else {

            this.localStream.getVideoTracks()[0].enabled = true;


            this.videoEnabled = true;
            document.querySelector('.video_control').classList.remove('fa-video-slash')
            document.querySelector('.video_control').classList.add('fa-video')
        }

    }





}


module.exports = VideoChatManager;
