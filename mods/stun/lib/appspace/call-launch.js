const SaitoOverlay = require('../../../../lib/saito/ui/saito-overlay/saito-overlay.js');
const StunAppspaceTemplate = require('./main.template.js');
const ChatSetting = require("../components/chat-setting");

/**
 * 
 * This is a splash screen for initiating a Saito Video call 
 * 
 **/

class StunAppspace {

  constructor(app, mod, container = "") {
    this.app = app;
    this.mod = mod;
    this.container = container;
    this.overlay = new SaitoOverlay(app, mod);
    this.chatSetting = new ChatSetting(app, this);

    this.room_code = null;

    // close-preview-window shuts downt the streams in chat-settings
    app.connection.on('close-preview-window', () => {
      this.overlay.remove();
    })

    app.connection.on('stun-to-join-room', (room_code) => {
      this.room_code = room_code;
      document.querySelector('#createRoom').textContent = "Join Meeting";
    })

  }

  render() {
    if (document.querySelector('.stun-appspace')) {
      return;
    }
    if (this.container === ".saito-overlay") {
      //Should add callback to "hang up the call" if we close the overlay
      this.overlay.show(StunAppspaceTemplate(this.app, this.mod), () => {this.app.connection.emit("close-preview-window");});
    } else if (this.container === "body") {
      this.app.browser.addElementToDom(StunAppspaceTemplate(this.app, this.mod))
    }

    this.attachEvents(this.app, this.mod);
    // create peer manager and initialize , send an event to stun to initialize
    this.app.connection.emit('stun-init-peer-manager',"large");

    this.chatSetting.render();
  }

  attachEvents(app, mod) {

    if (document.getElementById("createRoom")){
      document.getElementById("createRoom").onclick = (e) => {
        if (this.room_code) {
          this.joinRoom()
        } else {
          this.createRoom();
        }
      }
    }
  }


  async createRoom() {
    this.room_code = await this.mod.sendCreateRoomTransaction();    
    this.joinRoom();
  }

  joinRoom() {
    if (!this.room_code){
      return;
    }
    this.app.connection.emit('stun-peer-manager-update-room-code', this.room_code);
    //For myself and Chat-Settings
    this.app.connection.emit('close-preview-window');
    this.app.connection.emit("show-chat-manager");
  }

  async createConferenceCall(app, mod, room_code) {

  }

}


module.exports = StunAppspace;


