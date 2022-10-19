const VideoBox = require('./video-box');
const ChatManagerSmallTemplate = require('./chat-manager-small.template');
const ChatManagerSmallTemplateGeneric = require('./chat-manager-small-template-generic');



class ChatManagerSmall {

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
            if (type !== "small") return
            console.log('showing')
            this.show(app, mod);
        })
        this.app.connection.on('render-local-stream-request', (localStream, type) => {
            if (type !== "small") return
            console.log('rendering local strem')
            this.renderLocalStream(localStream)
        })
        this.app.connection.on('add-remote-stream-request', (peer, remoteStream, pc, type) => {
            if (type !== "small") return
            this.addRemoteStream(peer, remoteStream, pc)
        });
        this.app.connection.on('render-remote-stream-placeholder-request', (peer, type) => {
            console.log('type ', type);
            if (type !== "small") return
            this.renderRemoteStreamPlaceholder(peer);
        });

        this.app.connection.on('change-connection-state-request', (peer, state, type) => {
            if (type !== "small") return
            this.updateConnectionState(peer, state)
        })
    }

    render() {
        // this.app.browser.addElementToDom(ChatManagerSmallTemplate(), document.getElementById('content__'));
        if (document.querySelector("#game-video-chat ul")) {
            this.app.browser.addElementToSelector(ChatManagerSmallTemplate(), "#game-video-chat ul");
        } else {
            this.app.browser.addElementToSelector(ChatManagerSmallTemplateGeneric(), "");
        }

    }

    attachEvents(app, mod) {
        app.browser.makeDraggable("small-video-chatbox");

        document.querySelector('.disconnect_btn').onclick = (e) => {
            this.disconnect();
            // siteMessage("You have been disconnected", 5000);
        }

        document.querySelector('.audio_control').onclick = (e) => {
            this.toggleAudio();
        }
        document.querySelector('.video_control').onclick = (e) => {
            this.toggleVideo();
        }
    }

    show(app, mod) {
        if (!document.querySelector('.small-video-chatbox')) {
            this.render();
            this.attachEvents(app, mod);
        }
    }

    hide() {
        console.log('hiding')
        document.querySelectorAll('.video-chat-manager').forEach(item => {
            item.parentElement.removeChild(document.querySelector('.video-chat-manager'));
        })


        document.querySelectorAll('.video-box-container').forEach(box => {
            box.parentElement.removeChild(box)
        })

        document.querySelector("#small-video-chatbox").parentElement.removeChild(document.querySelector("#small-video-chatbox"))

    }

    disconnect() {
        let stunx_mod = this.app.modules.returnModule("Stunx");
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
        // videoBox.render(localStream, 'local', 'small-wrapper');
        this.video_boxes['local'] = { video_box: videoBox, peer_connection: null }
        this.localStream = localStream;
    }



    renderRemoteStreamPlaceholder(peer) {
        if (!this.video_boxes[peer]) {
            const videoBox = new VideoBox(this.app, this.mod);
            this.video_boxes[peer] = { video_box: videoBox, peer_connection: null }
        }
        this.video_boxes[peer].video_box.render(null, peer, null);
    }


    updateConnectionState(peer, state) {

        try {
            console.log(state, this.video_boxes[peer].video_box);
            if (!this.video_boxes[peer].video_box) {
                return;
            }
            this.video_boxes[peer].video_box.handleConnectionStateChange(state);

            switch (state) {
                case "disconnected":
                    // delete this.video_boxes[peer];
                    // if (Object.keys(this.video_boxes).length === 1) {
                    this.disconnect();
                    // siteMessage("Video call ended");
                    // }
                    console.log("video boxes: after ", this.video_boxes);
                    break;

                default:
                    break;
            }
        } catch (error) {
            console.log(error);
        }




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
            // this.localStream.getVideoTracks()[0].start();

            this.videoEnabled = true;
            document.querySelector('.video_control').classList.remove('fa-video-slash')
            document.querySelector('.video_control').classList.add('fa-video')
        }

    }





}


module.exports = ChatManagerSmall;
