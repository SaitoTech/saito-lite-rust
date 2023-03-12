
const VideoBox = require('./video-box');
const ChatManagerLargeTemplate = require('./chat-manager-large.template');
const ChatInvitationOverlay = require('../overlays/chat-invitation-link');
const Effects = require('../overlays/effects');



class VideoChatManager {

    peers = [];
    localStream;
    room_code;
    // my_pc = [];
    video_boxes = {}
    videoEnabled = true;
    audioEnabled = true;
    isActive = false;
    central;


    constructor(app, mod) {
        this.app = app;
        this.mod = mod;
        this.effectsMenu = new Effects(app, mod)

        this.app.connection.on('show-video-chat-request', (app, mod, ui_type, call_type = "Video", room_code, central) => {
            if (ui_type !== "large") return
            this.call_type = "video"
            this.room_code = room_code
            this.ui_type = "large";
            this.central = central
            this.show(app, mod);
        })
        this.app.connection.on('render-local-stream-request', (localStream, ui_type) => {
            if (!this.isActive) return;
            if (ui_type !== "large") return
            this.renderLocalStream(localStream);
            // this.updateRoomLink()
        })
        this.app.connection.on('add-remote-stream-request', (peer, remoteStream, pc, ui_type) => {
            if (!this.isActive) return;
            if (ui_type !== "large") return
            this.addRemoteStream(peer, remoteStream, pc)
            // this.updateRoomLink()
        });
        this.app.connection.on('render-remote-stream-placeholder-request', (peer, ui_type) => {
            if (!this.isActive) return;
            if (ui_type !== "large") return
            this.renderRemoteStreamPlaceholder(peer);
            // this.updateRoomLink()
        });

        this.app.connection.on('change-connection-state-request', (peer, state, ui_type, call_type, room_code) => {
            if (!this.isActive) return;
            if (ui_type !== "large" || this.room_code !== room_code) return
            this.updateConnectionState(peer, state)
            // this.updateRoomLink()
        })



        this.app.connection.on('stun-receive-media-offer', ({ room_code, offer_creator, offer_recipient }) => {
            if (!this.isActive) return;
            console.log(room_code, offer_creator, offer_recipient, 'stun-receive-media-offer')
            if (room_code !== this.room_code) {
                return;
            }

            let my_public_key = this.app.wallet.returnPublicKey()
            if (my_public_key === offer_creator) {
                this.renderRemoteStreamPlaceholder(offer_recipient, "attempting to connect", true);
            } else {
                this.renderRemoteStreamPlaceholder(offer_creator, "attempting to connect");
            }

        })

        this.app.connection.on('stun-disconnect', () => {
            this.disconnect()
        })
    }


    render() {
        this.app.browser.addElementToDom(ChatManagerLargeTemplate(this.call_type, this.room_code), document.getElementById('content__'));
        this.isActive = true;
    }

    attachEvents(app, mod) {

        document.querySelector('.disconnect_btn').addEventListener('click', (e) => {
            this.disconnect()

            siteMessage("You have been disconnected", 5000);
        })

        let add_users = document.querySelector('.add_users')
        if (add_users) {
            add_users.addEventListener('click', (e) => {
                this.updateRoomLink();
                this.chatInvitationOverlay.render()

            })


        }
        document.querySelector('.audio_control').addEventListener('click', (e) => {
            this.toggleAudio();
        })
        document.querySelector('.video_control').addEventListener('click', (e) => {
            this.toggleVideo();
        })

        if (document.querySelector('.effects-control')) {
            document.querySelector('.effects-control').addEventListener('click', (e) => {
                this.effectsMenu.render();
            })
        }


        document.querySelector('.stunx-chatbox .minimizer').addEventListener('click', (e) => {
            let chat_box = document.querySelector(".stunx-chatbox")
            chat_box.classList.add('minimize');
        })

        document.querySelector('.large-wrapper').addEventListener('click', (e) => {
            let chat_box = document.querySelector('.stunx-chatbox')
            console.log('clicking stunx', e.target.classList, e.target)
            if (chat_box.classList.contains('minimize')) {
                chat_box.classList.remove('minimize')
            }


        })
    }

    createRoomLink() {
        let public_keys = [];
        let pub_key

        if (this.peers.length === 0) {
            pub_key = this.app.wallet.returnPublicKey();
        } else if (this.peers.length > 0) {
            pub_key = this.peers[0];
        }

        public_keys.push(pub_key);
        let obj = {
            room_id: this.room_code,
            public_keys,
        }
        let base64obj = this.app.crypto.stringToBase64(JSON.stringify(obj));
        let url = window.location.toString();

        if (url.includes('?')) {
            let index = url.indexOf('?');
            url = url.slice(0, index);
        }

        let myurl = new URL(url);
        myurl = myurl.href.split('#')[0];
        myurl = myurl.replace('redsquare', 'videocall');
        return `${myurl}?stun_video_chat=${base64obj}`;

    }

    updateRoomLink() {
        const room_link = this.createRoomLink();
        this.room_link = room_link
        this.chatInvitationOverlay = new ChatInvitationOverlay(this.app, this.mod, this.room_link)
        if (document.querySelector('.add-users-code-container span')) {
            document.querySelector('.add-users-code-container span').textContent = this.room_link.slice(0, 30);
        }
        // return public_keys;
    }

    removePeer(peer) {
        this.peers = this.peers.filter(p => peer === p)
    }
    show(app, mod) {
        if (!document.querySelector('.stunx-chatbox')) {
            this.render();
            this.attachEvents(app, mod);
        }

        if (this.mod.central === true) {
            let room_link = this.createRoomLink();
            history.pushState(null, null, room_link);
        }

        this.isActive = true
    }

    hide() {
        console.log('hiding')
        document.querySelector('#stunx-chatbox').parentElement.removeChild(document.querySelector('#stunx-chatbox'));
        let stun_mod = this.app.modules.returnModule("Stun");
        this.isActive = false;
        stun_mod.renderInto(this.mod.renderedInto);

    }

    disconnect() {
        let stun_mod = this.app.modules.returnModule("Stun");
        console.log("peer connections ", stun_mod.peer_connections);
        let kind = this.mod.central ? 'all' : 'one'
        try {
            for (let i in this.mod.peer_connections) {
                this.mod.peer_connections[i].dc.send(JSON.stringify({ event: 'disconnect', kind }))
            }
        } catch (error) {

        }
        stun_mod.closeMediaConnections();

        this.localStream.getTracks().forEach(track => {
            track.stop();
            console.log(track);
            console.log('stopping track');
        })
        for (let i in this.video_boxes) {
            this.video_boxes[i].video_box.stopWaitTimer();
        }
        this.video_boxes = {}
        this.hide();
        this.isActive = false;
        this.peers = [];
        this.room_code = null;
    }


    addRemoteStream(peer, remoteStream, pc) {
        this.video_boxes[peer].video_box.render(remoteStream)
        this.video_boxes[peer].peer_connection = pc;
        if (!this.peers.includes(peer)) {
            this.peers.push(peer);
        }

        // console.log(this.mod.central, "is mod central or not")
        let room_link = this.createRoomLink();
        history.pushState(null, null, room_link);

    }

    renderLocalStream(localStream) {
        this.createVideoBox('local')
        this.video_boxes['local'].video_box.render(localStream, 'large-wrapper');
        this.localStream = localStream;
        this.updateImages();
        // segmentBackground(document.querySelector('#streamlocal video'), document.querySelector('#streamlocal canvas'), 1);  
        // applyBlur(7); 
    }



    renderRemoteStreamPlaceholder(peer, placeholder_info, isCreator = false) {
        this.createVideoBox(peer, placeholder_info);
        this.video_boxes[peer].video_box.render(null, placeholder_info);
        this.video_boxes[peer].video_box.startWaitTimer(isCreator);
    }

    createVideoBox(peer) {
        if (!this.video_boxes[peer]) {
            const videoBox = new VideoBox(this.app, this.mod, this.ui_type, this.call_type, this.central, this.room_code, peer, 'large-wrapper');
            this.video_boxes[peer] = { video_box: videoBox, peer_connection: null }
        }
    }


    updateConnectionState(peer, state) {
        this.createVideoBox(peer)
        this.video_boxes[peer].video_box.handleConnectionStateChange(peer, state);
        switch (state) {
            case "connecting":
                break;
            case "disconnected":
                this.stopTimer();
                this.updateImages();
                this.mod.closeMediaConnections(peer);
                this.removePeer(peer);
                console.log("video boxes: after ", this.video_boxes);
                break;
            case "connected":
                this.startTimer();
                this.updateImages();
                break;

            case "failed":
                this.stopTimer();
                this.updateImages();
                this.mod.closeMediaConnections(peer);
                this.removePeer(peer);
                console.log("video boxes: after ", this.video_boxes);

                break;

            default:
                break;
        }
    }




    toggleAudio() {
        console.log('toggling audio');
        if (this.audioEnabled === true) {
            this.localStream.getAudioTracks()[0].enabled = false;
            for (let i in this.mod.peer_connections) {
                this.mod.peer_connections[i].dc.send(JSON.stringify({ event: "mute", kind: 'audio' }))
            }
            this.audioEnabled = false
            document.querySelector('.audio_control').classList.remove('fa-microphone')
            document.querySelector('.audio_control').classList.add('fa-microphone-slash')
        } else {
            this.localStream.getAudioTracks()[0].enabled = true;
            for (let i in this.mod.peer_connections) {
                this.mod.peer_connections[i].dc.send(JSON.stringify({ event: "unmute", kind: 'audio' }))
            }
            this.audioEnabled = true;
            document.querySelector('.audio_control').classList.remove('fa-microphone-slash')
            document.querySelector('.audio_control').classList.add('fa-microphone')
        }

    }

    toggleVideo() {
        console.log('toggling video');
        if (this.videoEnabled === true) {
            console.log(this.localStream.getVideoTracks()[0], 'video track');
            this.localStream.getVideoTracks()[0].enabled = false;
            this.app.connection.emit("mute", 'video', 'local');
            try {
                for (let i in this.mod.peer_connections) {
                    this.mod.peer_connections[i].dc.send(JSON.stringify({ event: "mute", kind: 'video' }))
                }
            } catch (error) {

            }




            this.videoEnabled = false
            document.querySelector('.video_control').classList.remove('fa-video')
            document.querySelector('.video_control').classList.add('fa-video-slash')
        } else {

            this.localStream.getVideoTracks()[0].enabled = true;
            this.app.connection.emit("unmute", 'video', 'local');
            try {
                for (let i in this.mod.peer_connections) {
                    this.mod.peer_connections[i].dc.send(JSON.stringify({ event: "unmute", kind: 'video' }))
                }
            } catch (error) {

            }

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

            timerElement.innerHTML = `<span style="" >${hours}:${minutes}:${secs} </span>`;

        };

        this.timer_interval = setInterval(timer, 1000);
    }

    stopTimer() {
        clearInterval(this.timer_interval)
        this.timer_interval = null
    }



    updateImages() {
        let images = ``;
        let count = 0
        console.log('video boxes ', this.video_boxes)
        for (let i in this.video_boxes) {
            if (i === "local") {
                let publickey = this.app.wallet.returnPublicKey()
                let imgsrc = this.app.keychain.returnIdenticon(publickey);
                images += `<img data-id="${publickey}" src="${imgsrc}"/>`
            } else {
                let imgsrc = this.app.keychain.returnIdenticon(i);
                images += `<img data-id ="${i}" class="saito-identicon" src="${imgsrc}"/>`
            }
            count++;

        }
        document.querySelector('.stunx-chatbox .image-list').innerHTML = images;
        document.querySelector('.stunx-chatbox .users-on-call-count').innerHTML = count
    }





}


module.exports = VideoChatManager;
