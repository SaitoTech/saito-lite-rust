
const AudioBoxTemplate = require("./audio-box.template");
const { setTextRange } = require("typescript");
// import {applyVideoBackground, } from 'virtual-bg';



class AudioBox {

    constructor(app, mod, room_code, stream_id, container) {
        this.app = app;
        this.mod = mod;
        this.room_code = room_code;
        this.stream_id = stream_id
        this.container = container
        this.stream = null
    }


    render(stream) {

        if (!document.querySelector(`#audiostream${this.stream_id}`)) {
            this.app.browser.addElementToClass(AudioBoxTemplate(this.stream_id), this.container);
        }
        this.stream = stream;
        console.log(stream, 'stream')
        const audio_box = document.querySelector(`#audiostream${this.stream_id}`);
        audio_box.firstElementChild.srcObject = this.stream;

        console.log(this);
    }

    remove(){

            let audio_box = document.querySelector(`#audiostream${this.stream_id}`);
            audio_box.parentElement.removeChild(audio_box)
    }
            
}





module.exports = AudioBox;
