/**
 * This appears to hold the core code for connecting to peers over stun
 *
 */

const localforage = require('localforage');

class StreamManager {
  constructor(app, mod, settings) {
    this.app = app;
    this.mod = mod;
    this.localStream = null; //My Video Feed
    this.presentationStream = null;
    this.remoteStreams = new Map(); //The video of the other parties

    this.videoEnabled = true;
    this.audioEnabled = true;
    this.videoSource = null;
    this.audioSource = null;
    this.auto_disconnect = false;
    this.active = true;

    this.terminationEvent = 'onpagehide' in self ? 'pagehide' : 'unload';

    this.updateSettings(settings);

    app.connection.on('stun-toggle-video', async () => {
      // Turn off Video
      if (!this.active) {
        return;
      }

      if (this.videoEnabled === true) {
        if (!this.localStream.getVideoTracks()[0]) return;
        this.localStream.getVideoTracks()[0].enabled = false;
        this.videoEnabled = false;
      } else {
        // Turn on Video

        this.videoEnabled = true;

        if (!this.localStream.getVideoTracks()?.length) {
          try {
            const newLocalStream = await navigator.mediaDevices.getUserMedia(
              this.returnConstraints(true)
            );

            const videoTrack = newLocalStream.getVideoTracks()[0];
            this.localStream.addTrack(videoTrack);

            // Add new track to the local stream
            this.app.connection.emit(
              'add-local-stream-request',
              this.localStream
            );

            this.mod.stun.peers.forEach((peerConnection, key) => {
              console.log('Attach new video to: ' + key);
              if (this.mod.room_obj.call_peers.includes(key)) {
                const videoSenders = peerConnection
                  .getSenders()
                  .filter(
                    (sender) => sender.track && sender.track.kind === 'video'
                  );
                if (videoSenders.length > 0) {
                  videoSenders.forEach((sender) => {
                    sender.replaceTrack(videoTrack);
                  });
                } else {
                  peerConnection.addTrack(videoTrack);
                }
              }
            });
          } catch (err) {
            console.error(err);
          }
        } else {
          this.localStream.getVideoTracks()[0].enabled = true;
        }
      }

      let data = {
        enabled: this.videoEnabled,
        public_key: this.mod.publicKey
      };

      this.mod.sendOffChainMessage('toggle-video', data);
    });

    app.connection.on('stun-toggle-audio', async () => {
      if (!this.active) {
        return;
      }

      this.audioEnabled = !this.audioEnabled;

      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = this.audioEnabled;
      });

      let data = {
        public_key: this.mod.publicKey,
        enabled: this.audioEnabled
      };

      this.app.connection.emit('peer-toggle-audio-status', {
        enabled: this.audioEnabled,
        public_key: 'local'
      });

      this.mod.sendOffChainMessage('toggle-audio', data);
    });

    app.connection.on('begin-share-screen', async () => {
      if (!this.active) {
        return;
      }

      try {
        this.presentationStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            displaySurface: 'window'
          },
          audio: true,
          preferCurrentTab: false,
          selfBrowserSurface: 'exclude',
          surfaceSwitching: 'include',
          monitorTypeSurfaces: 'exclude',
          systemAudio: 'include',
        });
        this.presentationStream.getVideoTracks()[0].onended = this.endPresentation.bind(this);

        this.mod.screen_share = true;

        await this.mod.sendOffChainMessage('screen-share-start', {});

        /// emit event to make presentation be the large screen and make presentation mode on
        this.app.connection.emit(
          'add-remote-stream-request',
          'presentation',
          this.presentationStream
        );

        console.log(
          'Share screen with friends: ',
          this.mod.room_obj.call_peers,
          this.mod.stun.peers
        );
        this.mod.stun.peers.forEach((pc, key) => {
          console.log(key);
          if (this.mod.room_obj.call_peers.includes(key)) {
            console.log('Add Track');
            for (let track of this.presentationStream.getTracks()) {
              pc.addTrack(track);
            }
          }
        });

        this.app.connection.emit('toggle-screen-share-label', true);
      } catch (err) {
        console.error('Error accessing media devices.', err);
      }
    });

    app.connection.on('stop-share-screen', () => {
      if (!this.active) {
        return;
      }
      this.endPresentation();
      this.app.connection.emit('toggle-screen-share-label', false);
    });

    app.connection.on('stun-connection-connected', (peerId) => {
      if (!this.active) {
        return;
      }

      console.log(
        'stun-connection-connected',
        this.active,
        this.mod.room_obj,
        JSON.stringify(this.mod.room_obj.call_peers)
      );

      if (
        !this.mod?.room_obj ||
        !this.mod.room_obj.call_peers.includes(peerId)
      ) {
        return;
      }

      let pc = this.mod.stun.peers.get(peerId);
      if (pc.firstConnect) {
        let sound = new Audio('/saito/sound/Polite.mp3');
        sound.play();
        pc.firstConnect = false;
      }

      this.mod.sendOffChainMessage('toggle-audio', {
        public_key: this.mod.publicKey,
        enabled: this.audioEnabled
      });

      this.mod.sendOffChainMessage('toggle-video', {
        public_key: this.mod.publicKey,
        enabled: this.videoEnabled
      });
    });


    // app.connection.on(
    //   'stun-update-connection-message',
    //   (peerId, connectionState) => {
    //     if (this.active) {
    //       this.broadcastPeerList();
    //     }
    //   }
    // );

    app.connection.on('remove-remote-stream', peerId => {
      this.removePeer(peerId, "was kicked out")
    })

    app.connection.on('stun-track-event', (peerId, event) => {
      if (!this.active) {
        return;
      }

      //
      // Note: This happens twice because audio and video are added separately as mediaTracks...
      //

      const remoteStream = new MediaStream();
      console.log('STUN: remote stream added for', peerId, event.track);

      if (peerId == this.mod.screen_share) {
        console.log('Expecting presentation stream');
        remoteStream.addTrack(event.track);
        this.app.connection.emit(
          'add-remote-stream-request',
          'presentation',
          remoteStream
        );
      } else {
        if (event.streams.length === 0) {
          console.log('Use track');
          remoteStream.addTrack(event.track);
        } else {
          console.log('Use stream', event.streams);
          event.streams[0].getTracks().forEach((track) => {
            remoteStream.addTrack(track);
          });
        }

        this.remoteStreams.set(peerId, {
          remoteStream
        });
        this.app.connection.emit(
          'add-remote-stream-request',
          peerId,
          remoteStream
        );

        if (remoteStream.getAudioTracks()?.length) {
          this.analyzeAudio(remoteStream, peerId);
        }
      }
    });

    //Launch the Stun call
    app.connection.on('start-stun-call', async () => {
      if (!this.active) {
        return;
      }

      window.addEventListener(
        this.terminationEvent,
        this.visibilityChange.bind(this)
      );
      window.addEventListener('beforeunload', this.beforeUnloadHandler);
      if (this.app.browser.isMobileBrowser()) {
        document.addEventListener(
          'visibilitychange',
          this.visibilityChange.bind(this)
        );
      }

      console.log(
        'STUN: start-stun-call',
        JSON.parse(JSON.stringify(this.mod.room_obj))
      );
      this.firstConnect = true;

      //Render the UI component
      this.app.connection.emit(
        'show-call-interface',
        this.videoEnabled,
        this.audioEnabled
      );

      await this.getLocalMedia();

      //
      // The person who set up the call is the "host", and we have to wait for peopel to join us in order to create
      // peer connections, but if we reconnect, or refresh, we have saved in local storage the people in our call
      //
      if (this.mod.room_obj?.scheduled === false) {
        if (this.mod.room_obj?.host_public_key === this.mod.publicKey) {
          //
          // Not direct calling!
          //
          if (!this.mod.room_obj?.ui) {
            console.log('STUN HOST: my peers, ', this.mod.room_obj.call_peers);
            for (peer of this.mod.room_obj.call_peers) {
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
      } else {
        let call_id = this.mod.room_obj.call_id
        // this.app.keychain.addWatchedPublicKey(call_id);
        // this.app.keychain.addKey(call_id, { identifier: call_id });
        // console.log('watched public key', this.mod.room_obj)
       
        let call_link = this.mod.generateCallLink(this.mod.room_obj)
        this.mod.sendBroadcastPresenceTransaction(call_id, call_link)
      }


      let sound = new Audio('/saito/sound/Calm.mp3');
      sound.play();

      this.analyzeAudio(this.localStream, 'local');
    });

    app.connection.on(
      'stun-new-peer-connection',
      async (publicKey, peerConnection) => {
        console.log
        if (!this.active) {
          return;
        }

        console.log('New Stun peer connection with ' + publicKey);
        console.log(this.mod.room_obj.call_peers);
        if (this.mod.room_obj.call_peers.includes(publicKey)) {
          peerConnection.firstConnect = true;

          console.log('Attach my audio/video!');
          await this.getLocalMedia();
          this.localStream.getTracks().forEach((track) => {
            peerConnection.addTrack(track, this.localStream);
          });
        }
      }
    );

    app.connection.on('stun-disconnect', () => {
      if (!this.active) {
        return;
      }

      this.leaveCall();
    });
  }

  updateSettings(settings) {
    if (settings?.video) {
      this.videoEnabled = true;
      if (settings.video !== true) {
        this.videoSource = settings.video;
      }
    } else {
      this.videoEnabled = false;
    }

    if (settings?.audio) {
      this.audioEnabled = true;
      if (settings.audio !== true) {
        this.audioSource = settings.audio;
      }
    } else {
      this.audioEnabled = false;
    }

    this.auto_disconnect = settings?.auto_disconnect;
  }

  returnConstraints(onlyVideo = false) {
    let constraints = {};

    if (this.videoSource) {
      constraints.video = { deviceId: this.videoSource };
    } else if (this.videoEnabled) {
      constraints.video = true;
    } else {
      constraints.video = false;
    }

    if (!onlyVideo) {
      if (this.audioSource) {
        constraints.audio = { deviceId: this.audioSource };
      } else {
        constraints.audio = true;
      }
    }

    return constraints;
  }

  async getLocalMedia() {

    if (this.localStream) {
      let shouldReturn = true;
      this.localStream.getTracks().forEach((track) => {
        if (track.readyState === 'ended') {
          console.log("Track ready state is ended, reacquiring media...");
          shouldReturn = false;
        }
      });
      if (shouldReturn) return; // If none of the tracks have ended, return early
    }
  

    console.log(this.videoSource, this.audioSource);

    let c = this.returnConstraints();

    //Get my local media
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(c);
  
    } catch (err) {
      console.warn('Problem attempting to get User Media', err);
      console.log('Trying without video');

      this.videoEnabled = false;
      c.video = false;

      this.localStream = await navigator.mediaDevices.getUserMedia(c);
    }

    if (this.videoEnabled) {
      this.localStream.getVideoTracks().forEach((track) => {
        track.applyConstraints({
          width: { min: 640, /*ideal: 900,*/ max: 1280 },
          height: { min: 400, max: 720 },
          aspectRatio: { ideal: 1.333333 }
        });
      });
    }

    this.localStream.getAudioTracks().forEach((track) => {
      track.enabled = this.audioEnabled;
    });

    //Plug local stream into UI component
    this.app.connection.emit('add-local-stream-request', this.localStream);
  }

  removePeer(peer, message = "left the meeting") {
    this.remoteStreams.delete(peer);

    if (this.auto_disconnect) {
      siteMessage(`${this.app.keychain.returnUsername(peer)} hung up`, 2500);
      this.app.connection.emit('stun-disconnect');
    } else {
      siteMessage(
        `${this.app.keychain.returnUsername(peer)} ${message}`,
        2500
      );
    }

    let sound = new Audio('/saito/sound/Sharp.mp3');
    sound.play();

    this.broadcastPeerList();
  }

  async leaveCall() {
    console.log('STUN: Hanging up...');

    window.removeEventListener('beforeunload', this.beforeUnloadHandler);
    window.removeEventListener(
      this.terminationEvent,
      this.visibilityChange.bind(this)
    );
    if (this.app.browser.isMobileBrowser()) {
      document.removeEventListener(
        'visibilitychange',
        this.visibilityChange.bind(this)
      );
    }

    this.endPresentation();

    await this.mod.sendCallDisconnectTransaction();

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        track.stop();
        console.log('STUN: stopping track to leave call');
      });
    }

    this.localStream = null; //My Video Feed

    this.app.connection.emit('reset-stun');

    //
    // Reset parameters
    //
    this.videoEnabled = true;
    this.audioEnabled = true;
    this.auto_disconnect = false;
    this.active = false;

    if (this.audioStreamAnalysis) {
      clearInterval(this.audioStreamAnalysis);
      this.audioStreamAnalysis = null;
    }

    console.log('STUN: Finished hanging up...');
    let sound = new Audio('/saito/sound/Sharp.mp3');
    sound.play();
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
            peer_manager_self.app.connection.emit('stun-new-speaker', peer);
            has_mike = true;
          }
        }, 1000);
      } else if (average <= threshold) {
        has_mike = false;
      }
    }
    this.audioStreamAnalysis = setInterval(update, 1000);
  }

  endPresentation() {
    if (this.mod.screen_share) {
      console.log('Screen sharing stopped by user');
      this.app.connection.emit('remove-peer-box', 'presentation');
      this.app.connection.emit('stun-switch-view', this.app.options.stun.settings?.layout || this.mod.layout);
      this.mod.screen_share = false;

      this.mod.sendOffChainMessage('screen-share-stop');
    }

    if (this.presentationStream) {
      this.presentationStream.getTracks().forEach((track) => track.stop());
      this.presentationStream = null;
    }

  }

  broadcastPeerList() {
    let peer_list = {};

    this.mod.stun.peers.forEach((pc, address) => {
      if (this.mod.room_obj.call_peers.includes(address)) {
        peer_list[address] = pc.connectionState;
      }
    });

    this.mod.sendOffChainMessage('broadcast-call-list', peer_list);
  }

  beforeUnloadHandler(event) {
    event.preventDefault();
    event.returnValue = true;
  }

  visibilityChange() {
    console.log('visibilitychange triggered');
    this.leaveCall();
  }
}

module.exports = StreamManager;
