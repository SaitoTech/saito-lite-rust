const VideoBox = require("./video-box");
const CallInterfaceVideoTemplate = require("./call-interface-video.template");

const SwitchDisplay = require("../overlays/switch-display");
const Effects = require("../overlays/effects");

class CallInterfaceVideo {
  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
    this.switchDisplay = new SwitchDisplay(app, mod);
    this.effectsMenu = new Effects(app, mod);
    this.users_on_call = 0;
    this.peers = []; //people in the call
    this.localStream;
    this.room_code;

    this.video_boxes = {};

    this.local_container = "expanded-video";
    this.remote_container = "side-videos";
    this.display_mode = "focus";
    this.remote_streams = new Map();
    this.current_speaker = null;
    this.speaker_candidate = null;

    this.app.connection.on("show-call-interface", async (room_code, videoEnabled, audioEnabled) => {
      this.room_code = room_code;

      console.log("Render Video Call Interface");
      //This will render the (full-screen) component
      if (!document.querySelector(".stun-chatbox")) {
        this.render(videoEnabled, audioEnabled);
      }

      this.room_link = this.createRoomLink();

      /* automatically copy invite link to clipboard for first user */
      console.log(this.users_on_call);

      if (this.users_on_call == 1) {
        this.copyInviteLink();
      }

      // create chat group
      await this.createRoomTextChat();
    });

    this.app.connection.on("add-local-stream-request", (localStream) => {
      this.addLocalStream(localStream);
    });

    this.app.connection.on("add-remote-stream-request", (peer, remoteStream) => {
      this.remote_streams.set(peer, remoteStream);
      this.addRemoteStream(peer, remoteStream);
    });

    this.app.connection.on("stun-update-connection-message", (room_code, peer_id, status) => {
      if (room_code !== this.room_code) {
        return;
      }
      let my_pub_key = this.app.wallet.getPublicKey();
      let container;
      if (peer_id === my_pub_key) {
        container = this.local_container;
      }

      this.createVideoBox(peer_id, container);
      if (status === "connecting") {
        this.video_boxes[peer_id].video_box.renderPlaceholder("connecting");
      } else if (status === "connected") {
        this.video_boxes[peer_id].video_box.removeConnectionMessage();
        this.startTimer();
        this.updateImages();
      } else if (status === "disconnected") {
        this.video_boxes[peer_id].video_box.renderPlaceholder("retrying connection");
      }
    });

    this.app.connection.on("remove-peer-box", (peer_id) => {
      if (this.video_boxes[peer_id]?.video_box) {
        if (this.video_boxes[peer_id].video_box?.remove) {
          this.video_boxes[peer_id].video_box.remove(true);
        }
        delete this.video_boxes[peer_id];
        this.updateImages();
      }
    });

    // Change arrangement of video boxes (emitted from SwitchDisplay overlay)
    app.connection.on("stun-switch-view", (newView) => {
      this.display_mode = newView;
      switch (newView) {
        case "gallery":
          this.switchDisplayToGallery();
          break;
        case "focus":
          this.switchDisplayToExpanded();
          break;
        case "presentation":
          this.swicthDisplayToPresentation();
          break;

        default:
          break;
      }
      // if(newView !== "presentation"){}
      siteMessage(`Switched to ${newView} display`, 2000);
    });

    app.connection.on("stun-new-speaker", (peer) => {
      console.log("New Speaker: " + peer);
      document.querySelectorAll(".video-box-container-large").forEach((item) => {
        if (item.id === `stream${peer}`) {
          if (item.classList.contains("speaker")) {
            console.log("Same speaker");
            return;
          }

          if (
            this.display_mode == "speaker" &&
            !item.parentElement.classList.contains("expanded-video")
          ) {
            this.flipDisplay(peer);
          }

          item.classList.add("speaker");
        } else {
          item.classList.remove("speaker");
        }
      });
    });
  }

  render(videoEnabled, audioEnabled) {
    if (!document.querySelector("#stun-chatbox")) {
      this.app.browser.addElementToDom(
        CallInterfaceVideoTemplate(this.mod, videoEnabled, audioEnabled)
      );
    }

    this.attachEvents();
  }

  async createRoomTextChat() {
    let chat_mod = this.app.modules.returnModule("Chat");

    if (!chat_mod) {
      return;
    }

    let cm = chat_mod.respondTo("chat-manager");
    let peer = (await this.app.network.getPeers())[0].publicKey;
    this.chat_group = {
      id: this.room_code,
      members: [peer],
      name: `Chat ${this.room_code}`,
      txs: [],
      unread: 0,
      target_container: `.stun-chatbox .${this.remote_container}`,
    };

    chat_mod.groups.push(this.chat_group);

    //You should be able to just create a Chat Group, but we are duplicating the public chat server
    //so we need this hacky work around
    //this.chat_group = chat_mod.returnOrCreateChatGroupFromMembers([this.app.network.peers[0].peer.publickey], `Chat ${this.room_code}`);
  }

  attachEvents() {
    let add_users = document.querySelector(".add_users_container");
    if (add_users) {
      add_users.addEventListener("click", (e) => {
        this.copyInviteLink();
      });
    }

    document.querySelector(".chat_control").addEventListener("click", (e) => {
      //let chat_target_element = `.stun-chatbox .${this.remote_container}`;

      if (document.querySelector(".chat-static")) {
        //document.querySelector(".chat-static").remove();
        this.app.connection.emit("chat-popup-remove-request", this.chat_group);
      } else {
        this.app.connection.emit("chat-popup-render-request", this.chat_group);
      }
    });

    if (document.querySelector(".effects-control")) {
      document.querySelector(".effects-control").addEventListener("click", (e) => {
        this.effectsMenu.render();
      });
    }

    document.querySelectorAll(".disconnect-control").forEach((item) => {
      item.addEventListener("click", (e) => {
        this.disconnect();
        siteMessage("You have been disconnected", 3000);
      });
    });

    document.querySelectorAll(".audio-control").forEach((item) => {
      item.onclick = () => {
        this.toggleAudio();
      };
    });
    document.querySelectorAll(".display-control").forEach((item) => {
      item.onclick = () => {
        this.switchDisplay.render(this.display_mode);
      };
    });
    document.querySelectorAll(".share-control").forEach((item) => {
      item.onclick = () => {
        this.app.connection.emit("begin-share-screen");
      };
    });
    document.querySelectorAll(".video-control").forEach((item) => {
      item.onclick = () => {
        this.toggleVideo();
      };
    });

    if (!this.mod.browser_active) {
      document.querySelector(".stun-chatbox .minimizer").addEventListener("click", (e) => {
        // fas fa-expand"
        let icon = document.querySelector(".stun-chatbox .minimizer i");
        let chat_box = document.querySelector(".stun-chatbox");

        if (icon.classList.contains("fa-caret-down")) {
          this.app.connection.emit("stun-switch-view", "speaker");
          chat_box.classList.add("minimize");
          icon.classList.remove("fa-caret-down");
          icon.classList.add("fa-expand");
          this.app.browser.makeDraggable("stun-chatbox", "", true);
        } else {
          chat_box.classList.remove("minimize");
          chat_box.style.top = "0";
          chat_box.style.left = "0";
          chat_box.style.width = "";
          chat_box.style.height = "";
          icon.classList.remove("fa-expand");
          icon.classList.add("fa-caret-down");
          this.app.browser.cancelDraggable("stun-chatbox");
        }
      });
    }

    document.querySelector(".large-wrapper").addEventListener("click", (e) => {
      if (this.display_mode == "gallery" || this.display_mode == "presentation") {
        return;
      }
      if (e.target.classList.contains("video-box")) {
        let stream_id = e.target.id;
        if (e.target.parentElement.parentElement.classList.contains(this.local_container)) {
          return;
        } else {
          this.flipDisplay(stream_id);
        }
      }
    });
  }

  flipDisplay(stream_id) {
    console.log("flipDisplay");
    let id = document.querySelector(`.${this.local_container}`).querySelector(".video-box").id;
    this.video_boxes[id].video_box.containerClass = this.remote_container;
    this.video_boxes[id].video_box.rerender();
    this.video_boxes[stream_id].video_box.containerClass = this.local_container;
    this.video_boxes[stream_id].video_box.rerender();
  }

  createRoomLink() {
    let obj = {
      room_code: this.room_code,
    };
    let base64obj = this.app.crypto.stringToBase64(JSON.stringify(obj));

    let url1 = window.location.origin + "/videocall/";

    let orig_url = window.location.origin + window.location.pathname;
    orig_url = `${orig_url}?stun_video_chat=${base64obj}`;
    history.pushState(null, null, orig_url);

    return `${url1}?stun_video_chat=${base64obj}`;
  }

  copyInviteLink() {
    navigator.clipboard.writeText(this.room_link);
    siteMessage("Invite link copied to clipboard", 1500);
  }

  removePeer(peer) {
    this.peers = this.peers.filter((p) => peer !== p);
  }

  disconnect() {
    this.app.connection.emit("stun-disconnect");
    this.video_boxes = {};

    let url = window.location.origin + window.location.pathname;

    setTimeout(() => {
      window.location.href = url;
    }, 2000);
  }

  addRemoteStream(peer, remoteStream) {
    this.createVideoBox(peer);
    this.video_boxes[peer].video_box.render(remoteStream);
    if (!this.peers.includes(peer)) {
      this.peers.push(peer);
    }

    if (this.peers.length === 1) {
      let peer = document.querySelector(`#stream${this.peers[0]}`);
      if (peer) {
        peer.querySelector(".video-box").click();
      }
    }
    console.log(peer, "presentation?");
    if (peer.toLowerCase() === "presentation") {
      // switch mode to presentation
      this.app.connection.emit("stun-switch-view", "presentation");

      this.flipDisplay("presentation");

      // // maximize presentation
      // console.log(peer, "presentation?");
      // if (!peer) return;

      // let peer = document.querySelector(`#stream${peer}}`);
      // console.log(peer, "presentation?");
      // if (peer) {
      //   peer.querySelector(".video-box").click();
      // }
    }
  }

  addLocalStream(localStream) {
    this.createVideoBox("local", this.local_container);
    this.video_boxes["local"].video_box.render(localStream, "large-wrapper");
    this.localStream = localStream;
    this.updateImages();

    // segmentBackground(document.querySelector('#streamlocal video'), document.querySelector('#streamlocal canvas'), 1);
    // applyBlur(7);
  }

  createVideoBox(peer, container = this.remote_container) {
    let isPresentation = false;
    if (peer.toLowerCase() == "presentation") {
      isPresentation = true;
    }
    if (!this.video_boxes[peer]) {
      const videoBox = new VideoBox(this.app, this.mod, peer, container, isPresentation);
      this.video_boxes[peer] = { video_box: videoBox };
    }
  }

  toggleAudio() {
    //Tell PeerManager to adjust streams
    this.app.connection.emit("stun-toggle-audio");

    //Update UI
    try {
      document.querySelector(".audio-control").classList.toggle("disabled");
      document.querySelector(".audio-control i").classList.toggle("fa-microphone-slash");
      document.querySelector(".audio-control i").classList.toggle("fa-microphone");
    } catch (err) {
      console.warn("Stun UI error", err);
    }
  }

  toggleVideo() {
    this.app.connection.emit("stun-toggle-video");

    //Update UI
    try {
      document.querySelector(".video-control").classList.toggle("disabled");
      document.querySelector(".video-control i").classList.toggle("fa-video-slash");
      document.querySelector(".video-control i").classList.toggle("fa-video");
    } catch (err) {
      console.warn("Stun UI error", err);
    }
  }

  updateImages() {
    let images = ``;
    let count = 0;
    for (let i in this.video_boxes) {
      let publickey = i;
      if (i === "local") {
        publickey = this.mod.publicKey;
      }

      let imgsrc = this.app.keychain.returnIdenticon(publickey);
      images += `<img data-id ="${i}" class="saito-identicon" src="${imgsrc}"/>`;
      count++;
    }
    document.querySelector(".users-on-call .image-list").innerHTML = images;
    document.querySelector(".users-on-call .users-on-call-count").innerHTML = count;
    this.users_on_call = count;
  }

  startTimer() {
    if (this.timer_interval) {
      return;
    }
    let timerElement = document.querySelector(".stun-chatbox .counter");
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

      timerElement.innerHTML = `<span style="" >${hours}:${minutes}:${secs} </span>`;
    };

    this.timer_interval = setInterval(timer, 1000);
  }

  stopTimer() {
    clearInterval(this.timer_interval);
    this.timer_interval = null;
  }

  switchDisplayToGallery() {
    this.local_container = "gallery";
    this.remote_container = "gallery";

    document.querySelector(".video-container-large").innerHTML = `<div class="gallery"></div>`;

    this.setDisplayContainers();
  }

  switchDisplayToExpanded() {
    this.local_container = "expanded-video";
    this.remote_container = "side-videos";

    document.querySelector(".video-container-large").innerHTML = `<div class="expanded-video"></div>
    <div class="side-videos"></div>`;

    this.setDisplayContainers();
  }

  swicthDisplayToPresentation() {
    this.local_container = "presentation";
    this.remote_container = "presentation-side-videos";

    document.querySelector(".video-container-large").innerHTML = `<div class="presentation"></div>
    <div class="presentation-side-videos"></div>`;
    this.setDisplayContainers();

    // let peer = document.querySelector(`#stream${peer}}`);
    // if (peer) {
    //   peer.querySelector(".video-box").click();
    // }
  }

  setDisplayContainers() {
    for (let i in this.video_boxes) {
      if (i === "local") {
        this.video_boxes[i].video_box.containerClass = this.local_container;
        this.video_boxes[i].video_box.render(this.localStream);
      } else {
        this.video_boxes[i].video_box.containerClass = this.remote_container;
        this.video_boxes[i].video_box.render(this.remote_streams.get(i));
      }
    }
    this.chat_group.target_container = `.stun-chatbox .${this.remote_container}`;
  }
}

module.exports = CallInterfaceVideo;
