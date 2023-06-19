
const AudioBoxTemplate = require("./audio-box.template");
const { setTextRange } = require("typescript");
// import {applyVideoBackground, } from 'virtual-bg';

/**
 * 
 *  Audio Box is a hook for a voice call, it adds an <audio> element to the DOM
 *  and can display the identicons of the people involved in the call
 * 
 */



class AudioBox {

    constructor(app, mod, stream_id, container) {
        this.app = app;
        this.mod = mod;
        this.stream_id = stream_id
        this.container = container
        this.stream = null
    }

    render(stream) {
        if (!document.querySelector(`#audiostream${this.stream_id}`)) {
            this.app.browser.addElementToSelector(AudioBoxTemplate(this.app, this.stream_id), this.container);
        }
        this.stream = stream;
        console.log(stream, 'stream')
        document.querySelectorAll("audio").forEach(audio => {
            if (audio.getAttribute("id") == this.stream_id){
                audio.srcObject = this.stream;
            }
        });
    }

    remove() {
        let audio_box = document.querySelector(`#audiostream${this.stream_id}`);
        if (audio_box){
            audio_box.remove();            
        }
    }
}





module.exports = AudioBox;
