
const saito = require("../../../../lib/saito/saito");
class StunxGameMenu {

  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
    app.connection.on('stun-join-conference-room-with-link', (room_obj) => {
      console.log('app', this.app, 'mod', this.mod)
      this.joinConferenceRoom(app, mod, room_obj)
    })


    app.connection.on('game-menu-start-video-call', (recipients) => {
      console.log('initing peer manager');
      // init peer manager
      app.connection.emit('stun-init-peer-manager', "small");
      // create a room 
      let room_code = app.crypto.generateRandomNumber().substring(0, 6);

      let stun_mod = app.modules.returnModule('Stun');
      stun_mod.sendCreateRoomTransaction(room_code);
      app.connection.emit('stun-peer-manager-update-room-code', room_code);

      // show-small-chat-manager
      stun_mod.ChatManagerSmall.render();

      // send the information to the other peers and ask them to join the call
       recipients = recipients.filter(player => {
        return player !== app.wallet.returnPublicKey()
      })
      stun_mod.sendGameCallMessageToPeers(app, room_code, recipients);
      // app.connection.emit('join-meeting', thi.to_join_room);
    })

  }


  async joinConferenceRoom(app, mod, room_obj) {


    // create peer manager and initialize , send an event to stun to initialize
    // this.app.connection.emit('stun-init-peer-manager', localStream, room_code, true)

  }




}


module.exports = StunxGameMenu;


