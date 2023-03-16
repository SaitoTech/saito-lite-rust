
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
    let room_code = room_obj.room_code;

    console.log('peer ', 'room_code', room_code);

    const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

    // create peer manager and initialize , send an event to stun to initialize
    this.app.connection.emit('stun-init-peer-manager', localStream, room_code, true)

  }




}


module.exports = StunxGameMenu;


