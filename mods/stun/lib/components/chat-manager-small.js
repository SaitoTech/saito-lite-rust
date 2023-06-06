const ChatManagerSmallExtensionTemplate = require("./chat-manager-small-extension.template");
const AudioBox = require("./audio-box");

class StunChatManagerSmall {
  // peers = {};
  localStream;
  video_boxes = {};
  audio_boxes = {};
  audioEnabled = true;

  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
    this.container = "#game-chat ul";

    this.app.connection.on(
      "show-video-chat-small-request",
      (room_code, videoEnabled, audioEnabled) => {
        this.audioEnabled = audioEnabled;
        this.room_code = room_code;
        this.show(this.app, this.mod);
        // this.updateRoomLink();
      }
    );
    this.app.connection.on("remove-video-chat-small-request", (completely) => {
      this.hide(completely);
    });

    this.app.connection.on("add-local-stream-small-request", (localStream) => {
      this.addLocalStream(localStream);
    });
    this.app.connection.on("add-remote-stream-small-request", (peer, remoteStream) => {
      this.addRemoteStream(peer, remoteStream);
    });


    this.app.connection.on("change-connection-state-request", (peer, state, ui_type, call_type) => {
      this.updateConnectionState(peer, state, call_type);
    });

    this.app.connection.on("audio-box-remove", (peer_id, disconnection) => {
      if (this.audio_boxes[peer_id].audio_box) {
        if (this.audio_boxes[peer_id].audio_box.remove) {
          this.audio_boxes[peer_id].audio_box.remove();
          delete this.audio_boxes[peer_id];
          this.updateImages();
        }
      }
    });
  }

  render() {
    if (!document.querySelector(".chat-manager-small-extension")) {
      this.app.browser.addElementToSelector(ChatManagerSmallExtensionTemplate(), this.container);
    } 
  }

  attachEvents(app, mod) {
    console.log('attaching events')
    const videoCallComponent = document.getElementById("chat-manager-small");
    const expandBtn = document.getElementById("expand-btn");
    if (expandBtn) {
      expandBtn.addEventListener("click", () => {
        videoCallComponent.classList.toggle("expanded");
        if (videoCallComponent.classList.contains("expanded")) {
          // setAutoCollapse();
        }
      });
    }

    // function setAutoCollapse() {
    //     setTimeout(() => {
    //         // videoCallComponent.classList.remove('expanded');
    //     }, 3000);
    // }

    document.querySelectorAll(".disconnect-control").forEach((item) => {
      item.onclick = () => {
        this.disconnect();
      };
    });

    document.querySelectorAll(".audio-control").forEach((item) => {
      item.onclick = () => {
        this.toggleAudio();
      };
    });
  }

  show(app, mod) {
    this.render();
    this.attachEvents(app, mod);
  }

  hide(completely = false) {
    try{
      document.querySelectorAll(".chat-manager-small-extension").forEach((item) => {
        item.remove();
      });

      if (completely) {
        document.querySelector("#start-group-video-chat").style.display = "block";
      }
    }catch(err){

    }
  }

  disconnect() {
    this.app.connection.emit("stun-disconnect");
    this.video_boxes = {};
    this.audio_boxes = {};
    this.hide(true);
  }

  addLocalStream(stream) {
    this.localStream = stream;
  }

  addRemoteStream(peer, remoteStream) {
    /// chat-manager-small-audio-container
    let container = "chat-manager-small-audio-container";

    if (!this.audio_boxes[peer]) {
      const audioBox = new AudioBox(this.app, this.mod, peer, container);
      this.audio_boxes[peer] = { audio_box: audioBox, remote_stream: remoteStream };
    }

    this.audio_boxes[peer].audio_box.render(remoteStream);
    this.updateImages();

    this.analyzeAudio(remoteStream, peer);

    this.attachEvents(this.app, this.mod)
  }

  createAudioBox(peer, remoteStream, container) {
    
  }

  updateImages() {
    let images = ``;
    let count = 0;
    console.log(this.audio_boxes);
    for (let i in this.audio_boxes) {
      if (i === "local") {
        let publickey = this.app.wallet.returnPublicKey();
        let imgsrc = this.app.keychain.returnIdenticon(publickey);
        if (
          !document.querySelector(`#audiostream${publickey}`).querySelector(`#image${publickey}`)
        ) {
          document
            .querySelector(`#audiostream${publickey}`)
            .insertAdjacentHTML(
              "beforeend",
              `<img id ="image${publickey}" class="saito-identicon" src="${imgsrc}"/>`
            );
        }
      } else {
        let imgsrc = this.app.keychain.returnIdenticon(i);
        if (!document.querySelector(`#audiostream${i}`).querySelector(`#image${i}`)) {
          document
            .querySelector(`#audiostream${i}`)
            .insertAdjacentHTML(
              "beforeend",
              `<img id ="image${i}" class="saito-identicon" src="${imgsrc}"/>`
            );
        }
      }
      count++;
    }
    // document.querySelector('.stun-chatbox .image-list').innerHTML = images;
    // document.querySelector('.stun-chatbox .users-on-call-count').innerHTML = count
  }

  updateConnectionState(peer, state) {
    try {
      console.log(state, this.video_boxes[peer].video_box);
      if (!this.video_boxes[peer].video_box) {
        return;
      }
      this.video_boxes[peer].video_box.handleConnectionStateChange(state);

      switch (state) {
        case "disconnected":
          this.disconnect();
          console.log("video boxes: after ", this.video_boxes);
          break;
        case "connected":
          // start counter
          this.startTimer();
          this.addImages();
          break;

        default:
          break;
      }
    } catch (error) {
      console.log(error);
    }
  }

  toggleAudio() {
    console.log("toggling audio");
    if (this.audioEnabled === true) {
      this.localStream.getAudioTracks()[0].enabled = false;
      this.audioEnabled = false;
      document.querySelectorAll(".audio-control i").forEach((item) => {
        item.classList.remove("fa-microphone");
        item.classList.add("fa-microphone-slash");
      });
    } else {
      this.localStream.getAudioTracks()[0].enabled = true;
      this.audioEnabled = true;
      document.querySelectorAll(".audio-control i").forEach((item) => {
        item.classList.remove("fa-microphone-slash");
        item.classList.add("fa-microphone");
      });
    }
  }

  startTimer() {
    if (this.timer_interval) {
      return;
    }
    let timerElement = document.querySelector(".small-video-chatbox .counter");
    let seconds = 0;

    const timer = () => {
      seconds++;

      // Get hours
      let hours = Math.floor(seconds / 3600);
      // Get minutes
      let minutes = Math.floor((seconds - hours * 3600) / 60);
      // Get seconds
      let secs = Math.floor(seconds % 60);

      if (hours < 10) {
        hours = `0${hours}`;
      }
      if (minutes < 10) {
        minutes = `0${minutes}`;
      }
      if (secs < 10) {
        secs = `0${secs}`;
      }

      timerElement.innerHTML = `<sapn style="color:orangered; font-size: 3rem;" >${hours}:${minutes}:${secs} </sapn>`;
    };

    this.timer_interval = setInterval(timer, 1000);
  }

  addImages() {
    let images = ``;
    let count = 0;
    console.log("video boxe3s ", this.video_boxes);
    for (let i in this.video_boxes) {
      if (i === "local") {
        let publickey = this.app.wallet.returnPublicKey();
        let imgsrc = this.app.keychain.returnIdenticon(publickey);
        images += `<img data-id="${publickey}" src="${imgsrc}"/>`;
      } else {
        let imgsrc = this.app.keychain.returnIdenticon(i);
        images += `<img data-id ="${i}" class="saito-identicon" src="${imgsrc}"/>`;
      }
      count++;
    }
    document.querySelector(".small-video-chatbox .image-list").innerHTML = images;
    document.querySelector(".users-on-call-count").innerHTML = count;
  }

  /*
   Should move this an a same named, similar function in chat-manager-large to a library and have them emit an event to update the DOM???
  */
  analyzeAudio(stream, peer) {
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    source.connect(analyser);
    analyser.fftSize = 512;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    let speaking = false;
    const threshold = 20;

    function update() {
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / bufferLength;
      
      let audio = document.querySelector(`#audiostream${peer}`);
      
      if (!audio) { return;}

      if (average > threshold && !speaking) {
        audio.classList.add("speaking");
        speaking = true;
      } else if (average <= threshold && speaking) {
        audio.classList.remove("speaking");
        speaking = false;
      }

      requestAnimationFrame(update);
    }

    update();
  }
}

module.exports = StunChatManagerSmall;
