const saito = require("../../../../lib/saito/saito");
class StunxGameMenu {
  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
    this.config = {
      name: "game",
      container: "#game-chat ul",
      stream_container: "chat-manager-small-audio-container",
      onHide: () => {
        document.querySelector(".join-group-video-chat").style.display = "block";
      },
      showMain: false,
    };

    app.connection.on("stun-join-conference-room-with-link", (room_obj) => {
      console.log("app", this.app, "mod", this.mod);
      this.joinConferenceRoom(app, mod, room_obj);
    });

    app.connection.on("game-menu-start-video-call", (recipients) => {
      console.log("initing peer manager");
      // init peer manager
      app.connection.emit("stun-init-peer-manager", "small", this.config);

      console.log(this.config, "config");

      // create a room
      let room_code = app.crypto.generateRandomNumber().substring(0, 6);

      mod.updateGameRoomCode(room_code);

      let stun_mod = app.modules.returnModule("Stun");
      stun_mod.sendCreateRoomTransaction(room_code);

      app.connection.emit("stun-peer-manager-update-room-code", room_code);

      // send the information to the other peers and ask them to join the call
      recipients = recipients.filter((player) => {
        return player !== app.wallet.publicKey;
      });

      // show-small-chat-manager
      app.connection.emit("show-chat-manager-small", false);
      // change ui from start to join
      document.querySelector("#start-group-video-chat").style.display = "none";
      // document.querySelector('#join-group-video-chat').style.display = "block"

      let data = {
        type: "connection-request",
        room_code,
        sender: app.wallet.publicKey,
      };

      stun_mod.sendGameCallMessageToPeers(app, data, recipients);
    });

    app.connection.on("game-menu-join-video-call", (data) => {
      console.log("initing peer manager", data);
      mod.updateGameRoomCode(data.room_code);

      // init peer manager
      app.connection.emit("stun-init-peer-manager", "small", this.config);
      let stun_mod = app.modules.returnModule("Stun");
      app.connection.emit("stun-peer-manager-update-room-code", data.room_code);

      // send the information to the other peers and ask them to join the call
      // show-small-chat-manager
      app.connection.emit("show-chat-manager-small", true);

      document.querySelector("#start-group-video-chat").style.display = "none";
      document.querySelector("#join-group-video-chat").style.display = "none";
    });
  }

  async joinConferenceRoom(app, mod, room_obj) {
    // create peer manager and initialize , send an event to stun to initialize
    // this.app.connection.emit('stun-init-peer-manager', localStream, room_code, true)
  }
}

module.exports = StunxGameMenu;
