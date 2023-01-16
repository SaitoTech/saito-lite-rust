
const videoBoxTemplate = require("./video-box.template");



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

    render(stream, streamId, containerClass) {
        // if (!containerClass) return console.log("Please insert a container class to render the stream");
        this.stream_id = streamId;
        this.containerClass = containerClass;
        this.stream = stream
        console.log(this);



        if (this.stream === null) {
            this.renderPlaceholder();
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
            this.renderPlaceholder();
        } else {
            if (!document.querySelector(`#stream${this.stream_id}`)) {
                if (this.containerClass) {
                    this.app.browser.addElementToClass(videoBoxTemplate(this.stream_id, muted, this.ui_type), this.containerClass);
                } else {
                    this.app.browser.addElementToDom(videoBoxTemplate(this.stream_id, muted, this.ui_type));
                    this.app.browser.makeDraggable(`stream${this.stream_id}`, null, true);
                }
            }

            const videoBox = document.querySelector(`#stream${this.stream_id}`);
            console.log('call type', this.call_type)
            if (this.call_type === "audio") {
                videoBox.insertAdjacentHTML('beforeend', `<div class="audio-stream"> <i class="fas fa-microphone"></i></div> `);
            } else if (this.call_type === "video") {
                videoBox.firstElementChild.srcObject = this.stream;
            }
        }




    }

    renderPlaceholder() {
        if (!document.querySelector(`#stream${this.stream_id}`)) {
            if (this.containerClass) {
                this.app.browser.addElementToClass(videoBoxTemplate(this.stream_id, false, this.ui_type), this.containerClass);
            } else {

                this.app.browser.addElementToDom(videoBoxTemplate(this.stream_id, false, this.ui_type));
                this.app.browser.makeDraggable(`stream${this.stream_id}`, null, true);
            }


            // makeDraggable(id_to_move, id_to_drag = "", mycallback = null
        }
        const videoBox = document.querySelector(`#stream${this.stream_id}`);
        if (this.placeholderRendered) return;
        videoBox.insertAdjacentHTML('beforeend', `<div id="connection-message"> <p> Negotiating Peer Connection </p> <span class="lds-dual-ring"> </span></div> `);
        this.placeholderRendered = true
    }



    handleConnectionStateChange(connectionState) {
        switch (connectionState) {
            case "connecting":
                document.querySelector('#connection-message').innerHTML = `<p>Starting ${this.call_type} Chat </p> <span class='lds-dual-ring'>`
                break;
            case "connected":
                if (this.stream) {
                    document.querySelector('#connection-message').parentElement.remove(document.querySelector('#connection-message'));
                    this.renderStream({ muted: false });
                }
                break;
            // case "disconnected":
            //     document.querySelector(`#stream${this.stream_id}`).parentElement.remove(document.querySelector(`#stream${this.stream_id}`));
            //     break;
            case "failed":
                document.querySelector('#connection-message').textContent = `Failed to connect`
                break;

            default:
                break;
        }
    }



    remove() {

    }


}


module.exports = VideoBox;
