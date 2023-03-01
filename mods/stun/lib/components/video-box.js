
const { forEach } = require("jszip");
const videoBoxTemplate = require("./video-box.template");
// import {applyVideoBackground, } from 'virtual-bg';



class VideoBox {

    stream_id = null;
    stream = null;
    placeholderRendered = false;
    stream_rendered = false;

    constructor(app, mod, ui_type, call_type, central) {
        this.app = app;
        this.mod = mod;
        this.ui_type = ui_type
        this.call_type = call_type;
        this.central = central;

        app.connection.on('mute', (kind, public_key) => {
            if(public_key !== this.stream_id) return;
            console.log('receiving event');
            if(kind === "video"){
                let name = app.keychain.returnUsername(public_key);
                if(name.length > 10){
                    name = `${name.slice(0,10)}...`
                }
                this.updateVideoMuteStatus(name);
            }
        })
        app.connection.on('unmute', (kind, public_key) => {
            if(public_key !== this.stream_id) return;
            if(kind === "video"){
                this.removeVideoMuteStatus();
            }
        })

        app.connection.on('disconnect', (kind, public_key) => {
            if(public_key !== this.stream_id) return;
            if(kind === "all"){
                app.connection.emit('stun-disconnect');
                siteMessage("Call ended", 5000);
                return;
            }else {
                document.querySelector(`#stream${this.stream_id}`).parentElement.removeChild(document.querySelector(`#stream${this.stream_id}`));
                mod.closeMediaConnections(public_key);
                siteMessage("User Disconnected", 5000);
                if(mod.central === true){
                   mod.room.peers =  mod.room.peers.filter(key => public_key !== key);
                }
            }

            
        })
    }

    render(stream, streamId, containerClass, placeholder_info) {
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
            return;
        } else {
            if (!document.querySelector(`#stream${this.stream_id}`)) {
                if (this.containerClass) {
                    this.app.browser.addElementToClass(videoBoxTemplate(this.stream_id, muted, this.ui_type), this.containerClass);
                }
               
            }

            const videoBox = document.querySelector(`#stream${this.stream_id}`);
            console.log('call type', this.call_type)
            if (this.call_type === "audio") {
                videoBox.insertAdjacentHTML('beforeend', `<div class="audio-stream"> <i class="fas fa-microphone"></i></div> `);
            } else if (this.call_type === "video") {
                videoBox.firstElementChild.srcObject = this.stream;
                console.log('rendered stream ', this.stream.getVideoTracks()[0], videoBox.firstElementChild.srcObject)
                
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
            console.log('rendering placeholder');
            // makeDraggable(id_to_move, id_to_drag = "", mycallback = null
        }

        this.updateConnectionMessage(placeholder_info);
         
    }

    updateConnectionMessage(message){
        const video_box = document.querySelector(`#stream${this.stream_id}`);
        if(video_box.querySelector('#connection-message')){
            video_box.querySelector('#connection-message').innerHTML =  `<p>${message}</p> <span class="lds-dual-ring"> </span> `
        }else {
            video_box.insertAdjacentHTML('beforeend', `<div id="connection-message"> <p> ${message} </p> <span class="lds-dual-ring"> </span></div> `);
        }   
    }

    removeConnectionMessage(){
        const video_box = document.querySelector(`#stream${this.stream_id}`);
        if (video_box.querySelector('#connection-message')) {
            video_box.querySelectorAll('#connection-message').forEach(item => {
                item.parentElement.removeChild(video_box.querySelector('#connection-message'));
            })
        }
    }

    updateVideoMuteStatus(message){
        const video_box = document.querySelector(`#stream${this.stream_id}`);
        if(video_box.querySelector('#video-mute-message')){
            video_box.querySelector('#video-mute-message').innerHTML =  `<p>${message}</p>`
        }else {
            video_box.insertAdjacentHTML('beforeend', `<div id="video-mute-message"> <p> ${message} </p></div> `);
        }   
    }

    removeVideoMuteStatus(){
        const video_box = document.querySelector(`#stream${this.stream_id}`);
        if (video_box.querySelector('#video-mute-message')) {
            video_box.querySelectorAll('#video-mute-message').forEach(item => {
                item.parentElement.removeChild(video_box.querySelector('#video-mute-message'));
            })
        }
    }



    handleConnectionStateChange(peer, connectionState) {
        // console.log('');
        // const videoBox = document.querySelector(`#stream${this.stream_id}`);
        let video_box = document.querySelector(`#stream${this.stream_id}`);
        console.log('video box handle connection state ', video_box, this);
        let connection_message = document.querySelector('#connection-message');
        if (!video_box) return;
        switch (connectionState) {
            case "connecting":
                if(this.stream_rendered) return;
                    this.updateConnectionMessage(`Starting ${this.call_type.toUpperCase()} Chat ` );
      
               
                // document.querySelector('#connection-message').innerHTML = `<p>Starting ${this.call_type.toUpperCase()} Chat </p> <span class='lds-dual-ring'>`
                break;
            case "connected":
                if (this.stream) {
                    this.removeConnectionMessage();
                    this.renderStream({ muted: false });
                    this.stream_rendered = true;
                }
                break;
            case "disconnected":
                if(this.central === peer){
                    this.app.connection.emit('stun-disconnect');
                    siteMessage("Call ended", 5000);
                    return;
                }

                console.log(`#stream${this.stream_id}`, "stream id")
                this.stream = null
                this.stream_rendered = false;
                video_box.firstElementChild.srcObject = this.stream
                // document.querySelector(`#stream${this.stream_id}`).parentElement.removeChild(document.querySelector(`#stream${this.stream_id}`));
                // this.updateConnectionMessage('Connection disconnected, Retrying connection');
                siteMessage("User Disconnected", 5000);
                break;
            case "failed":
                if (document.querySelector(`#stream${this.stream_id}`)) {
                    console.log(`#stream${this.stream_id}`, "stream id")
                    this.stream = null
                    this.stream_rendered = false;
                    video_box.firstElementChild.srcObject = this.stream
                    this.updateConnectionMessage('Connection failed, Retrying connection');
                    // document.querySelector(`#stream${this.stream_id}`).parentElement.removeChild(document.querySelector(`#stream${this.stream_id}`));
                    siteMessage(`Connection with  ${this.stream_id} failed`, 5000);
                }
                break;
            case "ten_seconds":
                this.updateConnectionMessage('Negotiating Peer Connection')
                break
            case "twenty_seconds":
                this.updateConnectionMessage('Trying Alternative Route')
                break
            case "two_minutes":
                this.updateConnectionMessage('Retrying Connection')
                break

            default:
                break;
        }
    }



    remove() {

    }


}


module.exports = VideoBox;
