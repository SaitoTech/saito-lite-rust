
const videoBoxTemplate = require("./video-box.template");
// import {applyVideoBackground, } from 'virtual-bg';



class VideoBox {

    stream_id = null;
    stream = null;
    placeholderRendered = false;
    constructor(app, mod, ui_type, call_type) {
        this.app = app;
        this.mod = mod;
        this.ui_type = ui_type
        this.call_type = call_type;
    }

    render(stream, streamId, containerClass, placeholder_info) {
        // if (!containerClass) return console.log("Please insert a container class to render the stream");
        this.stream_id = streamId;
        this.containerClass = containerClass;
        this.stream = stream
        console.log(this);

        if (this.stream === null) {
            console.log('placeholder ', placeholder_info)
            this.renderPlaceholder(placeholder_info);
        }

        if (this.stream_id === 'local' && stream !== null) {
            this.renderStream({ muted: true });
        } else {
            this.renderStream({ muted: false })
        }





    }


    addStream(stream) {
        if (stream) {
            this.stream = stream;
        }
    }

    renderStream({ muted }) {
        if (!this.stream) {
            // this.renderPlaceholder();
            return;
        } else {
            if (!document.querySelector(`#stream${this.stream_id}`)) {
                if (this.containerClass) {
                    this.app.browser.addElementToClass(videoBoxTemplate(this.stream_id, muted, this.ui_type), this.containerClass);
                }
                else {
                    return console.log("No container class")
                }
            }

            const videoBox = document.querySelector(`#stream${this.stream_id}`);
            console.log('call type', this.call_type)
            if (this.call_type === "audio") {
                videoBox.insertAdjacentHTML('beforeend', `<div class="audio-stream"> <i class="fas fa-microphone"></i></div> `);
            } else if (this.call_type === "video") {
                videoBox.firstElementChild.srcObject = this.stream;
                console.log('rendered stream ', this.stream, videoBox.firstElementChild.srcObject)
            }
        }




    }

    renderPlaceholder(placeholder_info = "Negotiating Peer connection") {
        if (!document.querySelector(`#stream${this.stream_id}`)) {
            if (this.containerClass) {
                this.app.browser.addElementToClass(videoBoxTemplate(this.stream_id, false, this.ui_type), this.containerClass);
            } else {
                return console.log("No container class")
            }

            // makeDraggable(id_to_move, id_to_drag = "", mycallback = null
        }
        const videoBox = document.querySelector(`#stream${this.stream_id}`);
        console.log('rendering placeholder')
        videoBox.insertAdjacentHTML('beforeend', `<div id="connection-message"> <p> ${placeholder_info} </p> <span class="lds-dual-ring"> </span></div> `);
    }



    handleConnectionStateChange(connectionState) {
        let video_box = document.querySelector(`#stream${this.stream_id}`);
        let connection_message = document.querySelector('#connection-message');
        if (!video_box) return;
        switch (connectionState) {
            case "connecting":
                document.querySelector('#connection-message').innerHTML = `<p>Starting ${this.call_type.toUpperCase()} Chat </p> <span class='lds-dual-ring'>`
                break;
            case "connected":
                if (this.stream) {
                    if (document.querySelector('#connection-message')) {
                        document.querySelector('#connection-message').parentElement.removeChild(document.querySelector('#connection-message'));
                    }
                    this.renderStream({ muted: false });
                }
                break;
            case "disconnected":
                console.log(`#stream${this.stream_id}`, "stream id")
                let videoBox =  document.querySelector(`#stream${this.stream_id}`)
                this.stream = null
                videoBox.firstElementChild.srcObject = this.stream
                // document.querySelector(`#stream${this.stream_id}`).parentElement.removeChild(document.querySelector(`#stream${this.stream_id}`));
                siteMessage("User Disconnected", 5000);
                break;
            case "failed":
                if (document.querySelector(`#stream${this.stream_id}`)) {
                    console.log(`#stream${this.stream_id}`, "stream id")
                    let videoBox =  document.querySelector(`#stream${this.stream_id}`)
                    this.stream = null
                    videoBox.firstElementChild.srcObject = this.stream
                    // document.querySelector(`#stream${this.stream_id}`).parentElement.removeChild(document.querySelector(`#stream${this.stream_id}`));
                    siteMessage("Connection failed", 5000);
                }
                break;
            case "ten_seconds":
                if (document.querySelector('#connection-message')) {
                    document.querySelector('#connection-message').innerHTML = `<p>Negotiating Peer Connection</p> <span class='lds-dual-ring'>`
                }

                break
            case "twenty_seconds":
                if (document.querySelector('#connection-message')) {
                    document.querySelector('#connection-message').innerHTML = `<p>Trying Alternative Route</p> <span class='lds-dual-ring'>`
                }

                break
            case "two_minutes":
                if (document.querySelector('#connection-message')) {
                    document.querySelector('#connection-message').innerHTML = `<p>Retrying Connection</p> <span class='lds-dual-ring'>`
                }
                break

            default:
                break;
        }
    }



    remove() {

    }


}


module.exports = VideoBox;
