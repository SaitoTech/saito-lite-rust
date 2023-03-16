const ChatManagerLarge = require("./chat-manager-large")


class PeerManager {
    constructor(app, mod, localStream, room_code) {
        this.app = app;
        this.mod = mod
        this.localStream = localStream;
        this.peers = new Map();
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


        this.room_code = room_code;


        app.connection.on('stun-event-message', (data) => {
            if (data.room_code !== this.room_code) {
                return;
            }

            if (data.type === 'peer-joined') {
                this.createPeerConnection(data.public_key, 'offer');
            } else if (data.type === 'peer-left') {
                this.removePeerConnection(data.public_key);
            } else {
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

        app.connection.on('stun-toggle-video', () => {
            if (this.videoEnabled === true) {
                this.localStream.getVideoTracks()[0].enabled = false;
                this.app.connection.emit("mute", 'video', 'local');
                try {
                    this.peers.forEach(value => {
                        // for (let i in this.mod.peer_connections) {
                        //     this.mod.peer_connections[i].dc.send(JSON.stringify({ event: "mute", kind: 'video' }))
                        // }
                    })

                } catch (error) {

                }

                this.videoEnabled = false
                document.querySelector('.video_control').classList.remove('fa-video')
                document.querySelector('.video_control').classList.add('fa-video-slash')
            } else {
                this.localStream.getVideoTracks()[0].enabled = true;
                this.app.connection.emit("unmute", 'video', 'local');
                try {
                    // for (let i in this.mod.peer_connections) {
                    //     this.mod.peer_connections[i].dc.send(JSON.stringify({ event: "unmute", kind: 'video' }))
                    // }
                } catch (error) {

                }
                this.videoEnabled = true;
            }
        })
    }


    showChatManager() {
        // emit events to show chatmanager;
        this.app.connection.emit('show-video-chat-request', this.app, this.mod, 'large', 'video', this.room_code);
        this.app.connection.emit('stun-remove-loader')
        this.app.connection.emit('render-local-stream-request', this.localStream, 'large', 'video');
        this.app.connection.emit('remove-overlay-request');
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

        this.localStream.getTracks().forEach((track) => {
            peerConnection.addTrack(track, this.localStream);
        });


        const remoteStream = new MediaStream();
        peerConnection.addEventListener('track', (event) => {
            event.streams[0].getTracks().forEach(track => {
                remoteStream.addTrack(track);
            });

            this.app.connection.emit('add-remote-stream-request', peerId, remoteStream, peerConnection, 'large')

        });

        peerConnection.addEventListener('connectionstatechange', () => {
            if (peerConnection.connectionState === 'failed' || peerConnection.connectionState === 'disconnected') {
                // Renegotiate the connection if the state is failed or disconnected
                this.renegotiate(peerId);
            }

            this.app.connection.emit('stun-update-connection-message', this.room_code, peerId, peerConnection.connectionState);
        });

        if (type === "offer") {
            this.renegotiate(peerId);
        }

    }

    removePeerConnection(peerId) {
        const peerConnection = this.peers.get(peerId);
        if (peerConnection) {
            peerConnection.close();
            this.peers.delete(peerId);
        }

        this.app.connection.emit('video-box-remove', peerId);

    }

    renegotiate(peerId, retryCount = 0) {
        const maxRetries = 4;
        const retryDelay = 3000;

        const peerConnection = this.peers.get(peerId);
        if (!peerConnection) {
            return;
        }

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

        peerConnection.createOffer()
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
        // Send a message to the signaling channel to indicate joining the mesh network
        console.log('joining mesh network');
        this.app.connection.emit('stun-send-message-to-server', { type: 'peer-joined', room_code: this.room_code });
    }

    leave() {
        this.localStream.getTracks().forEach(track => {
            track.stop();
            console.log(track);
            console.log('stopping track');
        })
        this.peers.forEach((peerConnections, key) => {
            peerConnections.close();
        })

        let data = {
            room_code: this.room_code,
            type: 'peer-left',
        }

        this.app.connection.emit('stun-send-message-to-server', data);
    }

    signalingChannel(event, data) {

    }
}


module.exports = PeerManager;