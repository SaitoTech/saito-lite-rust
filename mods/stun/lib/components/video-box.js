
const { forEach } = require("jszip");
const videoBoxTemplate = require("./video-box.template");
// import {applyVideoBackground, } from 'virtual-bg';



class VideoBox {

    stream_id = null;
    stream = null;
    placeholderRendered = false;
    stream_rendered = false;
    waitTimer;
    waitSeconds = 0;

    constructor(app, mod, ui_type, call_type, central, room_code) {
        this.app = app;
        this.mod = mod;
        this.ui_type = ui_type
        this.call_type = call_type;
        this.central = central;
        this.room_code = room_code;

        app.connection.on('mute', (kind, public_key) => {
            if (public_key !== this.stream_id) return;
            console.log('receiving event');
            if (kind === "video") {
                let name;
                if (public_key === "local") {
                    let public_key = app.wallet.returnPublicKey();
                    name = app.keychain.returnUsername(public_key)
                } else {
                    name = app.keychain.returnUsername(public_key);
                }

                if (name.length > 10) {
                    name = `${name.slice(0, 10)}...`
                }
                this.updateVideoMuteStatus(name);
            }
        })
        app.connection.on('unmute', (kind, public_key) => {
            if (public_key !== this.stream_id) return;
            if (kind === "video") {
                this.removeVideoMuteStatus();
            }
        })

        app.connection.on('disconnect', (kind, public_key) => {
            if (public_key !== this.stream_id) return;
            if (kind === "all") {
                app.connection.emit('stun-disconnect');
                siteMessage("Call ended", 5000);
                return;
            } else {
                document.querySelector(`#stream${this.stream_id}`).parentElement.removeChild(document.querySelector(`#stream${this.stream_id}`));
                mod.closeMediaConnections(public_key);
                siteMessage(`${public_key} disconnected from call`, 5000);
                if (mod.central === true) {
                    mod.room.peers = mod.room.peers.filter(key => public_key !== key);
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

    renderPlaceholder(placeholder_info = "negotiating peer connection") {
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
        if (video_box.querySelector('#connection-message')) {
            video_box.querySelectorAll('#connection-message').forEach(item => {
                item.parentElement.removeChild(video_box.querySelector('#connection-message'));
            })
        }
    }

    updateVideoMuteStatus(message) {
        const video_box = document.querySelector(`#stream${this.stream_id}`);
        if (video_box.querySelector('#video-mute-message')) {
            video_box.querySelector('#video-mute-message').innerHTML = `<p>${message}</p>`
        } else {
            video_box.insertAdjacentHTML('beforeend', `<div id="video-mute-message"> <p> ${message} </p></div> `);
        }
    }

    removeVideoMuteStatus() {
        const video_box = document.querySelector(`#stream${this.stream_id}`);
        if (video_box.querySelector('#video-mute-message')) {
            video_box.querySelectorAll('#video-mute-message').forEach(item => {
                item.parentElement.removeChild(video_box.querySelector('#video-mute-message'));
            })
        }
    }



    async handleConnectionStateChange(peer, connectionState, is_creator = false) {
        let my_pub_key = this.app.wallet.returnPublicKey();
        let video_box = document.querySelector(`#stream${this.stream_id}`);
        console.log('video box handle connection state ', video_box, this);
        let connection_message = document.querySelector('#connection-message');
        if (!video_box) return;
        switch (connectionState) {
            case "connecting":
                if (this.stream_rendered) return;
                this.updateConnectionMessage(`starting ${this.call_type} chat `);
                break;
            case "connected":
                if (this.stream) {
                    this.removeConnectionMessage();
                    this.renderStream({ muted: false });
                    this.stream_rendered = true;
                    this.stopWaitTimer();
                }
                break;
            case "disconnected":
                console.log(`#stream${this.stream_id}`, "stream id")
                this.stream = null
                this.stream_rendered = false;
                video_box.firstElementChild.srcObject = this.stream
                siteMessage(`connection with ${this.stream_id} unstable`, 5000);


                if (is_creator) {
                    let interval = setInterval(async () => {
                        let online = await this.checkOnlineStatus();
                        if (!online) {
                            this.updateConnectionMessage('please check internet connectivity');
                        }
                        else {
                            this.updateConnectionMessage('re-establishing connection');
                            // check if other peer is online, then send a connection.
                            this.mod.createMediaChannelConnectionWithPeers([peer], 'large', 'video', this.room_code, false);
                            clearInterval(interval);
                            // let counter = 0;
                            // let interval_2 = setInterval(() => {  
                            //     if (this.mod.peer_connections[peer].connectionState ==="connected" ) {
                            //         clearInterval(interval_2);
                            //     } else if(this.mod.peer_connections[peer].connectionState !=="connected") {
                            //         if(counter > 0){
                            //             this.mod.createMediaChannelConnectionWithPeers([peer], 'large', 'video', this.room_code, false);
                            //         }                  
                            //     }
                            //     counter++
                            // }, 20000);
                        }
                    }, 2000)
                } else {
                    let interval = setInterval(async () => {
                        let online = await this.checkOnlineStatus();
                        if (!online) {
                            this.updateConnectionMessage('please check internet connectivity');
                        }
                        else {
                            this.updateConnectionMessage('re-establishing connection');
                            // send message to other peer telling it I am online and ask it to send a connection
                            this.mod.sendCommandToPeerTransaction(my_pub_key, peer, "initiate transaction");
                            clearInterval(interval);
                        }
                    }, 2000)
                }
                break;
            case "failed":
                if (document.querySelector(`#stream${this.stream_id}`)) {
                    this.stream = null
                    this.stream_rendered = false;
                    video_box.firstElementChild.srcObject = this.stream
                    this.updateConnectionMessage('connection failed');
                    if (is_creator) {
                        console.log('beginning connection again');
                    }
                    siteMessage(`Connection with  ${this.stream_id} failed`, 5000);
                }
                break;
            case "ten_seconds":
                this.updateConnectionMessage('negotiating peer connection')
                break
            case "twenty_seconds":
                this.updateConnectionMessage('trying alternative route')
                break
            case "two_minutes":
                this.updateConnectionMessage('retrying connection')
                break

            default:
                break;
        }
    }

    startWaitTimer(is_creator = false) {
        this.stopWaitTimer();
        this.waitTimer = setInterval(() => {
            this.waitSeconds += 1;
            if (this.waitSeconds === 10) {
                this.handleConnectionStateChange(this.stream_id, 'ten_seconds')
            }
            if (this.waitSeconds === 30) {
                this.handleConnectionStateChange(this.stream_id, 'twenty_seconds')
            }
            if (this.waitSeconds === 90) {
                this.handleConnectionStateChange(this.stream_id, 'disconnected', is_creator);
            }
            if (this.waitSeconds === 150) {
                if (is_creator) {
                    // this.mod.createMediaChannelConnectionWithPeers([peer], 'large', 'video', this.room_code);
                }
            }
            if (this.waitSeconds === (180 * 6)) {
                this.handleConnectionStateChange(this.stream_id, 'failed')
                clearInterval(this.waitTimer)
            }
        }, 1000)
    }

    stopWaitTimer() {
        if (this.waitTimer) {
            clearInterval(this.waitTimer)
        }
    }

    checkOnlineStatus = async () => {
        try {
            const online = await fetch("https://get.geojs.io/v1/ip/country.json?ip=8.8.8.8");
            return online.status >= 200 && online.status < 300; // either true or false
        } catch (err) {
            return false; // definitely offline
        }
    };



    remove() {

    }


}


module.exports = VideoBox;

