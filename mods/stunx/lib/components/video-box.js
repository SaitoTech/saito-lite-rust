const videoBoxTemplate = require("./video-box.template");



class VideoBox {

    stream_id = null;

    constructor(app, mod) {
        this.app = app;
        this.mod = mod;
    }

    render(stream, streamId, containerClass) {
        if (!containerClass) return console.log("Please insert a container class to render the stream");
        if (!stream) return console.log("No stream was found");
        this.stream_id = streamId
        if (!streamId) {
            this.stream_id = this.app.crypto.hash(Math.random()).substring(0, 6);
        }

        console.log('random stream id : ', this.app.crypto.hash(Math.random()).substring(0, 6));
        if (document.querySelector(`#stream${this.stream_id}`)) {
            const streamDom = document.querySelector(`#stream${this.stream_id}`);
            streamDom.srcObject = stream;
            return;
        }

        let muted = false;

        if (streamId === 'local') {
            muted = true
        }

        this.app.browser.addElementToClass(videoBoxTemplate(this.stream_id, muted), containerClass);
        const streamDom = document.querySelector(`#stream${this.stream_id}`);
        streamDom.srcObject = stream;
    }

    remove() {

    }


}


module.exports = VideoBox;