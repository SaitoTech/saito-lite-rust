



const videoBoxContainerTemplate = require("./video-box-container.template");
const videoBoxTemplate = require("./video-box.template");



class VideoBox {

    stream_id = null;

    constructor(app, mod) {
        this.app = app;
        this.mod = mod;
    }

    render(stream, streamId, containerClass) {
        if (!containerClass) return console.log("Please insert a container class to render the stream");
        this.stream_id = streamId



        // if (document.querySelector(`#stream${this.stream_id}`)) {
        //     if(stream === null){

        //     }
        //     const streamDom = document.querySelector(`#stream${this.stream_id}`);
        //     streamDom.srcObject = stream;
        //     return;
        // }


        let muted = false;
        if (streamId === 'local') {
            muted = true
        }

        if (stream === null) {
            if (!document.querySelector(`#stream${this.stream_id}`)) {
                this.app.browser.addElementToClass(videoBoxContainerTemplate(this.stream_id), containerClass);
            }

            const videoBoxContainer = document.querySelector(`#stream${this.stream_id}`);
            videoBoxContainer.innerHTML = `<p> Initializing Connection with ${this.stream_id}</p>`;


        } else {
            if (!document.querySelector(`#stream${this.stream_id}`)) {
                this.app.browser.addElementToClass(videoBoxContainerTemplate(this.stream_id), containerClass);
            }

            const videoBoxContainer = document.querySelector(`#stream${this.stream_id}`);
            // videoBoxContainer.style.backgroundColor = 'transparent';
            // videoBoxContainer.innerHTML = videoBoxTemplate(muted);
            // videoBoxContainer.firstElementChild.srcObject = stream;
            // console.log(videoBoxContainer.firstElementChild)


        }



    }

    remove() {

    }


}


module.exports = VideoBox;
