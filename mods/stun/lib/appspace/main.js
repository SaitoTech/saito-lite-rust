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
    // app.connection.on('join-room-with-code', (code) => {
    //   this.joinVideoInvite(app, mod, code)
    // })

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

  }

  render() {
    if (this.container === ".saito-overlay") {
      this.overlay.show(StunAppspaceTemplate(this.app, this.mod))
    } else if (this.container === "body") {
      this.app.browser.addElementToDom(StunAppspaceTemplate(this.app, this.mod))
    }

    this.attachEvents(this.app, this.mod);
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
        this.createRoom()
      }
    })

  }

  async createRoom() {
    // get local stream;
    const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    // create peer manager and initialize , send an event to stun to initialize
    this.app.emit('stun-init-peer-manager', localStream)

    // create a room code, and update the server about a new room, then add the my public key into that room

    this.mod.sendCreateRoomTransaction();
  }


  async createConferenceCall(app, mod, room_code) {
    console.log('creating conference call');
    // add to the room list and save
    // let peers = [];
    // let peer_count = 0;
    // let is_max_capacity = false;


    // const room = {
    //   peers,
    //   peer_count,
    //   is_max_capacity
    // }

    // this.room = room;

    const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    mod.setLocalStream(localStream);
    let my_public_key = this.app.wallet.returnPublicKey();
    mod.central = true;
    this.app.connection.emit('show-video-chat-request', app, this, 'large', 'video', room_code, my_public_key);
    this.app.connection.emit('stun-remove-loader')
    this.app.connection.emit('render-local-stream-request', localStream, 'large', 'video');
    this.app.connection.emit('remove-overlay-request');
    siteMessage("You are the only participant in this room", 3000);
    return;
  }

}


module.exports = StunAppspace;


