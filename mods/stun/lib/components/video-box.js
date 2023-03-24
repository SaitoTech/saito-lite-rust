
const { forEach } = require("jszip");
const videoBoxTemplate = require("./video-box.template");
const { setTextRange } = require("typescript");
// import {applyVideoBackground, } from 'virtual-bg';



class VideoBox {

    stream_id = null;
    stream = null;
    placeholderRendered = false;
    stream_rendered = false;
    waitTimer;
    waitSeconds = 0;
    is_connected_creator = false;
    receiving_connection = false
    is_connected = false

    constructor(app, mod, call_type, central, room_code, peer, container_class) {
        this.app = app;
        this.mod = mod;
        this.call_type = call_type;
        this.central = central;
        this.room_code = room_code;
        this.stream_id = peer
        this.containerClass = container_class
        this.retry_attempt_no = 0


        app.connection.on('toggle-peer-audio-status', ({ enabled, public_key }) => {
            if (public_key !== this.stream_id) return;
            const video_box = document.querySelector(`#stream${this.stream_id}`);
            if (video_box.querySelector(`#stream${this.stream_id} .video-call-info`)) {
                if (!enabled) {
                    video_box.querySelector(`#stream${this.stream_id} .video-call-info`).insertAdjacentHTML('beforeend', `<i class="fa fa-microphone-slash"> </i>`)
                } else {
                    let element = video_box.querySelector(`#stream${this.stream_id} .video-call-info .fa-microphone-slash`);
                    if (element) {
                        element.parentElement.removeChild(element);
                    }
                }
            }


        })
        app.connection.on('toggle-peer-video-status', ({ enabled, public_key }) => {
            if (public_key !== this.stream_id) return;
            const video_box = document.querySelector(`#stream${this.stream_id}`);
            if (video_box.querySelector(`#stream${this.stream_id} .video-call-info`)) {
                if (!enabled) {
                    video_box.querySelector(`#stream${this.stream_id} .video-call-info`).insertAdjacentHTML('beforeend', `<i class="fas fa-video-slash"> </i>`)
                } else {
                    let element = video_box.querySelector(`#stream${this.stream_id} .video-call-info .fa-video-slash`);
                    if (element) {
                        element.parentElement.removeChild(element)
                    }
                }
            }


        })


    }



    attachEvents() { }



    render(stream, placeholder_info = null) {


        if (stream) {
            this.stream = stream
        }

        // this.stream = stream;
        if (this.stream !== null) {
            this.removeConnectionMessage();
            if (this.stream_id === 'local') {
                this.renderStream({ muted: true });
            } else {
                this.renderStream({ muted: false })
                // console.log('rendering stream');
            }

            let name;
            if (this.stream_id === "local") {
                let public_key = this.app.wallet.returnPublicKey();
                name = public_key;
            } else {
                // name = this.app.keychain.returnIdentifierByPublicKey(this.stream_id);
                name = this.stream_id;
            }

            name = `${name.substring(0,9)}....${name.substring(37, name.length -1)}`
            const video_box = document.querySelector(`#stream${this.stream_id}`);
            if (video_box.querySelector('.video-call-info')) {
                video_box.querySelector('.video-call-info').innerHTML = `<p>${name}</p>`
            }

        



            if(this.stream_id=== 'local') return;


            // console.log(this.stream.getVideoTracks(), 'video tracky ', this.stream.getVideoTracks(), "audio tracky");
            // if (!this.stream.getVideoTracks()[0]) {
            //     if (video_box.querySelector(`#stream${this.stream_id} .video-call-info`)) {
            //         video_box.querySelector(`#stream${this.stream_id} .video-call-info`).insertAdjacentHTML('beforeend', `<i class="fas fa-video-slash"> </i>`)
            //     }
            // }else if(this.stream.getVideoTracks()[0] && !this.stream.getVideoTracks()[0].enabled) {
              
            //     if (video_box.querySelector(`#stream${this.stream_id} .video-call-info`)) {
            //         video_box.querySelector(`#stream${this.stream_id} .video-call-info`).insertAdjacentHTML('beforeend', `<i class="fas fa-video-slash"> </i>`)
            //     }
            // }
            // if (!this.stream.getAudioTracks()[0]) {
            //     const video_box = document.querySelector(`#stream${this.stream_id}`);
            //     if (video_box.querySelector(`#stream${this.stream_id} .video-call-info`)) {
            //         video_box.querySelector(`#stream${this.stream_id} .video-call-info`).insertAdjacentHTML('beforeend', `<i class="fa fa-microphone-slash"> </i>`)
            //     }
            // }else if(this.stream.getAudioTracks()[0] && this.stream.getAudioTracks()[0].enabled === false ){
            //     const video_box = document.querySelector(`#stream${this.stream_id}`);
            //     if (video_box.querySelector(`#stream${this.stream_id} .video-call-info`)) {
            //         video_box.querySelector(`#stream${this.stream_id} .video-call-info`).insertAdjacentHTML('beforeend', `<i class="fa fa-microphone-slash"> </i>`)
            //     }
            // }


        } else {
            this.renderPlaceholder(placeholder_info);
        }


        this.attachEvents()
    }

    rerender() {
        this.remove();
        this.render(this.stream)
    }

    renderStream({ muted }) {
        if (!document.querySelector(`#stream${this.stream_id}`)) {
            this.app.browser.addElementToClass(videoBoxTemplate(this.stream_id, muted), this.containerClass);
        }

        const videoBox = document.querySelector(`#stream${this.stream_id}`);
        if (this.call_type === "audio") {
            videoBox.insertAdjacentHTML('beforeend', `<div class="audio-stream"> <i class="fas fa-microphone"></i></div> `);
        } else if (this.call_type === "video") {
            videoBox.firstElementChild.srcObject = this.stream;
        }
    }

    renderPlaceholder(placeholder_info = "negotiating peer connection") {
        if (!document.querySelector(`#stream${this.stream_id}`)) {
            this.app.browser.addElementToClass(videoBoxTemplate(this.stream_id, false), this.containerClass);
            // this.app.browser.makeDraggable(`stream${this.stream_id}`, `stream${this.stream_id}`);
        }
        this.updateConnectionMessage(placeholder_info);
    }

    updateConnectionMessage(message) {
        const video_box = document.querySelector(`#stream${this.stream_id}`);
        if (video_box.querySelector('#connection-message')) {
            video_box.querySelector('#connection-message').innerHTML = `<p>${message}</p> <span class="lds-dual-ring"> </span> `
        } else {
            video_box.insertAdjacentHTML('beforeend', `<div id="connection-message"> <p> ${message} </p> <span class="lds-dual-ring"> </span></div> `);
        }
    }

    removeConnectionMessage() {
        const video_box = document.querySelector(`#stream${this.stream_id}`);

        if (video_box && video_box.querySelector('#connection-message')) {
            video_box.querySelectorAll('#connection-message').forEach(item => {
                item.parentElement.removeChild(video_box.querySelector('#connection-message'));
            })
        }


        // if it's in the expanded div, replace

    }



    updateVideoMuteStatus(message) {
        const video_box = document.querySelector(`#stream${this.stream_id}`);
        if (video_box.querySelector('.video-call-info')) {
            video_box.querySelector('.video-call-info').innerHTML = `<p>${message}</p>`
        }
    }

    removeVideoMuteStatus() {
        const video_box = document.querySelector(`#stream${this.stream_id}`);
        if (video_box.querySelector('.video-call-info')) {
            video_box.querySelectorAll('.video-call-info').forEach(item => {
                item.parentElement.removeChild(video_box.querySelector('.video-call-info'));
            })
        }
    }


    stopWaitTimer() {
        if (this.waitTimer) {
            clearInterval(this.waitTimer);
            this.waitSeconds = 0;
        }
    }




    remove(is_disconnection = false) {
        let videoBox = document.querySelector(`#stream${this.stream_id}`);
        if (videoBox) {
            if (is_disconnection) {
                if (videoBox.parentElement.classList.contains('expanded-video')) {
                    videoBox.parentElement.removeChild(videoBox);
                    this.mod.ChatManagerLarge.video_boxes['local'].video_box.containerClass = "expanded-video";
                    this.mod.ChatManagerLarge.video_boxes['local'].video_box.rerender();
                    return;
                }
                videoBox.parentElement.removeChild(videoBox);
            } else {
                // console.log(videoBox, 'video box')
                videoBox.parentElement.removeChild(videoBox);
            }
        }

    }

    streamExists() {
        return this.stream;
    }


}









module.exports = VideoBox;
