
const { forEach } = require("jszip");
const videoBoxTemplate = require("./video-box.template");
// import {applyVideoBackground, } from 'virtual-bg';



class VideoBox {

    stream_id = null;
    stream = null;
    placeholderRendered = false;
    stream_rendered = false;
    waitTimer;
    waitSeconds

    constructor(app, mod, ui_type, call_type, central, room_code, peer, container_class) {
        this.app = app;
        this.mod = mod;
        this.ui_type = ui_type
        this.call_type = call_type;
        this.central = central;
        this.room_code = room_code;
        this.stream_id = peer
        this.containerClass = container_class


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

        app.connection.on('disconnect', (kind, peer) => {
            this.disconnectFromPeer(peer)
        })
    }

    render(stream, placeholder_info = null) {
        this.stream = stream;
        if (stream !== null) {
            if (this.stream_id === 'local') {
                this.renderStream({ muted: true });
            } else {
                this.renderStream({ muted: false })
            }
        } else {
            this.renderPlaceholder(placeholder_info);
        }

    }


    // addRemoteStream(stream) {
    //     if (stream) {
    //         this.removeConnectionMessage();
    //         this.stream = stream;
    //         this.render

    //     }
    // }

    renderStream({ muted }) {
        if (!document.querySelector(`#stream${this.stream_id}`)) {
            this.app.browser.addElementToClass(videoBoxTemplate(this.stream_id, muted, this.ui_type), this.containerClass);

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
            this.app.browser.addElementToClass(videoBoxTemplate(this.stream_id, false, this.ui_type), this.containerClass);
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

        let video_box = document.querySelector(`#stream${this.stream_id}`);
        console.log('video box handle connection state ', is_creator);
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
                    if (this.streamExists()) {
                        // this.renderStream({ muted: false });
                        // this.stream_rendered = true;
                        this.stopWaitTimer()
                    }
                }
                break;
            case "disconnected":
                console.log(`#stream${this.stream_id}`, "stream id")
                this.stream = null
                this.stream_rendered = false;
                video_box.firstElementChild.srcObject = this.stream

                siteMessage(`connection with ${this.stream_id} unstable`, 5000);
                if (is_creator) {
                    const stun_mod = this.app.modules.returnModule('Stun');
                    let checkOnlineInterval = setInterval(async () => {
                        let online = await this.checkOnlineStatus();
                        if (!online) {
                            this.updateConnectionMessage('please check internet connectivity');
                        }
                        else {

                            clearInterval(checkOnlineInterval);
                            this.updateConnectionMessage('re-establishing connection');
                            // check if other peer is online, then send a connection.
                            let command = {
                                name: 'PING',
                                id: stun_mod.commands.length + 5,
                                status: null,
                                room_code: this.room_code,
                                callback: () => {
                                    const stun_mod = this.app.modules.returnModule('Stun');
                                    stun_mod.createMediaChannelConnectionWithPeers([peer], 'large', 'video', stun_mod.room_code, false);
                                }
                            }
                            this.mod.saveCommand(command);
                            let my_pub_key = this.app.wallet.returnPublicKey();
                            this.mod.sendCommandToPeerTransaction(peer, my_pub_key, command);

                            let count = 0;
                            const checkPingInterval = setInterval(() => {
                                // console.log('checking for ping back from peer')
                                stun_mod.commands.forEach(c => {
                                    if (c.id === command.id) {
                                        if (command.status === "success") {
                                            command.callback();
                                            clearInterval(checkPingInterval)
                                        } else if (command.status === "failed") {
                                            this.disconnectFromPeer(peer, "cannot reconnect, peer not available");
                                            clearInterval(checkPingInterval);
                                            stun_mod.deleteCommand(command);
                                        } else {
                                            if (count === 10) {
                                                this.disconnectFromPeer(peer, "cannot reconnect, peer not available");
                                                clearInterval(checkPingInterval);
                                                stun_mod.deleteCommand(command);
                                            }
                                        }
                                    }
                                })
                                count++;
                            }, 2000)
                        }
                    }, 2000)
                } else {
                    let online = await this.checkOnlineStatus();
                    if (!online) {
                        this.updateConnectionMessage('please check internet connectivity');
                    } else {
                        const stun_mod = this.app.modules.returnModule('Stun');
                        this.updateConnectionMessage('re-establishing connection');
                        let command = {
                            name: 'PING',
                            id: stun_mod.commands.length,
                            status: null,
                            room_code: this.room_code,
                            callback: () => {
                                // const stun_mod = this.app.modules.returnModule('Stun');
                                // stun_mod.createMediaChannelConnectionWithPeers([peer], 'large', 'video', stun_mod.room_code, false);
                            }
                        }
                        this.mod.saveCommand(command);
                        let my_pub_key = this.app.wallet.returnPublicKey();
                        this.mod.sendCommandToPeerTransaction(peer, my_pub_key, command);

                        let count = 0;
                        const checkPingInterval = setInterval(() => {
                            // console.log('checking for ping back from peer')
                            stun_mod.commands.forEach(c => {
                                if (c.id === command.id) {
                                    if (command.status === "success") {
                                        command.callback();
                                        clearInterval(checkPingInterval)
                                        stun_mod.deleteCommand(command);
                                    } else if (command.status === "failed") {
                                        this.disconnectFromPeer(peer, "cannot reconnect, peer not available");
                                        clearInterval(checkPingInterval);
                                    } else {
                                        if (count === 10) {
                                            this.disconnectFromPeer(peer, "cannot reconnect, peer not available");
                                            clearInterval(checkPingInterval);
                                            stun_mod.deleteCommand(command);
                                        }
                                    }
                                }
                            })
                            count++;
                        }, 2000)
                    }
                }
                break;
            case "failed":
                if (document.querySelector(`#stream${this.stream_id}`)) {
                    console.log(`#stream${this.stream_id}`, "stream id");
                    this.stream = null
                    this.stream_rendered = false;
                    video_box.firstElementChild.srcObject = this.stream
                    if (is_creator) {
                        console.log('beginning connection again');
                    }
                    this.updateConnectionMessage('connection failed');
                    siteMessage(`connection with  ${this.stream_id} failed`, 5000);
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
                this.handleConnectionStateChange(peer, 'ten_seconds', is_creator)
            }
            if (this.waitSeconds === 20) {
                this.handleConnectionStateChange(peer, 'twenty_seconds', is_creator)
            }
            if (this.waitSeconds === 90) {
                this.handleConnectionStateChange(peer, 'two_minutes', is_creator);
                if (is_creator) {
                    this.mod.createMediaChannelConnectionWithPeers([peer], 'large', 'video', this.room_code);
                }
            }
            if (this.waitSeconds === 150) {
                if (is_creator) {
                    this.mod.createMediaChannelConnectionWithPeers([peer], 'large', 'video', this.room_code);
                }
            }
            if (this.waitSeconds === (180 * 6)) {
                this.handleConnectionStateChange(peer, 'failed', is_creator)
                clearInterval(this.waitTimer)
            }
        }, 1000)
    }

    stopWaitTimer() {
        if (this.waitTimer) {
            clearInterval(this.waitTimer)
        }
    }




    remove() {

    }

    streamExists() {
        return this.stream;
    }

    disconnectFromPeer(peer, message = "disconnected from call") {
        if (peer !== this.stream_id) return;
        document.querySelector(`#stream${this.stream_id}`).parentElement.removeChild(document.querySelector(`#stream${this.stream_id}`));
        siteMessage(`${peer} ${message}`, 5000);

    }

    checkOnlineStatus = async () => {
        try {
            const online = await fetch("https://get.geojs.io/v1/ip/country.json?ip=8.8.8.8");
            return online.status >= 200 && online.status < 300; // either true or false
        } catch (err) {
            return false; // definitely offline
        }
    };



}


module.exports = VideoBox;
