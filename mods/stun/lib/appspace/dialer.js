const SaitoOverlay = require("../../../../lib/saito/ui/saito-overlay/saito-overlay.js");
const DialerTemplate = require("./dialer.template.js");
const CallSetting = require("../components/call-setting.js");
const SaitoUser = require("../../../../lib/saito/ui/saito-user/saito-user");

/**
 *
 * This is a splash screen for calling/answering a P2P Stun call
 *
 **/

class Dialer {
  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
    this.overlay = new SaitoOverlay(app, mod);
    this.callSetting = new CallSetting(app, this);
    this.receiver = null;

  }

  render(call_receiver) {
    this.ring_sound = new Audio("/videocall/audio/ring.mp3");
    this.overlay.show(DialerTemplate(this.app, this.mod), ()=> {
      this.app.connection.emit("close-preview-window");
    });

    if (!this.receiver) {
      this.receiver = new SaitoUser(
        this.app,
        this.mod,
        ".stun-minimal-appspace .contact",
        call_receiver
      );
    } else {
      this.receiver.publicKey = call_receiver;
    }

    this.receiver.render();
    this.attachEvents();
  }


  attachEvents() {
    let video_switch = document.getElementById("video_call_switch");
    let call_button = document.getElementById("startcall");

    let recipients = this.receiver.publicKey;

    if (!video_switch || !call_button) {
      console.error("Component not rendered");
      return;
    }

    this.activateOptions();

    call_button.onclick = (e) => {
      let data = Object.assign({}, this.mod.room_obj);

      data.ui = video_switch.checked ? "video" : "voice";

      this.app.connection.emit("relay-send-message", {
        recipients,
        request: "stun-connection-request",
        data,
      });
      this.startRing();
      this.updateMessage("Dialing...");
      this.deactivateOptions();

      this.dialing = setTimeout(() => {
        this.app.connection.emit("relay-send-message", {
          recipients,
          request: "stun-cancel-connection-request",
          data,
        });
        this.stopRing();
        call_button.innerHTML = "Call";
        this.updateMessage("No answer");
        this.attachEvents();
      }, 30000);

      call_button.innerHTML = "Cancel";

      call_button.onclick = (e) => {
        clearTimeout(this.dialing);
        this.app.connection.emit("relay-send-message", {
          recipients,
          request: "stun-cancel-connection-request",
          data,
        });
        this.stopRing();
        this.app.connection.emit("close-preview-window");
        this.overlay.remove();
      };
    };
  }

  startRing() {
    this.ring_sound.play();
  }
  stopRing() {
    this.ring_sound.pause();
  }

  updateMessage(message){
    let div = document.getElementById("stun-phone-notice");
    if (div) {
      div.innerHTML = message;
    }
  }

  activateOptions(){
    let div = document.querySelector(".video_switch");
    if (div) {
      div.classList.remove("deactivated");
    }

    let video_switch = document.getElementById("video_call_switch");    
    video_switch.onchange = (e) => {
      if (video_switch.checked) {
        this.callSetting.render();
      } else {
        this.app.connection.emit("close-preview-window");
      }
    };


  }

  deactivateOptions(){
    let div = document.querySelector(".video_switch");
    div.classList.add("deactivated");

    let video_switch = document.getElementById("video_call_switch");    
    video_switch.onchange = null;
  }


  async establishStunCallWithPeers(ui_type, recipients) {
    // salert("Establishing a connection with your peers...");

    // create a room
    if (!this.mod.room_obj) {
      this.mod.room_obj = {
        room_code: this.mod.createRoomCode(),
        host_public_key: this.mod.publicKey,
      };
    }

    // send the information to the other peers and ask them to join the call
    recipients = recipients.filter((player) => {
      return player !== this.publicKey;
    });

    this.render(this.mod.publicKey, recipients);
  }

  async receiveGameCallMessageToPeers(app, tx) {
    let txmsg = tx.returnMessage();
    let data = tx.msg.data;

    switch (data.type) {
      case "connection-request":
        let call_type = data.ui == "voice" ? "Voice" : "Video";
        this.startRing();
        let result = await sconfirm(`Accept Saito ${call_type} Call from ${data.sender}`);

        if (result === true) {
          // connect
          // send to sender and inform
          let _data = {
            type: "connection-accepted",
            room_code: data.room_code,
            sender: app.wallet.publicKey,
            timestamp: Date.now(),
            ui: data.ui,
          };

          this.sendStunCallMessageToPeers(app, _data, [data.sender]);

          this.room_obj = {
            room_code: data.room_code,
            host_public_key: this.publicKey,
          };

          setTimeout(() => {
            app.connection.emit("start-stun-call");
          }, 2000);
        } else {
          //send to sender to stop connection
          let _data = {
            type: "connection-rejected",
            room_code: data.room_code,
            sender: app.wallet.publicKey,
            timestamp: Date.now(),
          };
          this.sendStunCallMessageToPeers(app, _data, [data.sender]);
        }
        this.stopRing();
        // console.log(result);
        break;

      case "connection-accepted":
        console.log("connection accepted");
        this.stopRing();
        if (document.getElementById("saito-alert")) {
          document
            .getElementById("saito-alert")
            .parentElement.removeChild(document.getElementById("saito-alert"));
        }

        siteMessage(`${data.sender} accepted your call`, 2000);

        if (this.dialing) {
          clearTimeout(this.dialing);
          this.dialing = null;
        }

        this.room_obj = {
          room_code: data.room_code,
          host_public_key: tx.from[0].publicKey,
        };

        this.app.connection.emit("start-stun-call");

        break;
      case "connection-rejected":
        console.log("connection rejected");
        this.stopRing();
        if (document.getElementById("saito-alert")) {
          document
            .getElementById("saito-alert")
            .parentElement.removeChild(document.getElementById("saito-alert"));
        }

        salert(`Call rejected by ${data.sender}`);
        break;
      case "cancel-connection-request":
        // console.log("connection rejected");
        this.stopRing();
        if (document.getElementById("saito-alert")) {
          document
            .getElementById("saito-alert")
            .parentElement.removeChild(document.getElementById("saito-alert"));
        }

        // salert(`Call cancelled by ${data.sender}`);
        break;

      default:
        break;
    }
  }
}

module.exports = Dialer;
