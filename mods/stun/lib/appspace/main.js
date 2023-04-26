const SaitoOverlay = require('../../../../lib/saito/ui/saito-overlay/saito-overlay.js');
const StunAppspaceTemplate = require('./main.template.js');
const SaitoLoader = require('../../../../lib/saito/ui/saito-loader/saito-loader.js');

class StunAppspace {

  constructor(app, mod, container = "") {
    this.app = app;
    this.mod = mod;
    this.container = container;
    this.overlay = new SaitoOverlay(app, mod);
    this.loader = new SaitoLoader(app, mod);
    this.to_join_room = false;


    app.connection.on('stun-create-conference-call', (code) => {
      this.createConferenceCall(app, mod, code)
    })
    app.connection.on('remove-overlay-request', () => {
      this.overlay.remove();
    })

    app.connection.on('stun-show-loader', () => {
      this.loader.render(true);
    })
    app.connection.on('stun-remove-loader', () => {
      console.log('removing loader')
      this.loader.remove()
    })

    app.connection.on('stun-to-join-room', (state, room_code) => {
      this.to_join_room = state;
      this.room_code = room_code
      document.querySelector('#createRoom').textContent = "Join Meeting";
    })

  }

  render() {
    if (document.querySelector('.stun-appspace')) {
      return;
    }
    if (this.container === ".saito-overlay") {
      this.overlay.show(StunAppspaceTemplate(this.app, this.mod))
    } else if (this.container === "body") {
      this.app.browser.addElementToDom(StunAppspaceTemplate(this.app, this.mod))
    }

    this.attachEvents(this.app, this.mod);
    // create peer manager and initialize , send an event to stun to initialize
    this.app.connection.emit('stun-init-peer-manager',"large");
  }

  attachEvents(app, mod) {

    document.body.onclick = ('click', (e) => {
      if (e.target.id === "add-to-listeners-btn") {
        let input = document.querySelector('#listeners-input').value.split(',');
        const listeners = input.map(listener => listener.trim());
        let stun_mod = app.modules.returnModule("Stun");
        stun_mod.addListeners(listeners);
      }


      if (e.target.id === "createRoom") {
        if (this.to_join_room) {
          this.joinRoom(this.room_code)
        } else {
          this.createRoom();
        }

      }
    })

  }


  async createRoom() {
    let room_code = this.app.crypto.generateRandomNumber().substring(0, 6);
    this.mod.sendCreateRoomTransaction(room_code);
    this.app.connection.emit('stun-peer-manager-update-room-code', room_code);
    this.app.connection.emit('join-meeting', this.to_join_room);
  }

  async joinRoom(room_code) {
    this.app.connection.emit('stun-peer-manager-update-room-code', room_code);
    this.app.connection.emit('join-meeting', this.to_join_room);
  }

  async createConferenceCall(app, mod, room_code) {

  }

}


module.exports = StunAppspace;


