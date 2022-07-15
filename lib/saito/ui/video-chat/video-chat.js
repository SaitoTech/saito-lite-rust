
const videoChatTemplate = require('./templates/video-chat-template');

class VideoChat {

    // peers = {};
    localStreams = [];
    remoteStreams = [];
    my_pc = [];
    peer_connection = "";
    constructor(app, mod) {
        this.app = app;

    }
    videoEnabled = true;
    audioEnabled = true;


    render() {
        this.app.browser.addElementToDom(videoChatTemplate(), document.getElementById('content__'));
    }

    attachEvents() {

        var $modal = $(".body");
        $modal.resizable({
            minWidth: 625,
            minHeight: 175,
            handles: " e, w",
        }).draggable()

        $('.video').on('click', '.disconnect_btn', (e) => {
            this.my_pc.forEach(pc => pc.close());
            this.hide();
            console.log('disconnecting');
        })
        $('.video').on('click', '.audio_control', (e) => {
            this.toggleAudio();
        })
        $('.video').on('click', '.video_control', (e) => {
            this.toggleVideo();
        })
    }

    show(pc) {
        this.my_pc.push(pc)
        if (!document.querySelector('.video')) {

            this.render();
            this.attachEvents();
        }

    }

    hide() {
        console.log('hiding')
        $('.body').remove();
    }

    addLocalStream(localStream) {
        const localStreamDom = document.querySelector('#localStream');
        if (!localStreamDom) return console.log("An error occured rendering local stream");
        localStreamDom.srcObject = localStream;
        this.localStreams.push(localStream)
    }
    addRemoteStream(remoteStream, public_key) {
        // To Always insert remote stream in the same ordered manner
        let index = this.remoteStreams.findIndex(item => item?.publicKey === public_key);
        if (index === -1) {
            this.remoteStreams.push({ publicKey: public_key });
            index = this.remoteStreams.length - 1;
        }

        console.log('remote streams', this.remoteStreams);

        const remoteStreamDom = document.querySelector(`#remoteStream${index + 1}`);


        if (!remoteStreamDom) return console.log("An error occured rendering remote stream");
        remoteStreamDom.style.display = "block";
        remoteStreamDom.srcObject = remoteStream;

    }

    toggleAudio() {
        console.log('toggling audio');
        if (this.audioEnabled === true) {
            this.localStreams.forEach(localStream => {
                localStream.getAudioTracks()[0].enabled = false;
            })
            this.audioEnabled = false
            $('.audio_control').removeClass('fa-microphone')
            $('.audio_control').addClass('fa-microphone-slash')
        } else {
            this.localStreams.forEach(localStream => {
                localStream.getAudioTracks()[0].enabled = true;
            })

            this.audioEnabled = true;
            $('.audio_control').removeClass('fa-microphone-slash')
            $('.audio_control').addClass('fa-microphone')
        }

    }

    toggleVideo() {
        console.log('toggling video');
        if (this.videoEnabled === true) {
            this.localStreams.forEach(localStream => {
                localStream.getVideoTracks()[0].enabled = false;
            })

            this.videoEnabled = false
        } else {
            this.localStreams.forEach(localStream => {
                localStream.getVideoTracks()[0].enabled = true;
            })

            this.videoEnabled = true;
        }

    }





}


module.exports = VideoChat;
