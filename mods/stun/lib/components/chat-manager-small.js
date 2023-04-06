const VideoBox = require('./video-box');
const ChatManagerSmallTemplate = require('./chat-manager-small.template');
const ChatManagerSmallExtensionTemplate = require('./chat-manager-small-extension.template');
const AudioBox = require('./audio-box');



class ChatManagerSmall {

    // peers = {};
    localStream;
    my_pc = [];
    video_boxes = {}
    audio_boxes = {}
    videoEnabled = true;
    audioEnabled = true;
    mod = "audio"


    constructor(app, mod) {
        this.app = app;
        this.mod = mod;
        this.app.connection.on('show-video-chat-small-request', (app, mod, call_type = "Video", room_code, videoEnabled, audioEnabled) => {
            this.videoEnabled = videoEnabled
            this.audioEnabled = audioEnabled;
            this.call_type = "vido"
            this.room_code = room_code
            this.show(app, mod);
            // this.updateRoomLink();
        })
        this.app.connection.on('render-local-stream-small-request', (localStream) => {
            console.log('rendering local stream');
            this.addLocalStream(localStream)
        })
        this.app.connection.on('add-remote-stream-small-request', (peer, remoteStream, pc) => {
            this.addRemoteStream(peer, remoteStream, pc);
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

        this.app.connection.on('audio-box-remove', (peer_id, disconnection) => {
            if (this.audio_boxes[peer_id].audio_box) {
                if (this.audio_boxes[peer_id].audio_box.remove) {
                    this.audio_boxes[peer_id].audio_box.remove()
                    delete this.audio_boxes[peer_id];
                    this.updateImages();
                }
            }
        })
    }

    render() {
        if (document.querySelector("#game-video-chat ul")) {
            this.app.browser.addElementToSelector(ChatManagerSmallTemplate(this.call_type), "#game-video-chat ul");
        }
        this.app.browser.addElementToDom(ChatManagerSmallExtensionTemplate());

    this.app.browser.makeDraggable("video-call-component");

    }

    attachEvents(app, mod) {
        const videoCallComponent = document.getElementById('video-call-component');
        const expandBtn = document.getElementById('expand-btn');
        expandBtn.addEventListener('click', () => {
            videoCallComponent.classList.toggle('expanded');
            if (videoCallComponent.classList.contains('expanded')) {
                // setAutoCollapse();
            }
        });

        // function setAutoCollapse() {
        //     setTimeout(() => {
        //         // videoCallComponent.classList.remove('expanded');
        //     }, 3000);
        // }
        document.querySelector('#disconnect-btn-extension').onclick = () => {
            this.disconnect();
        }
        document.querySelector('#disconnect-btn-menu').onclick = () => {
            this.disconnect();
        }

        document.querySelectorAll('.audio_control').forEach(item => {
            item.onclick = () => {
                this.toggleAudio()
            }
        })


    }

    show(app, mod) {
        if (!document.querySelector('.video-call-component')) {
            this.render();
            this.attachEvents(app, mod);
        }
    }


    hide() {
        console.log('hiding')
        document.querySelector('.video-call-component').parentElement.removeChild(document.querySelector('.video-call-component'));
        document.querySelectorAll('.video-chat-manager').forEach(item => {
            item.parentElement.removeChild(item);
        })


        document.querySelector('.join-group-video-chat').style.display = "block"

    }

    disconnect() {
        this.app.connection.emit('stun-disconnect')
        this.video_boxes = {}
        this.audio_boxes = {}
        this.hide();

    }


    addLocalStream(stream) {
        this.localStream = stream
    }

    addRemoteStream(peer, remoteStream, pc) {
        this.createAudioBox(peer, "video-call-component")
        this.audio_boxes[peer].audio_box.render(remoteStream)
        this.updateImages()

        let audio_box = document.querySelector(`#audiostream${peer}`)
        this.analyzeAudio(remoteStream, audio_box)
    }

    createAudioBox(peer, container) {
        if (!this.audio_boxes[peer]) {
            const audioBox = new AudioBox(this.app, this.mod, this.room_code, peer, container);
            this.audio_boxes[peer] = { audio_box: audioBox }
        }
    }

    updateImages() {
        let images = ``;
        let count = 0
        console.log(this.audio_boxes)
        for (let i in this.audio_boxes) {
            if (i === "local") {
                let publickey = this.app.wallet.returnPublicKey()
                let imgsrc = this.app.keychain.returnIdenticon(publickey);
                if (!document.querySelector(`#audiostream${publickey}`).querySelector(`#image${publickey}`)) {
                    document.querySelector(`#audiostream${publickey}`).insertAdjacentHTML('beforeend', `<img id ="image${publickey}" class="saito-identicon" src="${imgsrc}"/>`,)
                }
            } else {
                let imgsrc = this.app.keychain.returnIdenticon(i);
                if (!document.querySelector(`#audiostream${i}`).querySelector(`#image${i}`)) {
                    document.querySelector(`#audiostream${i}`).insertAdjacentHTML('beforeend', `<img id ="image${i}" class="saito-identicon" src="${imgsrc}"/>`,)
                }
            }
            count++;

        }
        // document.querySelector('.stunx-chatbox .image-list').innerHTML = images;
        // document.querySelector('.stunx-chatbox .users-on-call-count').innerHTML = count
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
            document.querySelectorAll('.audio_control').forEach(item => {
                item.classList.remove('fa-microphone');
                item.classList.add('fa-microphone-slash');
            })

        } else {
            this.localStream.getAudioTracks()[0].enabled = true;
            this.audioEnabled = true;

            document.querySelectorAll('.audio_control').forEach(item => {
                item.classList.remove('fa-microphone-slash');
                item.classList.add('fa-microphone');
            })

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
                let imgsrc = this.app.keychain.returnIdenticon(publickey);
                images += `<img data-id="${publickey}" src="${imgsrc}"/>`
            } else {
                let imgsrc = this.app.keychain.returnIdenticon(i);
                images += `<img data-id ="${i}" class="saito-identicon" src="${imgsrc}"/>`
            }
            count++;

        }
        document.querySelector('.small-video-chatbox .image-list').innerHTML = images;
        document.querySelector('.users-on-call-count').innerHTML = count
    }



    analyzeAudio(stream, audio) {
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        source.connect(analyser);
        analyser.fftSize = 512;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
      
        let speaking = false;
        const threshold = 20;
      
        function update() {
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / bufferLength;
      
          if (average > threshold && !speaking) {
            audio.classList.add('speaking');
            speaking = true;
          } else if (average <= threshold && speaking) {
            audio.classList.remove('speaking');
            speaking = false;
          }
      
          requestAnimationFrame(update);
        }
      
        update();
      }




}


module.exports = ChatManagerSmall;
