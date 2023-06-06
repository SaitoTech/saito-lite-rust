const ChatManagerSmallExtensionTemplate = require("./chat-manager-small-extension.template");
const AudioBox = require("./audio-box");

class StunChatManagerSmall {
  // peers = {};
  localStream;
  audio_boxes = {};
  audioEnabled = true;

  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
    this.container = "#game-chat ul";

    this.app.connection.on(
      "show-video-chat-request",
      (room_code, videoEnabled, audioEnabled) => {
        console.log("Render Small");
        this.audioEnabled = audioEnabled;
        this.room_code = room_code;
        this.render();
        this.attachEvents(this.app, this.mod);
      }
    );


    this.app.connection.on("add-local-stream-request", (localStream) => {
      this.addLocalStream(localStream);
    });
    this.app.connection.on("add-remote-stream-request", (peer, remoteStream) => {
      this.addRemoteStream(peer, remoteStream);
    });

    this.app.connection.on("stun-update-connection-message", (room_code, peer_id, status) => {
      if (room_code !== this.room_code) {
        return;
      }
      siteMessage(status);
    });

    this.app.connection.on("remove-peer-box", (peer_id, disconnection) => {
      if (this.audio_boxes[peer_id].audio_box) {
        if (this.audio_boxes[peer_id].audio_box.remove) {
          this.audio_boxes[peer_id].audio_box.remove();
          delete this.audio_boxes[peer_id];
          this.updateImages();
        }
      }
    });

    app.connection.on("stun-new-speaker", (peer) => {
      console.log("New Speaker: " + peer);
      document.querySelectorAll(".audio-box").forEach((item) => {
        if (item.id === `audiostream${peer}`) {
          item.classList.add("speaker");
        } else {
          item.classList.remove("speaker");
        }
      });
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


}

module.exports = StunChatManagerSmall;
