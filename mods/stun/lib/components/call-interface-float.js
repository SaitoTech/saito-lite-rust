const CallInterfaceFloatTemplate = require("./call-interface-float.template");
const AudioBox = require("./audio-box");
const VideoBox = require("./video-box");

class CallInterfaceFloat {

  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
    this.localStream = null;
    this.audio_boxes = {};
    this.video_boxes = {};
    this.audioEnabled = true;
    this.videoEnabled = (mod.room_obj.ui == "video");

    this.app.connection.on(
      "show-call-interface",
      (videoEnabled, audioEnabled) => {
        console.log("Render Audio Interface");

        try {
          if (document.querySelector("#start-group-video-chat")){
            document.querySelector("#start-group-video-chat").style.display = "none";
          }
        } catch (err) {}

        this.audioEnabled = audioEnabled;
        this.render();
        this.attachEvents();
      }
    );


    this.app.connection.on("add-local-stream-request", (localStream) => {
      this.localStream = localStream;
      this.addStream("local", localStream);
    });

    this.app.connection.on("add-remote-stream-request", (peer, remoteStream) => {
      this.addStream(peer, remoteStream);
    });

    this.app.connection.on("stun-update-connection-message", (peer_id, status) => {
      if (status === "connected") {
        this.startTimer();
      }

      siteMessage(status, 2000);
    });

    this.app.connection.on("remove-peer-box", (peer_id, disconnection) => {
      if (this.audio_boxes[peer_id]?.audio_box) {
        if (this.audio_boxes[peer_id].audio_box.remove) {
          this.audio_boxes[peer_id].audio_box.remove();
          delete this.audio_boxes[peer_id];
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

      console.log("Stun UI");
      console.log(this.mod.room_obj);

      if (!document.getElementById("small-audio-chatbox")){
        this.app.browser.addElementToDom(CallInterfaceFloatTemplate());
      }else{
        this.app.browser.replaceElementById(CallInterfaceFloatTemplate(), "small-audio-chatbox");
      }
  }

  attachEvents() {
    console.log('attaching events')
    
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

    this.app.browser.makeDraggable("small-audio-chatbox", "", true);

  }

  hide() {
    if (document.getElementById("small-audio-chatbox")){
      document.getElementById("small-audio-chatbox").remove();
    }
  }

  disconnect() {
    this.app.connection.emit("stun-disconnect");
    this.audio_boxes = {};
    this.hide(true);
  }

  addStream(peer, remoteStream) {

    if (this.videoEnabled == "video" && peer !== "local") {
      this.createVideoBox(peer, remoteStream);
    }else{
      this.createAudioBox(peer, remoteStream);
    }

  }

  createAudioBox(peer, remoteStream, container = ".image-list") {
    if (!this.audio_boxes[peer]) {
      const audioBox = new AudioBox(this.app, this.mod, peer, container);
      this.audio_boxes[peer] = { audio_box: audioBox, remote_stream: remoteStream };
    }

    this.audio_boxes[peer].audio_box.render(remoteStream);

  }

  createVideoBox(peer, remoteStream, container = ".video-container") {
    if (!this.video_boxes[peer]) {
      const videoBox = new VideoBox(this.app, this.mod, peer, container);
      this.video_boxes[peer] = { video_box: videoBox };
    }
    this.video_boxes[peer].video_box.render(remoteStream);
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
    let timerElement = document.querySelector(".timer .counter");
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

      timerElement.innerHTML = `<span style="color:orangered; font-size: 3rem;" >${hours}:${minutes}:${secs} </span>`;
    };

    this.timer_interval = setInterval(timer, 1000);
    console.log("Start Call Timer");
  }


}

module.exports = CallInterfaceFloat;
