/**
 * This appears to hold the core code for connecting to peers over stun
 *
 */

class PeerManager {
  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
    this.peers = new Map();
    this.localStream = null; //My Video Feed
    this.remoteStreams = new Map(); //The video of the other parties

    this.videoEnabled = true;
    this.audioEnabled = true;

    this.app.connection.on("stun-peer-manager-update-room-code", (room_code) => {
      this.room_code = room_code;
    });

    app.connection.on("stun-event-message", (data) => {
      if (data.room_code !== this.room_code) {
        return;
      }

      if (data.type === "peer-joined") {
        let peerConnection = this.peers.get(data.public_key);
        if (!peerConnection) {
          this.createPeerConnection(data.public_key, "offer");
        }
      } else if (data.type === "peer-left") {
        this.removePeerConnection(data.public_key);
      } else if (data.type === "toggle-audio") {
        // console.log(data);
        app.connection.emit("toggle-peer-audio-status", data);
      } else if (data.type === "toggle-video") {
        app.connection.emit("toggle-peer-video-status", data);
      } else {
        let peerConnection = this.peers.get(data.public_key);
        if (!peerConnection) {
          console.log("Create Peer Connection with " + data.public_key);
          this.createPeerConnection(data.public_key);
          peerConnection = this.peers.get(data.public_key);
        }
        console.log("peers consoled", peerConnection);

        if (peerConnection) {
          this.handleSignalingMessage(data);
        }
      }
    });

    app.connection.on("stun-disconnect", () => {
      this.leave();
    });

    app.connection.on("stun-toggle-video", async () => {
      if (this.videoEnabled === true) {
        if (!this.localStream.getVideoTracks()[0]) return;

        this.localStream.getVideoTracks()[0].enabled = false;
        this.app.connection.emit("mute", "video", "local");
        this.videoEnabled = false;
      } else {
        if (!this.localStream.getVideoTracks()[0]) {
          const oldVideoTracks = this.localStream.getVideoTracks();
          if (oldVideoTracks.length > 0) {
            oldVideoTracks.forEach((track) => {
              this.localStream.removeTrack(track);
            });
          }
          // start a video stream;
          let localStream = await navigator.mediaDevices.getUserMedia({ video: true });

          // Add new track to the local stream
          this.app.connection.emit("add-local-stream-request", this.localStream, "video");

          let track = localStream.getVideoTracks()[0];
          this.localStream.addTrack(track);

          this.peers.forEach((peerConnection, key) => {
            const videoSenders = peerConnection
              .getSenders()
              .filter((sender) => sender.track && sender.track.kind === "video");
            if (videoSenders.length > 0) {
              videoSenders.forEach((sender) => {
                sender.replaceTrack(track);
              });
            } else {
              peerConnection.addTrack(track);
            }

            this.renegotiate(key);
          });
        } else {
          this.localStream.getVideoTracks()[0].enabled = true;
        }
        this.videoEnabled = true;
      }

      let data = {
        room_code: this.room_code,
        type: "toggle-video",
        enabled: this.videoEnabled,
      };

      this.mod.sendStunMessageToServerTransaction(data);
    });

    app.connection.on("stun-toggle-audio", async () => {
      // if video is enabled
      if (this.audioEnabled === true) {
        this.localStream.getAudioTracks()[0].enabled = false;
        this.app.connection.emit("mute", "audio", "local");
        this.audioEnabled = false;
      } else {
        this.localStream.getAudioTracks()[0].enabled = true;
        this.audioEnabled = true;
      }

      let data = {
        room_code: this.room_code,
        type: "toggle-audio",
        enabled: this.audioEnabled,
      };
      this.mod.sendStunMessageToServerTransaction(data);
    });

    app.connection.on("begin-share-screen", async () => {
      try {
        let stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        let videoTrack = stream.getVideoTracks()[0];

        videoTrack.onended = () => {
          console.log("Screen sharing stopped by user");
          app.connection.emit("remove-peer-box", "presentation");
          this.app.connection.emit("stun-switch-view", "focus");
          this.peers.forEach((pc, key) => {
            pc.dc.send("remove-presentation-box");
          });
        };
        let remoteStream = new MediaStream();
        remoteStream.addTrack(videoTrack);

        /// emit event to make presentation be the large screen and make presentation mode on
        this.app.connection.emit("add-remote-stream-request", "presentation", remoteStream);
        this.peers.forEach((pc, key) => {
          pc.dc.send("presentation");
          pc.addTrack(videoTrack);

          this.renegotiate(key);
          //console.log("adding presentation video track to peer");
        });
      } catch (err) {
        console.error("Error accessing media devices.", err);
      }
      // let sender = pc.addTrack(videoTrack);
    });

    //Launch the Stun call
    app.connection.on("start-stun-call", async () => {
      console.log("start-stun-call");
      if (this.mod.ui_type == "voice") {
        this.videoEnabled = false;
      }

      //Get my local media
      try {
        this.localStream = await navigator.mediaDevices.getUserMedia({
          video: this.videoEnabled,
          audio: true,
        });
      } catch (err) {
        console.warn("Problem attempting to get User Media", err);
        console.log("Trying without video");

        this.videoEnabled = false;
        this.localStream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: true,
        });
      }

      this.localStream.getAudioTracks()[0].enabled = this.audioEnabled;

      //Render the UI component
      this.app.connection.emit(
        "show-call-interface",
        this.room_code,
        this.videoEnabled,
        this.audioEnabled
      );
      this.app.connection.emit("add-local-stream-request", this.localStream);

      //Send Message to peers
      this.join();

      let sound = new Audio("/videocall/audio/enter-call.mp3");
      sound.play();

      this.analyzeAudio(this.localStream, "local");
    });

    //Chat-Settings saves whether to enter the room with mic/camera on/off
    app.connection.on("update-media-preference", (kind, state) => {
      if (kind === "audio") {
        this.audioEnabled = state;
      } else if (kind === "video") {
        this.videoEnabled = state;
      }
    });
  }

  handleSignalingMessage(data) {
    const { type, sdp, candidate, targetPeerId, public_key } = data;
    if (type === "renegotiate-offer" || type === "offer") {
      //  if (
      //    this.getPeerConnection(public_key).connectionState === "connected" ||
      //   this.getPeerConnection(public_key).remoteDescription !== null ||
      //    this.getPeerConnection(public_key).connectionState === "stable"
      //  ) {
      //    return;
      //  }

      console.log(this.getPeerConnection(public_key), "remote description offer");

      this.getPeerConnection(public_key)
        .setRemoteDescription(new RTCSessionDescription({ type: "offer", sdp }))
        .then(() => {
          return this.getPeerConnection(public_key).createAnswer();
        })
        .then((answer) => {
          return this.getPeerConnection(public_key).setLocalDescription(answer);
        })
        .then(() => {
          let data = {
            room_code: this.room_code,
            type: "renegotiate-answer",
            sdp: this.getPeerConnection(public_key).localDescription.sdp,
            targetPeerId: public_key,
          };
          this.mod.sendStunMessageToServerTransaction(data);
        })
        .catch((error) => {
          console.error("Error handling offer:", error);
        });
      this.peers.set(data.public_key, this.getPeerConnection(public_key));
    } else if (type === "renegotiate-answer" || type === "answer") {
      console.log(
        this.getPeerConnection(public_key),
        this.getPeerConnection(public_key).connectionState,
        "remote description answer"
      );
      //if (
      //  this.getPeerConnection(public_key).connectionState === "connected" ||
      //  this.getPeerConnection(public_key).signalingState === "stable"
      //)
      //  return;
      this.getPeerConnection(public_key)
        .setRemoteDescription(new RTCSessionDescription({ type: "answer", sdp }))
        .then((answer) => {})
        .catch((error) => {
          console.error("Error handling answer:", error);
        });
      this.peers.set(data.public_key, this.getPeerConnection(public_key));
    } else if (type === "candidate") {
      if (this.getPeerConnection(public_key).remoteDescription === null) return;
      this.getPeerConnection(public_key)
        .addIceCandidate(new RTCIceCandidate(candidate))
        .catch((error) => {
          console.error("Error adding remote candidate:", error);
        });
    }
  }

  async createPeerConnection(peerId, type) {
    // check if peer connection already exists
    const peerConnection = new RTCPeerConnection({
      iceServers: this.mod.servers,
    });

    this.peers.set(peerId, peerConnection);

    //Make sure you have a local Stream
    if (!this.localStream) {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: this.videoEnabled,
        audio: true,
      });
    }

    // Implement the creation of a new RTCPeerConnection and its event handlers

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        let data = {
          room_code: this.room_code,
          type: "candidate",
          candidate: event.candidate,
          targetPeerId: peerId,
        };
        this.mod.sendStunMessageToServerTransaction(data);
      }
    };

    const remoteStream = new MediaStream();
    peerConnection.addEventListener("track", (event) => {
      // console.log("trackss", event.track, "stream :", event.streams);
      console.log("another remote stream added", event.track);
      if (this.trackIsPresentation) {
        const remoteStream = new MediaStream();
        remoteStream.addTrack(event.track);
        //this.remoteStreams.set("Presentation", { remoteStream, peerConnection });
        //console.log(this.remoteStreams, "presentation stream");
        this.app.connection.emit("add-remote-stream-request", "presentation", remoteStream);
        setTimeout(() => {
          this.trackIsPresentation = false;
        }, 1000);
      } else {
        if (event.streams.length === 0) {
          remoteStream.addTrack(event.track);
        } else {
          event.streams[0].getTracks().forEach((track) => {
            remoteStream.addTrack(track);
          });
        }

        this.remoteStreams.set(peerId, { remoteStream, peerConnection });
        console.log(this.remoteStreams, "remote stream new");
        this.app.connection.emit("add-remote-stream-request", peerId, remoteStream);

        this.analyzeAudio(remoteStream, peerId);
      }
    });

    this.localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, this.localStream);
      // console.log('track local ', track)
    });

    let dc = peerConnection.createDataChannel("data-channel");
    peerConnection.dc = dc;

    dc.onmessage = (event) => {
      console.log("Message from data channel:", event.data);
      switch (event.data) {
        case "presentation":
          this.trackIsPresentation = true;
          break;
        case "remove-presentation-box":
          this.app.connection.emit("remove-peer-box", "presentation");
          this.app.connection.emit("stun-switch-view", "focus");
        default:
          break;
      }
    };

    dc.onopen = (event) => {
      console.log("Data channel is open");
    };

    dc.onclose = (event) => {
      console.log("Data channel is closed");
    };

    peerConnection.addEventListener("datachannel", (event) => {
      let receiveChannel = event.channel;

      peerConnection.dc = receiveChannel;

      receiveChannel.onmessage = (event) => {
        console.log("Message from data channel:", event.data);
        switch (event.data) {
          case "presentation":
            this.trackIsPresentation = true;
            break;
          case "remove-presentation-box":
            this.app.connection.emit("remove-peer-box", "presentation");
            this.app.connection.emit("stun-switch-view", "focus");
          default:
            break;
        }
      };

      receiveChannel.onopen = (event) => {
        console.log("Data channel is open");
      };

      receiveChannel.onclose = (event) => {
        console.log("Data channel is closed");
      };
    });

    peerConnection.addEventListener("connectionstatechange", () => {
      if (
        peerConnection.connectionState === "failed" ||
        peerConnection.connectionState === "disconnected"
      ) {
        setTimeout(() => {
          // console.log('sending offer');
          this.reconnect(peerId, type);
        }, 10000);
      }
      if (peerConnection.connectionState === "connected") {
        let sound = new Audio("/videocall/audio/enter-call.mp3");
        sound.play();
      }
      // if(peerConnection.connectionState === "disconnected"){

      // }

      this.app.connection.emit(
        "stun-update-connection-message",
        this.room_code,
        peerId,
        peerConnection.connectionState
      );
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
        if (peerConnection && peerConnection.connectionState !== "connected") {
          console.log("Reached maximum number of reconnection attempts, giving up");
          this.removePeerConnection(peerId);
        }
        return;
      }

      if (peerConnection && peerConnection.connectionState === "connected") {
        console.log("Reconnection successful");
        // remove connection message
        return;
      }

      if (peerConnection && peerConnection.connectionState !== "connected") {
        this.removePeerConnection(peerId);
        if (type === "offer") {
          this.createPeerConnection(peerId, "offer");
        }
      }

      setTimeout(() => {
        console.log(`Reconnection attempt ${currentRetry + 1}/${maxRetries}`);
        attemptReconnect(currentRetry + 1);
      }, retryDelay);
    };

    attemptReconnect(0);
  }

  //This can get double processed by PeerTransaction and onConfirmation
  //So need safety checks
  removePeerConnection(peerId) {
    const peerConnection = this.peers.get(peerId);
    if (peerConnection) {
      peerConnection.close();
      this.peers.delete(peerId);

      let sound = new Audio("/videocall/audio/end-call.mp3");
      sound.play();
      console.log("peer left");
    }

    this.app.connection.emit("remove-peer-box", peerId);
  }

  renegotiate(peerId, retryCount = 0) {
    const maxRetries = 4;
    const retryDelay = 3000;

    const peerConnection = this.peers.get(peerId);
    if (!peerConnection) {
      return;
    }

    console.log("renegotiating with pc", peerConnection);
    // console.log('signalling state, ', peerConnection.signalingState)
    if (peerConnection.signalingState !== "stable") {
      if (retryCount < maxRetries) {
        console.log(
          `Signaling state is not stable, will retry in ${retryDelay} ms (attempt ${
            retryCount + 1
          }/${maxRetries})`
        );
        setTimeout(() => {
          this.renegotiate(peerId, retryCount + 1);
        }, retryDelay);
      } else {
        console.log("Reached maximum number of renegotiation attempts, giving up");
      }
      return;
    }

    const offerOptions = {
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    };

    peerConnection
      .createOffer(offerOptions)
      .then((offer) => {
        return peerConnection.setLocalDescription(offer);
      })
      .then(() => {
        let data = {
          room_code: this.room_code,
          type: "renegotiate-offer",
          sdp: peerConnection.localDescription.sdp,
          targetPeerId: peerId,
        };
        this.mod.sendStunMessageToServerTransaction(data);
      })
      .catch((error) => {
        console.error("Error creating offer:", error);
      });

    // Implement renegotiation logic for reconnections and media stream restarts
  }

  join() {
    console.log("joining mesh network");
    this.mod.sendStunMessageToServerTransaction({
      type: "peer-joined",
      room_code: this.room_code,
    });
  }

  leave() {
    this.localStream.getTracks().forEach((track) => {
      track.stop();
      // console.log(track);
      console.log("stopping track");
    });
    this.peers.forEach((peerConnections, key) => {
      peerConnections.close();
    });

    this.peers = new Map();

    if (this.audioStreamAnalysis) {
      clearInterval(this.audioStreamAnalysis);
    }

    let data = {
      room_code: this.room_code,
      type: "peer-left",
    };

    this.mod.sendStunMessageToServerTransaction(data);
  }

  sendSignalingMessage(data) {}

  getPeerConnection(public_key) {
    return this.peers.get(public_key);
  }

  analyzeAudio(stream, peer) {
    let peer_manager_self = this;

    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    source.connect(analyser);
    analyser.fftSize = 512;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    let has_mike = false;
    const threshold = 20;

    function update() {
      //console.log("Update");

      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / bufferLength;

      if (average > threshold && !has_mike) {
        this.current_speaker = peer;

        setTimeout(() => {
          if (peer === this.current_speaker) {
            peer_manager_self.app.connection.emit("stun-new-speaker", peer);
            has_mike = true;
          }
        }, 1000);
      } else if (average <= threshold) {
        has_mike = false;
      }

      //requestAnimationFrame(update);
    }
    this.audioStreamAnalysis = setInterval(update, 1000);
    //requestAnimationFrame(update);
  }
}

module.exports = PeerManager;
