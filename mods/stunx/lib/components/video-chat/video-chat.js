
const videoChatTemplate = require('./video-chat.template');
class VideoChat {

    // peers = {};
    localStreams = [];
    remoteStreams = [];
    my_pc = [];
    peer_connection = "";
    peer_connections = []



    constructor(app, mod) {
        this.app = app;
        this.app.connection.on('show-video-chat-request', (pc, app, mod) => {
            this.show(pc, app, mod);
        })

        this.app.connection.on('add-local-stream-request', (localStream) => {
            this.addLocalStream(localStream)
        })

        this.app.connection.on('add-remote-stream-request', (remoteStream, publicKey, pc, type) => {
            console.log('adding remote stream')
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
        this.app.browser.addElementToDom(videoChatTemplate(), document.getElementById('content__'));
    }

    attachEvents(app, mod) {
        app.browser.makeDraggable("stunx-chatbox");
        document.querySelector('.disconnect_btn').addEventListener('click', (e) => {
            this.my_pc.forEach(pc => pc.close());
            this.hide();
            this.localStreams.forEach(localStream => {
                localStream.getTracks().forEach(track => {
                    track.stop();
                    console.log(track);
                    console.log('stopping track');
                })
            })
            siteMessage("You have been disconnected", 5000);
        })
        document.querySelector('.audio_control').addEventListener('click', (e) => {
            this.toggleAudio();
        })
        document.querySelector('.video_control').addEventListener('click', (e) => {
            this.toggleVideo();
        })
    }

    show(pc, app, mod) {
        this.my_pc.push(pc)
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
        const localStreamDom = document.querySelector('#localStream');
        if (!localStreamDom) return console.log("An error occured rendering local stream");
        localStreamDom.srcObject = localStream;
        this.localStreams.push(localStream);
    }

    addRemoteStreamFromOfferCreator(remoteStream, offer_creator, pc) {
        // To Always insert remote stream in the same ordered manner
        let index = this.remoteStreams.findIndex(item => item?.publicKey === offer_creator);
        if (index === -1) {
            this.remoteStreams.push({ publicKey: offer_creator, pc });
        }
        console.log('remote streams', this.remoteStreams);
        const remoteStreamDom = document.querySelector(`#remoteStream${this.remoteStreams.length}`);
        if (!remoteStreamDom) return console.log("An error occured rendering remote stream");
        remoteStreamDom.style.display = "block";
        remoteStreamDom.style.backgroundColor = "transparent";
        remoteStreamDom.srcObject = remoteStream;
    }


    addRemoteStreamFromOfferRecipient(remoteStream, answer_creator, pc) {
        // To Always insert remote stream in the same ordered manner
        let index = this.remoteStreams.findIndex(item => item?.publicKey === answer_creator);
        if (index === -1) {
            index = this.remoteStreams.length - 1;
            this.remoteStreams.push({ publicKey: answer_creator, pc });
        }
        console.log('remote streams', this.remoteStreams);
        const remoteStreamDom = document.querySelector(`#remoteStream${this.remoteStreams.length}`);
        if (!remoteStreamDom) return console.log("An error occured rendering remote stream");
        remoteStreamDom.style.display = "block";
        remoteStreamDom.style.backgroundColor = "transparent";
        remoteStreamDom.srcObject = remoteStream;
    }



    toggleAudio() {
        console.log('toggling audio');
        if (this.audioEnabled === true) {
            this.localStreams.forEach(localStream => {
                localStream.getAudioTracks()[0].enabled = false;
            })
            this.audioEnabled = false
            document.querySelector('.audio_control').classList.remove('fa-microphone')
            document.querySelector('.audio_control').classList.add('fa-microphone-slash')
        } else {
            this.localStreams.forEach(localStream => {
                localStream.getAudioTracks()[0].enabled = true;
            })
            this.audioEnabled = true;
            document.querySelector('.audio_control').classList.remove('fa-microphone-slash')
            document.querySelector('.audio_control').classList.add('fa-microphone')
        }

    }

    toggleVideo() {
        console.log('toggling video');
        if (this.videoEnabled === true) {

            this.localStreams.forEach(localStream => {
                localStream.getVideoTracks()[0].enabled = false;
            })

            this.videoEnabled = false
            document.querySelector('.video_control').classList.remove('fa-video')
            document.querySelector('.video_control').classList.add('fa-video-slash')
        } else {
            this.localStreams.forEach(localStream => {
                localStream.getVideoTracks()[0].enabled = true;
            })

            this.videoEnabled = true;
            document.querySelector('.video_control').classList.remove('fa-video-slash')
            document.querySelector('.video_control').classList.add('fa-video')
        }

    }





}


module.exports = VideoChat;
