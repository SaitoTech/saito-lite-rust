/**
 * This appears to hold the core code for connecting to peers over stun
 *
 */

const localforage = require("localforage");

class PeerManager {
  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
    this.peers = new Map();
    this.localStream = null; //My Video Feed
    this.remoteStreams = new Map(); //The video of the other parties

    this.videoEnabled = true;
    this.audioEnabled = true;
    this.recording = false;

    this.remain_in_call = true;

    app.connection.on("stun-disconnect", () => {
      this.leave();
    });

    app.connection.on("stun-toggle-video", async () => {
      if (this.videoEnabled === true) {
        if (!this.localStream.getVideoTracks()[0]) return;

        this.localStream.getVideoTracks()[0].enabled = false;
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
        room_code: this.mod.room_obj.room_code,
        type: "toggle-video",
        enabled: this.videoEnabled,
      };

      //this.mod.sendStunMessageToServerTransaction(data);
    });

    app.connection.on("stun-toggle-audio", async () => {
      // if video is enabled
      if (this.audioEnabled === true) {
        this.localStream.getAudioTracks()[0].enabled = false;
        this.audioEnabled = false;
      } else {
        this.localStream.getAudioTracks()[0].enabled = true;
        this.audioEnabled = true;
      }

      let data = {
        room_code: this.mod.room_obj.room_code,
        type: "toggle-audio",
        enabled: this.audioEnabled,
      };

      //this.mod.sendStunMessageToServerTransaction(data);
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
        });
      } catch (err) {
        console.error("Error accessing media devices.", err);
      }
    });

    //Launch the Stun call
    app.connection.on("start-stun-call", async () => {
      console.log("STUN: start-stun-call");

      await this.getLocalMedia();

      //Render the UI component
      this.app.connection.emit("show-call-interface", this.videoEnabled, this.audioEnabled);

      //Plug local stream into UI component
      this.app.connection.emit("add-local-stream-request", this.localStream);

      //
      // The person who set up the call is the "host", and we have to wait for peopel to join us in order to create
      // peer connections, but if we reconnect, or refresh, we have saved in local storage the people in our call
      //
      if (this.mod.room_obj.host_public_key === this.mod.publicKey) {
        if (this.app.options?.stun && !this.mod.room_obj?.ui) {
          console.log("STUN: my peers, ", this.app.options.stun);
          for (peer of this.app.options.stun) {
            if (peer !== this.mod.publicKey) {
              this.mod.sendCallEntryTransaction(peer);
              break;
            }
          }
        }
      } else {
        // send ping transaction
        this.mod.sendCallEntryTransaction();
      }

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
      } else if (kind == "ondisconnect") {
        this.remain_in_call = state;
      }
    });
  }

  handleDataChannelMessage(data) {
    console.log("STUN: Message from data channel:", data);
    switch (data) {
      case "presentation":
        this.trackIsPresentation = true;
        break;
      case "remove-presentation-box":
        this.app.connection.emit("remove-peer-box", "presentation");
        this.app.connection.emit("stun-switch-view", "focus");
      default:
        break;
    }
  }

  async handleSignalingMessage(data) {
    const { type, sdp, iceCandidate, targetPeerId, public_key } = data;

    console.log("Stun Signal Message: " + type, data);

    if (type == "peer-joined") {
      this.createPeerConnection(public_key, true);
      return;
    }

    if (type == "peer-left") {
      console.log("STUN: PEER LEFT");
      this.removePeerConnection(public_key);
      return;
    }

    if (type == "toggle-audio" || type == "toggle-video") {
      app.connection.emit(`peer-${type}-status`, data);
      return;
    }

    let peerConnection = this.peers.get(public_key);

    if (!peerConnection) {
      await this.createPeerConnection(public_key, false);
    }

    if (targetPeerId !== this.mod.publicKey){
      console.warn("Stun offer sent to wrong public key....");
    }

    if (type === "offer") {
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
            room_code: this.mod.room_obj.room_code,
            type: "answer",
            sdp: this.getPeerConnection(public_key).localDescription.sdp,
            targetPeerId: public_key,
            public_key: this.mod.publicKey,
          };
          this.mod.sendStunMessageToPeersTransaction(data, [public_key]);
        })
        .catch((error) => {
          console.error("Error handling offer:", error);
        });

    } else if (type === "answer") {

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
        .addIceCandidate(iceCandidate)
        .catch((error) => {
          console.error("Error adding remote candidate:", error);
        });
    }
  }

  async getLocalMedia() {
    if (this.localStream) {
      return;
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

    if (this.videoEnabled) {
      this.localStream.getVideoTracks()[0].applyConstraints({
        width: { min: 640, /*ideal: 900,*/ max: 1280 },
        height: { min: 400, max: 720 },
        aspectRatio: { ideal: 1.333333 },
      });
      console.log(this.localStream.getVideoTracks()[0].getConstraints());
    }

    this.localStream.getAudioTracks()[0].enabled = this.audioEnabled;
  }

  updatePeers() {
    let _peers = [];
    this.peers.forEach((value, key) => {
      _peers.push(key);
    });

    this.app.options.stun = _peers;

    console.log("My call list: ", _peers);

    this.app.storage.saveOptions();
  }

  async createPeerConnection(peerId, should_offer = false) {
    console.log("STUN: Create Peer Connection with " + peerId);

    // check if peer connection already exists
    const peerConnection = new RTCPeerConnection({
      iceServers: this.mod.servers,
    });

    this.peers.set(peerId, peerConnection);
    this.updatePeers();

    //Make sure you have a local Stream
    if (!this.localStream) {
      await this.getLocalMedia();
    }

    //Attach my media to connection
    this.localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, this.localStream);
    });

    // Implement the creation of a new RTCPeerConnection and its event handlers

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        let data = {
          room_code: this.mod.room_obj.room_code,
          type: "candidate",
          iceCandidate: event.candidate,
          targetPeerId: peerId,
          public_key: this.mod.publicKey,
        };
        this.mod.sendStunMessageToPeersTransaction(data, [peerId]);
      }
    };

    // Receive Remote media
    peerConnection.addEventListener("track", (event) => {
      const remoteStream = new MediaStream();

      // console.log("trackss", event.track, "stream :", event.streams);
      console.log("STUN: another remote stream added", event.track);
      if (this.trackIsPresentation) {
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
        this.app.connection.emit("add-remote-stream-request", peerId, remoteStream);
        this.analyzeAudio(remoteStream, peerId);
      }
    });

    peerConnection.addEventListener("connectionstatechange", () => {
      console.log(`STUN: ${peerId} connectionstatechange -- ` + peerConnection.connectionState);

      if (
        peerConnection.connectionState === "failed" ||
        peerConnection.connectionState === "disconnected"
      ) {
        setTimeout(() => {
          console.log("Attempting Reconnection");
          this.reconnect(peerId, type);
        }, 5000);
      }
      if (peerConnection.connectionState === "connected") {
        let sound = new Audio("/videocall/audio/enter-call.mp3");
        sound.play();
      }

      this.app.connection.emit(
        "stun-update-connection-message",
        peerId,
        peerConnection.connectionState
      );
    });


    if (peerId == this.mod.publicKey || !should_offer) {
      peerConnection.addEventListener("datachannel", (event) => {
        console.log("STUN: datachannel event");

        const receiveChannel = event.channel;
        peerConnection.dc = receiveChannel;

        receiveChannel.onmessage = (event) => {
          this.handleDataChannelMessage(event.data);
        };

        receiveChannel.onopen = (event) => {
          console.log("STUN: Data channel is open");
        };

        receiveChannel.onclose = (event) => {
          console.log("STUN: Data channel is closed");
        };
      });
    } else {
      const dc = peerConnection.createDataChannel("data-channel");
      peerConnection.dc = dc;

      dc.onmessage = (event) => {
        this.handleDataChannelMessage(event.data);
      };

      dc.onopen = (event) => {
        console.log("STUN: Data channel is open");
      };

      dc.onclose = (event) => {
        console.log("STUN: Data channel is closed");
      };


      this.renegotiate(peerId);
    }

  }

  reconnect(peerId, type) {
    const maxRetries = 2;
    const retryDelay = 10000;

    const attemptReconnect = (currentRetry) => {
      const peerConnection = this.peers.get(peerId);

      if (!peerConnection) {
        console.log(`STUN: No peerConnection found for peerId: ${peerId}`);
        return;
      }

      if (peerConnection.connectionState === "connected") {
        console.log("STUN: Reconnection successful");
        return;
      }

      // Remove peer connection if its state is neither "connected" nor "connecting"
      if (
        peerConnection.connectionState !== "connected" &&
        peerConnection.connectionState !== "connecting"
      ) {
        console.log(`STUN: Removing peerConnection with state: ${peerConnection.connectionState}`);
        this.removePeerConnection(peerId);
        if (type === "offer") {
          // this.createPeerConnection(peerId, "offer");
        }
      }

      if (currentRetry === maxRetries) {
        console.log("STUN: Reached maximum number of reconnection attempts, giving up");
        return;
      }

      setTimeout(() => {
        console.log(`STUN: Reconnection attempt ${currentRetry + 1}/${maxRetries}`);
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
      console.log("STUN: peer left");
    }

    this.app.connection.emit("remove-peer-box", peerId);

    this.updatePeers();

    if (this.peers.size < 1 && !this.remain_in_call) {
      siteMessage(`${this.app.keychain.returnUsername(peerId)} hung up`, 2500);
      this.app.connection.emit("stun-disconnect");
    }
  }

  //
  // This is to send an offer (or resend it if the mediastream changes)
  //
  async renegotiate(peerId) {
    const peerConnection = this.peers.get(peerId);

    if (!peerConnection) {
      return;
    }

    console.log(`STUN: sending offer to ${peerId} with peer connection`);

    /*
    ! I think this is in the wrong place !

    const maxRetries = 4;
    const retryDelay = 3000;

    if (peerConnection.signalingState !== "stable") {
      if (retryCount < maxRetries) {
        console.log(
          `STUM: Signaling state is not stable, will retry in ${retryDelay} ms (attempt ${
            retryCount + 1
          }/${maxRetries})`
        );
        setTimeout(() => {
          this.renegotiate(peerId, retryCount + 1);
        }, retryDelay);
      } else {
        console.log("STUN: Reached maximum number of renegotiation attempts, giving up");
      }
      return;
    }*/

    try {
      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await peerConnection.setLocalDescription(offer);

      let data = {
        room_code: this.mod.room_obj.room_code,
        type: "offer",
        sdp: peerConnection.localDescription.sdp,
        targetPeerId: peerId,
        public_key: this.mod.publicKey,
      };

      this.mod.sendStunMessageToPeersTransaction(data, [peerId]);
    } catch (err) {
      console.error("Error creating offer:", err);
    }
  }

  leave() {
    this.localStream.getTracks().forEach((track) => {
      track.stop();
      console.log("STUN: stopping track to leave call");
    });
    let keys = [];
    this.peers.forEach((peerConnections, key) => {
      keys.push(key);
      peerConnections.close();
    });

    this.peers = new Map();

    this.app.options.stun = [];
    this.app.storage.saveOptions();

    if (this.audioStreamAnalysis) {
      clearInterval(this.audioStreamAnalysis);
    }

    let data = {
      room_code: this.mod.room_obj.room_code,
      type: "peer-left",
      public_key: this.mod.publicKey,
    };

    this.mod.sendStunMessageToPeersTransaction(data, keys);
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
    }
    this.audioStreamAnalysis = setInterval(update, 1000);
  }

  async recordCall() {
    localforage.config({
      driver: localforage.INDEXEDDB,
      name: "VideoCall",
      storeName: "keyvaluepairs",
      description: "Video Chunks data store",
    });
    const start_recording = await sconfirm("Are you sure you want to start recording?");
    if (!start_recording) return false;
    this.recording = true;
    this.chunks = [];

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 1280;
    canvas.height = 720;

    const audioContext = new AudioContext();
    const audioDestination = audioContext.createMediaStreamDestination();

    const localVideo = document.createElement("video");
    localVideo.srcObject = this.localStream;
    localVideo.muted = true;
    localVideo.onloadedmetadata = () => localVideo.play();

    const remoteVideos = [];
    Array.from(this.remoteStreams.values()).forEach((c, index) => {
      const remoteVideo = document.createElement("video");
      remoteVideo.srcObject = c.remoteStream;
      remoteVideo.muted = true;
      remoteVideo.onloadedmetadata = () => remoteVideo.play();
      remoteVideos.push(remoteVideo);
    });

    const draw = () => {
      if (!this.recording) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const totalVideos = 1 + remoteVideos.length;

      const cols = Math.ceil(Math.sqrt(totalVideos));
      const rows = Math.ceil(totalVideos / cols);
      const localVideoRatio = localVideo.videoWidth / localVideo.videoHeight;
      const videoWidth = canvas.width / cols;

      let videoHeight;
      if (totalVideos == 2) {
        videoHeight = videoWidth / localVideoRatio;
      } else {
        videoHeight = canvas.height / rows;
      }

      ctx.drawImage(localVideo, 0, 0, videoWidth, videoHeight);

      if (totalVideos === 2) {
        remoteVideos.forEach((remoteVideo, index) => {
          const remoteVideoRatio = remoteVideo.videoWidth / remoteVideo.videoHeight;
          const x = ((index + 1) % cols) * videoWidth;
          let y = Math.floor((index + 1) / cols) * videoHeight;

          const adjustedHeight = videoWidth / remoteVideoRatio;
          y += (videoHeight - adjustedHeight) / 2;

          ctx.drawImage(remoteVideo, x, y, videoWidth, adjustedHeight);
        });
      } else {
        remoteVideos.forEach((remoteVideo, index) => {
          const x = ((index + 1) % cols) * videoWidth;
          const y = Math.floor((index + 1) / cols) * videoHeight;
          ctx.drawImage(remoteVideo, x, y, videoWidth, videoHeight);
        });
      }

      requestAnimationFrame(draw);
    };

    draw();

    [
      this.localStream,
      ...Array.from(this.remoteStreams.values()).map((c) => c.remoteStream),
    ].forEach((stream) => {
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(audioDestination);
    });

    const combinedStream = new MediaStream([
      ...audioDestination.stream.getTracks(),
      ...canvas.captureStream(30).getTracks(),
    ]);

    this.mediaRecorder = new MediaRecorder(combinedStream);

    this.mediaRecorder.start();
    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        this.chunks.push(e.data);
      }
    };

    this.mediaRecorder.onstop = async () => {
      const blob = new Blob(this.chunks, { type: "video/webm" });
      const defaultFileName = "recorded_call.webm";
      const fileName =
        (await sprompt("Please enter a recording name", "recorded_call")) || defaultFileName;

      // Create an object URL for the Blob
      const videoUrl = window.URL.createObjectURL(blob);

      const downloadLink = document.createElement("a");
      document.body.appendChild(downloadLink);
      downloadLink.style = "display: none";
      downloadLink.href = videoUrl;
      downloadLink.download = fileName;
      downloadLink.click();

      window.URL.revokeObjectURL(videoUrl);
      downloadLink.remove();
      // Stop the audio context
      if (audioContext.state !== "closed") {
        audioContext.close();
      }

      // Reset recording flag
      this.recording = false;
    };

    return true;
  }

  stopRecordCall() {
    this.mediaRecorder.stop();
    this.recording = false;
  }
}

module.exports = PeerManager;
