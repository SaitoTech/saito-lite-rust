
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

        this.app.connection.on('show-video-chat-request', (app, mod, call_type = "Video", room_code) => {

            this.call_type = "video"
            this.room_code = room_code
            this.show(app, mod);
            this.updateRoomLink()
        })


        this.app.connection.on('render-local-stream-request', (localStream) => {
            if (!this.isActive) return;
            this.renderLocalStream(localStream);
        })
        this.app.connection.on('add-remote-stream-request', (peer, remoteStream, pc) => {
            if (!this.isActive) return;
            this.addRemoteStream(peer, remoteStream, pc)
        });

        this.app.connection.on('stun-update-connection-message', (room_code, peer_id, status) => {


            if (room_code !== this.room_code) {
                return;
            }

            this.createVideoBox(peer_id)
            if (status === "connecting") {
                this.video_boxes[peer_id].video_box.renderPlaceholder('connecting')
            } else if (status === "connected") {
                this.video_boxes[peer_id].video_box.removeConnectionMessage();
                this.startTimer();
                this.updateImages();
            } else if (status === "disconnected") {
                this.video_boxes[peer_id].video_box.renderPlaceholder('retrying connection')
            }

        })

        this.app.connection.on('video-box-remove', (peer_id) => {
            if (this.video_boxes[peer_id].video_box) {
                this.video_boxes[peer_id].video_box.remove()
                delete this.video_boxes[peer_id];
                this.updateImages();
            }

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

        let obj = {
            room_code: this.room_code,
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
        this.peers = this.peers.filter(p => peer !== p)
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
        this.app.connection.emit('stun-disconnect')
        this.video_boxes = {}
        this.hide();
    }


    addRemoteStream(peer, remoteStream, pc) {
        this.createVideoBox(peer);
        this.video_boxes[peer].video_box.render(remoteStream);
        if (!this.peers.includes(peer)) {
            this.peers.push(peer);
        }
        console.log(this.peers, 'peers ')

        // console.log(this.mod.central, "is mod central or not")
        let room_link = this.createRoomLink();
        history.pushState(null, null, room_link);

    }

    renderLocalStream(localStream) {
        this.createVideoBox('local');
        this.video_boxes['local'].video_box.render(localStream, 'large-wrapper');
        this.localStream = localStream;
        this.updateImages();
        // segmentBackground(document.querySelector('#streamlocal video'), document.querySelector('#streamlocal canvas'), 1);  
        // applyBlur(7); 
    }



    renderRemoteStreamPlaceholder(peer, placeholder_info, is_creator) {
        this.createVideoBox(peer, placeholder_info);
        this.video_boxes[peer].video_box.render(null, placeholder_info);
        console.log('is creator ', is_creator)
    }

    createVideoBox(peer) {
        if (!this.video_boxes[peer]) {
            const videoBox = new VideoBox(this.app, this.mod, this.call_type, this.central, this.room_code, peer, 'large-wrapper');
            this.video_boxes[peer] = { video_box: videoBox }
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
        this.app.connection.emit('stun-toggle-video')
    }






    updateImages() {
        let images = ``;
        let count = 0
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



}


module.exports = VideoChatManager;
