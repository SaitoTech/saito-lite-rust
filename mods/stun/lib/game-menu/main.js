
const saito = require("../../../../lib/saito/saito");
class StunxGameMenu {

  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
    app.connection.on('stun-join-conference-room-with-link', (room_obj) => {
      console.log('app', this.app, 'mod', this.mod)
      this.joinConferenceRoom(app, mod, room_obj)
    })
  }


  async joinConferenceRoom(app, mod, room_obj) {


    // create peer manager and initialize , send an event to stun to initialize
    // this.app.connection.emit('stun-init-peer-manager', localStream, room_code, true)

  }




}


module.exports = StunxGameMenu;


