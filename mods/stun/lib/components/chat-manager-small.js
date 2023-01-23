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
        this.app.connection.on('show-video-chat-request', (app, mod, ui_type, call_type) => {
            if (ui_type !== "small") return
            console.log('showing')
            this.ui_type = ui_type
            this.call_type = call_type
            this.show(app, mod);
        })
        this.app.connection.on('render-local-stream-request', (localStream, ui_type) => {
            if (ui_type !== "small") return
            console.log('rendering local strem')
            this.renderLocalStream(localStream)
        })
        this.app.connection.on('add-remote-stream-request', (peer, remoteStream, pc, ui_type) => {
            if (ui_type !== "small") return
            this.addRemoteStream(peer, remoteStream, pc)
        });
        this.app.connection.on('render-remote-stream-placeholder-request', (peer, ui_type, call_type) => {
            console.log('ui_type ', ui_type);
            if (ui_type !== "small") return
            this.renderRemoteStreamPlaceholder(peer, ui_type, call_type);
        });

        this.app.connection.on('change-connection-state-request', (peer, state, ui_type, call_type) => {
            if (ui_type !== "small") return
            this.updateConnectionState(peer, state, call_type)
        })
    }

    render() {
        // this.app.browser.addElementToDom(ChatManagerSmallTemplate(), document.getElementById('content__'));
        if (document.querySelector("#game-video-chat ul")) {
            this.app.browser.addElementToSelector(ChatManagerSmallTemplate(this.call_type), "#game-video-chat ul");
        } else {
            this.app.browser.addElementToSelector(ChatManagerSmallTemplateGeneric(this.call_type), "");
            // this.p

        }

    }

    attachEvents(app, mod) {
        app.browser.makeDraggable("small-video-chatbox", null, true);

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
        let stun_mod = this.app.modules.returnModule("Stun");
        console.log("peer connections ", stun_mod.peer_connections);
        stun_mod.closeMediaConnections()
        this.localStream.getTracks().forEach(track => {
            track.stop();
            console.log(track);
            console.log('stopping track');
        })

        if (this.timer_interval) {
            clearInterval(this.timer_interval)
        }

        this.video_boxes = {};

        this.hide();
    }

    addRemoteStream(peer, remoteStream, pc) {
        this.video_boxes[peer].video_box.addStream(remoteStream);
        this.video_boxes[peer].peer_connection = pc;

    }

    renderLocalStream(localStream) {
        const videoBox = new VideoBox(this.app, this.mod, this.ui_type, this.call_type);
        // videoBox.render(localStream, 'local', 'small-wrapper');
        this.video_boxes['local'] = { video_box: videoBox, peer_connection: null }
        this.localStream = localStream;
        this.addImages()
    }



    renderRemoteStreamPlaceholder(peer, ui_type, call_type) {

        // if (!this.video_boxes[peer]) {
        const videoBox = new VideoBox(this.app, this.mod, this.ui_type, this.call_type);
        this.video_boxes[peer] = { video_box: videoBox, peer_connection: null }
        // }
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
                    this.disconnect();
                    console.log("video boxes: after ", this.video_boxes);
                    break;
                case "connected":
                    // start counter
                    this.startTimer();
                    this.addImages();
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
        if (this.call_type === "video") {
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


    startTimer() {
        if (this.timer_interval) {
            return;
        }
        let timerElement = document.querySelector(".small-video-chatbox .counter");
        let seconds = 0;

        const timer = () => {
            seconds++;

            // Get hours
            let hours = Math.floor(seconds / 3600);
            // Get minutes
            let minutes = Math.floor((seconds - hours * 3600) / 60);
            // Get seconds
            let secs = Math.floor(seconds % 60);

            if (hours < 10) {
                hours = `0${hours}`;
            }
            if (minutes < 10) {
                minutes = `0${minutes}`;
            }
            if (secs < 10) {
                secs = `0${secs}`;
            }

            timerElement.innerHTML = `<sapn style="color:orangered; font-size: 3rem;" >${hours}:${minutes}:${secs} </sapn>`;

        };

        this.timer_interval = setInterval(timer, 1000);
    }


    addImages() {
        let images = ``;
        let count = 0
        console.log('video boxe3s ', this.video_boxes)
        for (let i in this.video_boxes) {
            if (i === "local") {
                let publickey = this.app.wallet.returnPublicKey()
                let imgsrc = this.app.keys.returnIdenticon(publickey);
                images += `<img data-id="${publickey}" src="${imgsrc}"/>`
            } else {
                let imgsrc = this.app.keys.returnIdenticon(i);
                images += `<img data-id ="${i}" class="saito-identicon" src="${imgsrc}"/>`
            }
            count++;

        }
        document.querySelector('.small-video-chatbox .image-list').innerHTML = images;
        document.querySelector('.users-on-call-count').innerHTML = count
    }





}


module.exports = ChatManagerSmall;
