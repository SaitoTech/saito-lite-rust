const SaitoOverlay = require("../../../../lib/saito/ui/saito-overlay/saito-overlay.js");
const StunLaunchTemplate = require("./call-launch.template.js");
const CallSetting = require("../components/call-setting");
const SaitoLoader = require("../../../../lib/saito/ui/saito-loader/saito-loader.js");

/**
 *
 * This is a splash screen for initiating a Saito Video call
 *
 **/

class CallLaunch {
  constructor(app, mod, container = "") {
    this.app = app;
    this.mod = mod;
    this.container = container;
    this.overlay = new SaitoOverlay(app, mod);
    this.callSetting = new CallSetting(app, this);

    //
    //this looks a lot better if it is in the dom structure
    //
    // this.loader = new SaitoLoader(app, mod, ".stunx-appspace-splash");

    this.room_obj = {};

    // close-preview-window shuts downt the streams in call-settings
    app.connection.on("close-preview-window", () => {
      this.overlay.remove();
      if (document.querySelector(".stun-appspace")) {
        document.querySelector(".stun-appspace").remove();
      }
    });

    app.connection.on("stun-to-join-room", (room_obj) => {
      console.log(room_obj, "stun-to-join-room");
      this.room_obj = room_obj;
      if (document.querySelector("#createRoom")) {
        document.querySelector("#createRoom").textContent = "Join Meeting";
      }
    });

    app.connection.on("stun-remove-loader", () => {
      // this.loader.remove();
    });
  }

  render() {
    if (document.querySelector(".stun-appspace")) {
      return;
    }
    if (this.container === ".saito-overlay") {
      //Should add callback to "hang up the call" if we close the overlay
      this.overlay.show(StunLaunchTemplate(this.app, this.mod), () => {
        this.app.connection.emit("close-preview-window");
      });
    } else if (this.container === "body") {
      this.app.browser.addElementToDom(StunLaunchTemplate(this.app, this.mod));
    }

    //
    // We should be able to toggle our video/audio controls
    // Do not make it a blocking loader
    //

    this.attachEvents(this.app, this.mod);

    // create peer manager and initialize , send an event to stun to initialize
    this.app.connection.emit("stun-init-peer-manager", "large");
    this.callSetting.render();
  }

  attachEvents(app, mod) {
    if (document.getElementById("createRoom")) {
      document.getElementById("createRoom").onclick = (e) => {
        if (this.room_obj.room_code) {
          if (this.mod.isRelayConnected) {
            this.joinRoom();
          } else {
            siteMessage("initializing");
          }
        } else {
          if (this.mod.isRelayConnected) {
            this.createRoom();
          } else {
            siteMessage("Waiting for peer connection");
          }
        }
      };
    }
  }

  async createRoom() {
    // this.loader.render(true);
    const room_code = await this.mod.sendCreateRoomTransaction(null);
    this.room_obj = {
      room_code,
      access_public_key: this.mod.publicKey,
    };
    this.app.connection.emit("stun-peer-manager-update-room-details", this.room_obj);
    this.app.connection.emit("close-preview-window");
    this.app.connection.emit("start-stun-call", false);
    this.app.connection.emit("stun-remove-loader");
    // this.joinRoom();
  }

  joinRoom() {
    if (!this.room_obj.room_code) {
      return;
    }
    this.app.connection.emit("stun-peer-manager-update-room-details", this.room_obj);
    //For myself and call-Settings
    this.app.connection.emit("close-preview-window");
    this.app.connection.emit("start-stun-call", true);
  }

  async createConferenceCall(app, mod, room_code) {}
}

module.exports = CallLaunch;
