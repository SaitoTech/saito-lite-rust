
const VideoBox = require('./video-box');
const ChatManagerLargeTemplate = require('./chat-manager-large.template');
class VideoChatManager {

    // peers = {};
    localStream;
    roomCode;
    // my_pc = [];
    video_boxes = {}
    videoEnabled = true;
    audioEnabled = true;


    constructor(app, mod) {
        this.app = app;
        this.mod = mod;


        this.app.connection.on('show-video-chat-request', (app, mod, ui_type, call_type, room_code) => {
            if (ui_type !== "large") return
            this.call_type = call_type
            this.room_code = room_code
            this.ui_type = ui_type;
            this.show(app, mod);
        })
        this.app.connection.on('render-local-stream-request', (localStream, ui_type) => {
            if (ui_type !== "large") return
            this.renderLocalStream(localStream)
        })
        this.app.connection.on('add-remote-stream-request', (peer, remoteStream, pc, ui_type) => {
            if (ui_type !== "large") return
            this.addRemoteStream(peer, remoteStream, pc)
        });
        this.app.connection.on('render-remote-stream-placeholder-request', (peer, ui_type) => {
            if (ui_type !== "large") return
            this.renderRemoteStreamPlaceholder(peer);
        });

        this.app.connection.on('change-connection-state-request', (peer, state, ui_type) => {
            if (ui_type !== "large") return
            this.updateConnectionState(peer, state)
        })
    }


    render() {
        this.app.browser.addElementToDom(ChatManagerLargeTemplate(this.call_type), document.getElementById('content__'));
    }

    attachEvents(app, mod) {
        app.browser.makeDraggable("stunx-chatbox", null, true);

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
        let stun_mod = this.app.modules.returnModule("Stun");
        console.log("peer connections ", stun_mod.peer_connections);
        stun_mod.closeMediaConnections();

        // remove pair from room
        let sql = `SELECT * FROM rooms WHERE room_code = "${this.room_code}"`;
        let requestCallback = async (res) => {
            let room = res.rows[0];
            console.log(res, 'res')
            let peers_in_room = JSON.parse(room.peers);
            let my_public_key = this.app.wallet.returnPublicKey()
            peers_in_room = peers_in_room.filter(public_key => public_key !== my_public_key)

            const data = {
                peers_in_room: JSON.stringify(peers_in_room),
                peer_count: peers_in_room.length,
                is_max_capacity: false
            }
            stun_mod.sendUpdateRoomTransaction(this.room_code, data);
        }

        stun_mod.sendPeerDatabaseRequestWithFilter('Stun', sql, requestCallback)


        this.localStream.getTracks().forEach(track => {
            track.stop();
            console.log(track);
            console.log('stopping track');
        })
        this.video_boxes = {}
        this.hide();
    }


    addRemoteStream(peer, remoteStream, pc) {
        this.video_boxes[peer].video_box.addStream(remoteStream);
        this.video_boxes[peer].peer_connection = pc;
    }

    renderLocalStream(localStream) {
        const videoBox = new VideoBox(this.app, this.mod, this.ui_type, this.call_type);
        videoBox.render(localStream, 'local', 'large-wrapper');
        this.video_boxes['local'] = { video_box: videoBox, peer_connection: null }
        this.localStream = localStream;
        this.addImages();
    }



    renderRemoteStreamPlaceholder(peer) {
        if (!this.video_boxes[peer]) {
            const videoBox = new VideoBox(this.app, this.mod, this.ui_type, this.call_type);
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


    startTimer() {
        if (this.timer_interval) {
            return;
        }
        let timerElement = document.querySelector(".stunx-chatbox .counter");
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
        console.log('video boxes ', this.video_boxes)
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
        document.querySelector('.stunx-chatbox .image-list').innerHTML = images;
        document.querySelector('.stunx-chatbox .users-on-call-count').innerHTML = count
    }





}


module.exports = VideoChatManager;
