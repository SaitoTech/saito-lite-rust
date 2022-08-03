
const VideoBox = require('./video-box');
const videoChatManagerTemplate = require('./video-chat-manager.template');
class VideoChatManager {

    // peers = {};
    localStream;
    my_pc = [];
    video_boxes = {}



    constructor(app, mod) {
        this.app = app;
        this.mod = mod;
        this.app.connection.on('show-video-chat-request', (app, mod) => {
            this.show(app, mod);
        })
        this.app.connection.on('add-local-stream-request', (localStream) => {
            this.addLocalStream(localStream)
        })
        this.app.connection.on('add-remote-stream-request', (remoteStream, publicKey, pc, type) => {
            console.log(type);
            if (type === "fromCreator") {
                console.log('from offer creator')
                this.addRemoteStreamFromOfferCreator(remoteStream, publicKey, pc);
            }
            if (type === "fromRecipient") {
                console.log('adding offer recipient')
                this.addRemoteStreamFromOfferRecipient(remoteStream, publicKey, pc);
            }
        })
    }
    videoEnabled = true;
    audioEnabled = true;


    render() {
        this.app.browser.addElementToDom(videoChatManagerTemplate(), document.getElementById('content__'));
    }

    attachEvents(app, mod) {
        app.browser.makeDraggable("stunx-chatbox");

        document.querySelector('.disconnect_btn').addEventListener('click', (e) => {
            let stunx_mod = app.modules.returnModule("Stunx");
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

    addLocalStream(localStream) {
        const videoBox = new VideoBox(this.app, this.mod);
        videoBox.render(localStream, 'local', 'wrapper');
        this.video_boxes['local'] = { video_box: videoBox, peer_connection: null }
        this.localStream = localStream;
    }

    addRemoteStreamFromOfferCreator(remoteStream, offer_creator, pc) {
        const videoBox = new VideoBox(this.app, this.mod);
        videoBox.render(remoteStream, offer_creator, 'wrapper');
        this.video_boxes[offer_creator] = { video_box: videoBox, peer_connection: pc }
    }


    addRemoteStreamFromOfferRecipient(remoteStream, answer_creator, pc) {
        const videoBox = new VideoBox(this.app, this.mod);
        videoBox.render(remoteStream, answer_creator, 'wrapper');
        this.video_boxes[answer_creator] = { video_box: videoBox, peer_connection: pc }
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
