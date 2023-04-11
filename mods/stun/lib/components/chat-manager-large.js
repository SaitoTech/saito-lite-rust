
const VideoBox = require('./video-box');
const ChatManagerLargeTemplate = require('./chat-manager-large.template');
const ChaatManagerSmallExtensionTemplate = require('./chat-manager-small-extension.template');
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
    mode = "" // full, addon


    constructor(app, mod) {
        this.app = app;
        this.mod = mod;
        this.config;
 

        this.effectsMenu = new Effects(app, mod)

        this.app.connection.on('show-video-chat-large-request', (app, mod, call_type = "Video", room_code, videoEnabled, audioEnabled, config = null) => {
            this.videoEnabled = videoEnabled
            this.audioEnabled = audioEnabled;
            this.call_type = "video"
            this.room_code = room_code
            this.config = config
            if(this.config === null){
                this.mode = "full"
            }
            this.show(app, mod);
            this.updateRoomLink();

            // create chat group
            this.createRoomTextChat();
        })


        this.app.connection.on('render-local-stream-large-request', (localStream) => {
            this.renderLocalStream(localStream);
        })
        this.app.connection.on('add-remote-stream-large-request', (peer, remoteStream, pc) => {
            this.addRemoteStream(peer, remoteStream, pc);
        });

        this.app.connection.on('stun-update-connection-message', (room_code, peer_id, status) => {
            if (room_code !== this.room_code) {
                return;
            }
            let my_pub_key = this.app.wallet.returnPublicKey();
            let container;
            if (peer_id === my_pub_key) {
                container = "expanded-video"
            }

            this.createVideoBox(peer_id, container)
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

        this.app.connection.on('video-box-remove', (peer_id, disconnection) => {
            if (this.video_boxes[peer_id].video_box) {
                if (this.video_boxes[peer_id].video_box.remove) {
                    this.video_boxes[peer_id].video_box.remove(disconnection)
                    delete this.video_boxes[peer_id];
                    this.updateImages();
                }
            }
        })




    }


    render() {
        this.app.browser.addElementToDom(ChatManagerLargeTemplate(this.call_type, this.room_code, this.mode), document.getElementById('content__'));
        this.isActive = true;
    
        if (this.config) {
            this.app.browser.addElementToSelector((ChaatManagerSmallExtensionTemplate()), this.config.container);
        }




    }

    createRoomTextChat() {
        let chat_mod = this.app.modules.returnModule('Chat');
        console.log(chat_mod, 'chat-mod', this.app);
        let chat_manager = chat_mod.respondTo('chat-manager');
        let my_pub_key = this.app.wallet.returnPublicKey();

        chat_mod.groups.push({
            id: this.room_code,
            members: [this.app.network.peers[0].peer.publickey],
            name: `Chat ${this.room_code}`,
            txs: [],
            unread: 0
        })
        let chat_group = chat_mod.returnGroup(this.room_code);

        this.chat_group = chat_group;


    }


    attachEvents(app, mod) {


        if (this.mode === "full") {

            let add_users = document.querySelector('.add_users_container')
            if (add_users) {
                add_users.addEventListener('click', (e) => {
                    this.updateRoomLink();
                    this.chatInvitationOverlay.render()

                })

            }

            document.querySelector('.chat_control').addEventListener('click', (e) => {
                let chat_mod = this.app.modules.returnModule('Chat');

                if (chat_mod.chat_manager.popups[this.room_code]) {
                    console.log(chat_mod.chat_manager.popups[this.room_code])
                    chat_mod.chat_manager.popups[this.room_code].manually_closed = false;
                }

                this.app.connection.emit('chat-popup-render-request', this.chat_group);
                // document.querySelector(`.chat-popup-${this.room_code}`).style.zIndex = 2000;
            })

        }


        if (document.querySelector('.effects-control')) {
            document.querySelector('.effects-control').addEventListener('click', (e) => {
                this.effectsMenu.render();
            })
        }


        document.querySelectorAll('.disconnect-control').forEach(item => {
            item.addEventListener('click', (e) => {
                this.disconnect()
                siteMessage("You have been disconnected", 5000);
            })
        })




        document.querySelectorAll('.audio-control').forEach(item => {
            item.onclick = () => {
                this.toggleAudio()
            }
        })
        document.querySelectorAll('.video-control').forEach(item => {
            item.onclick = () => {
                this.toggleVideo()
            }
        })


        document.querySelector('.stunx-chatbox .minimizer').addEventListener('click', (e) => {
            // fas fa-expand"
            let icon = document.querySelector('.stunx-chatbox .minimizer i')
            if (icon.classList.contains('fa-caret-down')) {
                let chat_box = document.querySelector(".stunx-chatbox")
                chat_box.classList.add('minimize');
                icon.classList.remove('fa-caret-down');
                icon.classList.add('fa-expand');
            } else {
                let chat_box = document.querySelector(".stunx-chatbox")
                chat_box.classList.remove('minimize');
                icon.classList.remove('fa-expand')
                icon.classList.add('fa-caret-down')

            }
        })



        if (this.videoEnabled === true) {
            document.querySelectorAll('.video-control i').forEach(item => {
                item.classList.remove('fa-video-slash')
                item.classList.add('fa-video');

            })
        } else {

            document.querySelectorAll('.video-control i').forEach(item => {
                item.classList.remove('fa-video');
                item.classList.add('fa-video-slash')

            })
        }
        if (this.audioEnabled === true) {
            document.querySelectorAll('.audio-control i').forEach(item => {
                item.classList.remove('fa-microphone-slash')
               item.classList.add('fa-microphone');
            })


        } else {
            document.querySelectorAll('.audio-control i').forEach(item => {
                item.classList.add('fa-microphone-slash')
               item.classList.classList.remove('fa-microphone');
            })

        }



        document.querySelector('.large-wrapper').addEventListener('click', (e) => {
            if (e.target.classList.contains('video-box')) {
                let stream_id = e.target.id;
                console.log(e.target, stream_id,)
                console.log('praent element ', e.target.parentElement.parentElement)
                if (e.target.parentElement.parentElement.classList.contains('expanded-video')) {
                    console.log('already expanded');
                    return;
                } else {
                    let id = document.querySelector('.expanded-video').querySelector('.video-box').id;
                    console.log('current expanded id ', id);
                    this.video_boxes[id].video_box.containerClass = "side-videos";
                    this.video_boxes[id].video_box.rerender()
                    this.video_boxes[stream_id].video_box.containerClass = "expanded-video"
                    this.video_boxes[stream_id].video_box.rerender()
                }
            }
        }
        )

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

        let room_link = this.createRoomLink();
        history.pushState(null, null, room_link);
        this.isActive = true

        this.app.browser.makeDraggable("stunx-chatbox");
        this.app.browser.makeDraggable("stunx-chatbox");

    }

    hide() {
        console.log('hiding')
        document.querySelector('#stunx-chatbox').parentElement.removeChild(document.querySelector('#stunx-chatbox'));
        let stun_mod = this.app.modules.returnModule("Stun");
        this.isActive = false;
        stun_mod.renderInto(this.mod.renderedInto);

        if (this.config) {
            this.config.onHide();
        }


    }

    disconnect() {
        this.app.connection.emit('stun-disconnect')
        this.video_boxes = {}
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
        window.location.href = myurl

    }


    addRemoteStream(peer, remoteStream, pc) {
        console.log('rendering remote steam ', remoteStream)
        this.createVideoBox(peer);
        this.video_boxes[peer].video_box.render(remoteStream);
        if (!this.peers.includes(peer)) {
            this.peers.push(peer);
        }

        let room_link = this.createRoomLink();
        history.pushState(null, null, room_link);

        if (this.peers.length === 1) {
            let peer = document.querySelector(`#stream${this.peers[0]}`);
            peer.querySelector('.video-box').click();
        }

    }

    renderLocalStream(localStream) {
        this.createVideoBox('local', "expanded-video");
        this.video_boxes['local'].video_box.render(localStream, 'large-wrapper');
        this.localStream = localStream;
        this.updateImages();
        // segmentBackground(document.querySelector('#streamlocal video'), document.querySelector('#streamlocal canvas'), 1);  
        // applyBlur(7); 
    }



    renderRemoteStreamPlaceholder(peer, placeholder_info, is_creator) {
        this.createVideoBox(peer);
        this.video_boxes[peer].video_box.render(null, placeholder_info);
        console.log('is creator ', is_creator)
    }

    createVideoBox(peer, container = "side-videos") {
        if (!this.video_boxes[peer]) {
            const videoBox = new VideoBox(this.app, this.mod, this.call_type, this.central, this.room_code, peer, container);
            this.video_boxes[peer] = { video_box: videoBox }
        }
    }






    toggleAudio() {
        console.log('toggling audio');
        this.app.connection.emit('stun-toggle-audio')

    }

    toggleVideo() {
        console.log('toggling audio');
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
