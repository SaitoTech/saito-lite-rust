
const videoBoxTemplate = require("./video-box.template");



class VideoBox {

    stream_id = null;
    stream = null;
    placeholderRendered = false;
    constructor(app, mod) {
        this.app = app;
        this.mod = mod;
    }

    render(stream, streamId, containerClass) {
        // if (!containerClass) return console.log("Please insert a container class to render the stream");


        this.stream_id = streamId;
        this.containerClass = containerClass;
        this.stream = stream
        console.log(this);
        if (this.stream_id === 'local' && stream !== null) {
            this.renderStream({ muted: true });

        }

        if (this.stream === null) {
            this.renderPlaceholder();
        }


    }


    addStream(stream) {
        if (stream) {
            this.stream = stream;
        }
    }

    renderStream({ muted }) {
        if (!document.querySelector(`#stream${this.stream_id}`)) {
            if(this.containerClass){
                this.app.browser.addElementToClass(videoBoxTemplate(this.stream_id, muted), this.containerClass);
            }else {
                this.app.browser.addElementToDom(videoBoxTemplate(this.stream_id, muted));
                this.app.browser.makeDraggable(`stream${this.stream_id}`);
            }
        }
        const videoBox = document.querySelector(`#stream${this.stream_id}`);
        videoBox.firstElementChild.srcObject = this.stream;
   
    }

    renderPlaceholder() {
        if (!document.querySelector(`#stream${this.stream_id}`)) {
            if(this.containerClass){
                this.app.browser.addElementToClass(videoBoxTemplate(this.stream_id, false), this.containerClass);
            }else {
                this.app.browser.addElementToDom(videoBoxTemplate(this.stream_id, false));
                this.app.browser.makeDraggable(`stream${this.stream_id}`);
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
                document.querySelector('#connection-message').innerHTML = "<p>Starting Video Chat </p> <span class='lds-dual-ring'>"
                break;
            case "connected":
                if (this.stream) {
                    document.querySelector('#connection-message').parentElement.remove(document.querySelector('#connection-message'));
                    this.renderStream({ muted: null });
                }
                break;
            // case "disconnected":
            //     document.querySelector(`#stream${this.stream_id}`).parentElement.remove(document.querySelector(`#stream${this.stream_id}`));
            //     break;
            case "failed":
                document.querySelector('#connection-message').textContent = "<p>Failed to connect </p>"
                break;

            default:
                break;
        }
    }



    remove() {

    }


}


module.exports = VideoBox;
