const ChatManagerLarge = require("./chat-manager-large")


class PeerManager {
    constructor(app, mod, ui_type = "large", config) {
        // console.log(config, 'config')
        this.app = app;
        this.mod = mod
        this.ui_type = ui_type;
        this.config = config;
        this.peers = new Map();
        this.localStream = null;
        this.remoteStreams = new Map();
        this.servers = [
            {
                urls: "stun:stun-sf.saito.io:3478"
            },
            {
                urls: "turn:stun-sf.saito.io:3478",
                username: "guest",
                credential: "somepassword",
            },
            {
                urls: "stun:stun-sg.saito.io:3478"
            },
            {
                urls: "turn:stun-sg.saito.io:3478",
                username: "guest",
                credential: "somepassword",
            },
            {
                urls: "stun:stun-de.saito.io:3478"
            },
            {
                urls: "turn:stun-de.saito.io:3478",
                username: "guest",
                credential: "somepassword",
            }
        ];
        this.videoEnabled = true;
        this.audioEnabled = true



        this.app.connection.on('stun-peer-manager-update-room-code', (room_code) => {
            this.room_code = room_code
        });


        app.connection.on('stun-event-message', (data) => {
            if (data.room_code !== this.room_code) {
                return;
            }

            if (data.type === 'peer-joined') {
                let peerConnection = this.peers.get(data.public_key);
                if(!peerConnection){
                    this.createPeerConnection(data.public_key, 'offer');
                }
              
            } else if (data.type === 'peer-left') {
                this.removePeerConnection(data.public_key);
            } else if (data.type === "toggle-audio") {
                // console.log(data);
                app.connection.emit('toggle-peer-audio-status', data)
            } else if (data.type === "toggle-video") {
                app.connection.emit('toggle-peer-video-status', data)
            }
            else {
                let peerConnection = this.peers.get(data.public_key);
                if (!peerConnection) {
                    this.createPeerConnection(data.public_key);
                    peerConnection = this.peers.get(data.public_key);
                }

                if (peerConnection) {
                    this.handleSignalingMessage(peerConnection, data);
                }
            }
        })

        app.connection.on('stun-disconnect', () => {
            this.leave()
        })

        app.connection.on('stun-toggle-video', async () => {
            if (this.videoEnabled === true) {
                this.localStream.getVideoTracks()[0].enabled = false;
                this.app.connection.emit("mute", 'video', 'local');
                this.videoEnabled = false;
                document.querySelector('.video-control i').classList.remove('fa-video')
                document.querySelector('.video-control i').classList.add('fa-video-slash')
            } else {

                document.querySelector('.video-control i').classList.add('fa-video')
                document.querySelector('.video-control i').classList.remove('fa-video-slash')
                if (!this.localStream.getVideoTracks()[0]) {

                    const oldVideoTracks = this.localStream.getVideoTracks();
                    if (oldVideoTracks.length > 0) {
                        oldVideoTracks.forEach(track => {
                            this.localStream.removeTrack(track);
                        });
                    }
                    // start a video stream;
                    let localStream = await navigator.mediaDevices.getUserMedia({ video: true })

                    // Add new track to the local stream


                    this.app.connection.emit('render-local-stream-request', this.localStream, 'video');
                    let track = localStream.getVideoTracks()[0];
                    this.localStream.addTrack(track);

                    this.peers.forEach((peerConnection, key) => {
                        const videoSenders = peerConnection.getSenders().filter(sender => sender.track && sender.track.kind === 'video');
                        if (videoSenders.length > 0) {
                            videoSenders.forEach(sender => {
                                sender.replaceTrack(track);
                            })

                        } else {
                            peerConnection.addTrack(track);
                        }

                        this.renegotiate(key);
                    })
                    document.querySelector('.video-control i').classList.add('fa-video')
                    this.videoEnabled = true;

                } else {
                    this.localStream.getVideoTracks()[0].enabled = true;
                    this.app.connection.emit("unmute", 'video', 'local');
                }
                this.videoEnabled = true;
            }

            let data = {
                room_code: this.room_code,
                type: 'toggle-video',
                enabled: this.videoEnabled,
            }
            this.app.connection.emit('stun-send-message-to-server', data);
        })

        app.connection.on('stun-toggle-audio', async () => {
            // if video is enabled
            if (this.audioEnabled === true) {
                this.localStream.getAudioTracks()[0].enabled = false;
                this.app.connection.emit("mute", 'audio', 'local');
                this.audioEnabled = false;
                document.querySelectorAll('.audio-control i').forEach(item => {
                    item.classList.add('fa-microphone-slash')
                   item.classList.remove('fa-microphone');
                })
    
            }
            else {
                this.localStream.getAudioTracks()[0].enabled = true;
                this.audioEnabled = true;
                document.querySelectorAll('.audio-control i').forEach(item => {
                    item.classList.remove('fa-microphone-slash')
                   item.classList.add('fa-microphone');
                })
    
            }

            let data = {
                room_code: this.room_code,
                type: 'toggle-audio',
                enabled: this.audioEnabled,
            }
            this.app.connection.emit('stun-send-message-to-server', data);
        })

        app.connection.on('show-chat-manager-large', async (to_join) => {
            // console.log(this, "peer")
            await this.showChatManagerLarge();

            if (to_join) {
                this.join()
            }
            let sound = new Audio('/videocall/audio/enter-call.mp3');
            sound.play();
        })
        app.connection.on('show-chat-manager-small', async (to_join, config) => {
            // console.log(this, "peer")
            await this.showChatManagerSmall(this.config);
            if (to_join) {
                this.join();
            }
            let sound = new Audio('/videocall/audio/enter-call.mp3');
            sound.play();
        })
        app.connection.on('switch-ui-type-to-large', async () => {
            this.ui_type = "large";
            // remove small ui
            this.removeChatManagerSmall(false);
            // render large ui

            this.showChatManagerLarge();
            setTimeout(()=> {
                app.connection.emit('stun-toggle-video');
            }, 500)

            setTimeout(()=> {
                this.renderRemoteStreams();
            }, 1000)


     
            // loop over this.remoteStreams and render them
       
          
        })
        app.connection.on('switch-ui-type-to-small', async () => {
            this.ui_type = "small"
        })

        app.connection.on('update-media-preference', (kind, state) => {
            if (kind === "audio") {
                this.audioEnabled = state
            } else if (kind === "video") {
                this.videoEnabled = state
            }
        })
    }

    showSetting() {
        this.app.connection.emit('show-chat-setting', this.room_code);
    }


    async showChatManagerLarge() {
        // emit events to show chatmanager;
        // get local stream;
        this.localStream = await navigator.mediaDevices.getUserMedia({ video: this.videoEnabled, audio: true });
        this.localStream.getAudioTracks()[0].enabled = this.audioEnabled;
        // this.localStream.getAudioTracks()[0].enabled = this.audioEnabled;
        // console.log(this.config)
        this.app.connection.emit('show-video-chat-large-request', this.app, this.mod, 'video', this.room_code, this.videoEnabled, this.audioEnabled, this.config);
        this.app.connection.emit('stun-remove-loader')
        this.app.connection.emit('render-local-stream-large-request', this.localStream, 'video');
        this.app.connection.emit('remove-overlay-request');
    }

   
    async showChatManagerSmall() {
        // emit events to show chatmanager;
        // get local stream;
        this.videoEnabled = false;
        this.localStream = await navigator.mediaDevices.getUserMedia({ video: this.videoEnabled, audio: true });
        this.localStream.getAudioTracks()[0].enabled = this.audioEnabled;
        this.app.connection.emit('show-video-chat-small-request', this.app, this.mod, this.room_code, this.videoEnabled, this.audioEnabled, this.config);
        this.app.connection.emit('render-local-stream-small-request', this.localStream);
    }

    removeChatManagerSmall(completely) {
        this.app.connection.emit('remove-video-chat-small-request', completely);
    }

    handleSignalingMessage(peerConnection, data) {
        const { type, sdp, candidate, targetPeerId, public_key } = data;
        if (type === 'renegotiate-offer' || type === 'offer') {
            peerConnection.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp }))

                .then(() => {

                    return peerConnection.createAnswer();
                })
                .then((answer) => {
                    return peerConnection.setLocalDescription(answer);
                })
                .then(() => {
                    let data = {
                        room_code: this.room_code,
                        type: 'renegotiate-answer',
                        sdp: peerConnection.localDescription.sdp,
                        targetPeerId: public_key,
                    }
                    this.app.connection.emit('stun-send-message-to-server', data);
                })
                .catch((error) => {
                    console.error('Error handling offer:', error);
                });
        } else if (type === 'renegotiate-answer' || type === 'answer') {
            peerConnection.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp })).then(answer => {

            }).catch((error) => {
                console.error('Error handling answer:', error);
            });
        } else if (type === 'candidate') {
            peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
                .catch((error) => {
                    console.error('Error adding remote candidate:', error);
                });
        }

    }


    createPeerConnection(peerId, type) {
        const peerConnection = new RTCPeerConnection({
            iceServers: this.servers,
        });

        this.peers.set(peerId, peerConnection);
        // Implement the creation of a new RTCPeerConnection and its event handlers

        // Handle ICE candidates
        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                let data = {
                    room_code: this.room_code,
                    type: 'candidate',
                    candidate: event.candidate,
                    targetPeerId: peerId,
                }
                this.app.connection.emit('stun-send-message-to-server', data);

            }
        }



        const remoteStream = new MediaStream();
        peerConnection.addEventListener('track', (event) => {
            // console.log("trackss", event.track, "stream :", event.streams);
            if (event.streams.length === 0) {
                remoteStream.addTrack(event.track);
            } else {
                event.streams[0].getTracks().forEach(track => {
                    remoteStream.addTrack(track);
                });
            }

            this.remoteStreams.set(peerId, {remoteStream, peerConnection});
            console.log(this.remoteStreams, 'remote stream new')
            if (this.ui_type === "large") {
                this.app.connection.emit('render-remote-stream-large-request', peerId, remoteStream, peerConnection);
            } else if (this.ui_type === "small") {
                this.app.connection.emit('add-remote-stream-small-request', peerId, remoteStream, peerConnection);
            }


        });



        this.localStream.getTracks().forEach((track) => {
            peerConnection.addTrack(track, this.localStream);
            // console.log('track local ', track)
        });


        peerConnection.addEventListener('connectionstatechange', () => {
            if (peerConnection.connectionState === 'failed' || peerConnection.connectionState === 'disconnected') {

                setTimeout(() => {
                    // console.log('sending offer');
                    this.reconnect(peerId, type);
                }, 10000);

            }
            if (peerConnection.connectionState === "connected") {
                let sound = new Audio('/videocall/audio/enter-call.mp3');
                sound.play();
            }
            // if(peerConnection.connectionState === "disconnected"){

            // }


            this.app.connection.emit('stun-update-connection-message', this.room_code, peerId, peerConnection.connectionState);
        });

        if (type === "offer") {
            this.renegotiate(peerId);
        }

    }

    reconnect(peerId, type) {
        const maxRetries = 2;
        const retryDelay = 10000;

        const attemptReconnect = (currentRetry) => {
            const peerConnection = this.peers.get(peerId);
            if (currentRetry === maxRetries) {
                if (peerConnection && peerConnection.connectionState !== 'connected') {
                    console.log('Reached maximum number of reconnection attempts, giving up');
                    this.removePeerConnection(peerId);
                }
                return;
            }


            if (peerConnection && peerConnection.connectionState === 'connected') {
                console.log('Reconnection successful');
                // remove connection message
                return;
            }

            if (peerConnection && peerConnection.connectionState !== 'connected') {
                this.removePeerConnection(peerId);
                if (type === "offer") {
                    this.createPeerConnection(peerId, 'offer');
                }
            }


            setTimeout(() => {
                console.log(`Reconnection attempt ${currentRetry + 1}/${maxRetries}`);
                attemptReconnect(currentRetry + 1);
            }, retryDelay);
        };

        attemptReconnect(0);
    }

    removePeerConnection(peerId) {
        const peerConnection = this.peers.get(peerId);
        if (peerConnection) {
            peerConnection.close();
            this.peers.delete(peerId);
        }

        let sound = new Audio('/videocall/audio/end-call.mp3');
        sound.play();
        if (this.ui_type === "large") {
            this.app.connection.emit('video-box-remove', peerId, 'disconnection');
        } else if (this.ui_type === "small") {
            // console.log('peer left')
            this.app.connection.emit('audio-box-remove', peerId);

        }


    }

    renegotiate(peerId, retryCount = 0) {
        const maxRetries = 4;
        const retryDelay = 3000;

        const peerConnection = this.peers.get(peerId);
        if (!peerConnection) {
            return;
        }

        // console.log('signalling state, ', peerConnection.signalingState)
        if (peerConnection.signalingState !== 'stable') {
            if (retryCount < maxRetries) {
                console.log(`Signaling state is not stable, will retry in ${retryDelay} ms (attempt ${retryCount + 1}/${maxRetries})`);
                setTimeout(() => {
                    this.renegotiate(peerId, retryCount + 1);
                }, retryDelay);
            } else {
                console.log('Reached maximum number of renegotiation attempts, giving up');
            }
            return;
        }

        const offerOptions = {
            offerToReceiveAudio: true,
            offerToReceiveVideo: true,
        };

        peerConnection.createOffer(offerOptions)
            .then((offer) => {
                return peerConnection.setLocalDescription(offer);
            })
            .then(() => {
                let data = {
                    room_code: this.room_code,
                    type: 'renegotiate-offer',
                    sdp: peerConnection.localDescription.sdp,
                    targetPeerId: peerId
                }
                this.app.connection.emit('stun-send-message-to-server', data);
            })
            .catch((error) => {
                console.error('Error creating offer:', error);
            });

        // Implement renegotiation logic for reconnections and media stream restarts
    }

    join() {
        console.log('joining mesh network');
        this.app.connection.emit('stun-send-message-to-server', { type: 'peer-joined', room_code: this.room_code });
    }

    leave() {
        this.localStream.getTracks().forEach(track => {
            track.stop();
            // console.log(track);
            console.log('stopping track');
        })
        this.peers.forEach((peerConnections, key) => {
            peerConnections.close();
        })

        this.peers = new Map();



        let data = {
            room_code: this.room_code,
            type: 'peer-left',
        }

        this.app.connection.emit('stun-send-message-to-server', data);

    }

    sendSignalingMessage(data) {

    }

    switchUITypeToLarge() {
        this.ui_type = "large";
    }
    switchUITypeToSmall() {
        this.ui_type = "small";
    }

    renderRemoteStreams(){
        // loop over remote stream
        this.remoteStreams.forEach((property, key) => {
            // console.log(property, 'property', key, 'key')
            // console.log(stream, 'stream')
            if (this.ui_type === "large") {
                this.app.connection.emit('render-remote-stream-large-request', key, property.remoteStream, property.peerConnection);
            } else if (this.ui_type === "small") {
                this.app.connection.emit('add-remote-stream-small-request', key, property.remoteStream, property.peerConnection);
            }
        })
    }
}


module.exports = PeerManager;