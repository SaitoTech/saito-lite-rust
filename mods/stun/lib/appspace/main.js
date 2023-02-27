const SaitoOverlay = require('../../../../lib/saito/ui/saito-overlay/saito-overlay.js');
const StunAppspaceTemplate = require('./main.template.js');

class StunAppspace {

  constructor(app, mod, container = "") {
    this.app = app;
    this.mod = mod;
    this.container = container;
    this.overlay = new SaitoOverlay(app, mod);

    app.connection.on('join-room-with-code', (code) => {
      this.joinVideoInvite(app, mod, code)
    })
    app.connection.on('remove-overlay-request', () => {
      this.overlay.remove();
    })

  }

  render() {
    this.overlay.show(StunAppspaceTemplate(this.app, this.mod))
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
// legacy room codes
//      if (e.target.id === "joinInvite") {
//        const inviteCode = document.querySelector("#inviteCode").value;
//          this.joinVideoInvite(app, mod, inviteCode.trim());
//      }
      if (e.target.id === "createRoom") {
        this.mod.sendCreateRoomTransaction((app, mod, roomCode) => {
          this.app.connection.emit('join-room-with-code', roomCode);
        });
      }
    })

//    document.querySelector('#inviteCode').addEventListener('keyup', (e) => {
//      let button = document.querySelector('.stunx-appspace-join .saito-button-secondary');
//      button.style.display = "flex"
//      setTimeout(() => {
//        button.style.display = "none"
//      }, 10000)
//    })
  }


  joinVideoInvite(app, mod, room_code) {
    if (!room_code) return siteMessage("Please insert a room code", 5000);
    let sql = `SELECT * FROM rooms WHERE room_code = "${room_code}"`;


    let requestCallback = async (res) => {
      let room = res.rows[0];
      if (!room) {
        console.log('Invite code is invalid');
        return siteMessage("Invite code is invalid");
      }
      if (room.isMaxCapicity) {
        console.log("Room has reached max capacity");
        return siteMessage("Room has reached max capacity");
      }
      if (Date.now() < room.startTime) {
        siteMessage("Video call time is not yet reached", 5000);
        console.log("Video call time is not yet reached");
        return "Video call time is not yet reached";
      }
      let peers_in_room = JSON.parse(room.peers);

      // if(peers_in_room.length === 2) {
      //   return salert("You Can't join this call")
      // }
      const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      mod.setLocalStream(localStream);
      let my_public_key = this.app.wallet.getPublicKey();


      // first to join the room?
      if (peers_in_room.length === 0) {
        // add to the room list and save
        peers_in_room.push(my_public_key);
        let peer_count = 1;
        let is_max_capacity = false;

        const data = {
          peers_in_room: JSON.stringify(peers_in_room),
          peer_count,
          is_max_capacity
        }
        mod.sendUpdateRoomTransaction(room_code, data);
        this.app.connection.emit('show-video-chat-request', app, this, 'large', 'video', room_code);
        this.app.connection.emit('render-local-stream-request', localStream, 'large', 'video');
        this.app.connection.emit('remove-overlay-request')
        siteMessage("You are the only participant in this room", 3000);
        return;

      } else {
        // add to the room list and save
        peers_in_room.push(my_public_key);
        let peer_count = peers_in_room.length;
        let is_max_capacity = false;
        if (peer_count === 4) {
          is_max_capacity = true;
        }

        const data = {
          peers_in_room: JSON.stringify(peers_in_room),
          peer_count,
          is_max_capacity
        }

        mod.sendUpdateRoomTransaction(room_code, data);

        // filter my public key
        peers_in_room = peers_in_room.filter(public_key => public_key !== my_public_key);
        this.app.connection.emit('show-video-chat-request', app, this, 'large', 'video', room_code);
        this.app.connection.emit('render-local-stream-request', localStream, 'large');

        this.app.connection.emit('remove-overlay-request')

        // peers_in_room.forEach(peer => {
        //   this.app.connection.emit('render-remote-stream-placeholder-request', peer, 'large');
        // });
        mod.createMediaConnectionWithPeers(peers_in_room, 'large', "Video", room_code);


      }
    }

    mod.sendPeerDatabaseRequestWithFilter('Stun', sql, requestCallback)
    const stun_mod = app.modules.returnModule('Stun');

    // stunx_mod.sendRequest("message", {}, room_code);
  }

}


module.exports = StunAppspace;


