
const saito = require("../../../../lib/saito/saito");
class StunxGameMenu {

  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
    app.connection.on('stun-join-conference-room-with-link', (room_obj) => {
      console.log('app', this.app, 'mod', this.mod)
      this.mod.createRoom();
      this.joinConferenceRoom(app, mod, room_obj)
    })
  }


  async joinConferenceRoom(app, mod, room_obj) {
    let room_code = room_obj.room_id;
    let peer = room_obj.public_keys[0];

    console.log('peer ', peer, 'room_code', room_code)

    const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    this.mod.setLocalStream(localStream);
    this.mod.room_code = room_code;

    {
      this.app.connection.emit('show-video-chat-request', app, this, 'large', 'video', room_code, peer);
      this.app.connection.emit('stun-remove-loader');
      this.app.connection.emit('render-local-stream-request', localStream, 'large');
      this.app.connection.emit('remove-overlay-request')

      // this.mod.createMediaChannelConnectionWithPeers([peer], 'large', "Video", room_code);
      // ping peer to know if it's available
      let command = {
        name: 'PING',
        id: this.mod.commands.length,
        status: null,
        room_code: mod.room_code,
        callback: () => {
          this.mod.createMediaChannelConnectionWithPeers([peer], 'large', 'video', this.mod.room_code, false);
        }
      }
      this.mod.saveCommand(command);
      let my_pub_key = this.app.wallet.returnPublicKey();
      this.mod.sendCommandToPeerTransaction(peer, my_pub_key, command);



      const checkPingInterval = setInterval(() => {
        console.log('checking for ping back from peer');
        this.mod.commands.forEach(c => {
          if (c.id === command.id) {
            if (command.status === "success") {
              command.callback();
              console.log('got success ping back from peer')
              clearInterval(checkPingInterval);
              this.mod.deleteCommand(command);

            } else if (command.status === "failed") {
              console.log('got failed ping back from peer')
              salert("invite link expired");
              clearInterval(checkPingInterval);
              this.mod.deleteCommand(command);
            } else {
              salert("invite link expired");
              clearInterval(checkPingInterval);
              this.mod.deleteCommand(command);
            }
          }
        })
      }, 2000)




    }


  }

  // async joinInviteWithLink(app, room_obj){
  //     let room_code = room_obj.room_id
  //     let peers_in_room = room_obj.public_keys

  //     console.log(room_code)
  //     if (!room_code) return siteMessage("Please insert a room code", 5000);
  //     let sql = `SELECT * FROM rooms WHERE room_code = "${room_code}"`;
  //     const mod = app.modules.returnModule('Stun');

  //     let requestCallback = async (res) => {

  //       let room = res.rows[0];
  //       console.log(res, 'res')
  //       if (!room) {
  //         console.log('Invite code is invalid');
  //         return siteMessage("Invite code is invalid");
  //       }
  //       if (room.isMaxCapicity) {
  //         console.log("Room has reached max capacity");
  //         return siteMessage("Room has reached max capacity");
  //       }
  //       if (Date.now() < room.startTime) {
  //         siteMessage("Video call time is not yet reached", 5000);
  //         console.log("Video call time is not yet reached");
  //         return "Video call time is not yet reached";
  //       }

  //      console.log('room', room.peers)
  //       let peers_in_room =  JSON.parse(room.peers);
  //       let my_public_key = this.app.wallet.returnPublicKey();

  //       // if(peers_in_room.length === 2 ) {
  //       //   if(!peers_in_room.includes(my_public_key)){
  //       //       return salert("You can't join this call, max allowed exceeded")
  //       //   }
  //       // }

  //       const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  //       mod.setLocalStream(localStream);


  //       // first to join the room?
  //      {
  //         // add to the room list and save
  //         if(!peers_in_room.includes(my_public_key)){
  //             peers_in_room.push(my_public_key);
  //         }
  //         let peer_count = peers_in_room.length;
  //         // console.log('peer count', peer_count)
  //         let is_max_capacity = false;
  //         if (peer_count === 4) {
  //           is_max_capacity = true;
  //         }
  //         const data = {
  //           peers_in_room: JSON.stringify(peers_in_room),
  //           peer_count,
  //           is_max_capacity
  //         }

  //         mod.sendUpdateRoomTransaction(room_code, data);

  //         // filter my public key
  //         peers_in_room = peers_in_room.filter(public_key => public_key !== my_public_key);
  //         this.app.connection.emit('show-video-chat-request', app, this, 'large', 'video', room_code);
  //         this.app.connection.emit('stun-remove-loader');
  //         this.app.connection.emit('render-local-stream-request', localStream, 'large');
  //         this.app.connection.emit('remove-overlay-request')


  //         // peers_in_room.forEach(peer => {
  //         //   this.app.connection.emit('render-remote-stream-placeholder-request', peer, 'large');
  //         // });
  //         mod.createMediaChannelConnectionWithPeers([...peers_in_room], 'large', "Video", room_code);


  //       }
  //     }

  //     mod.sendPeerDatabaseRequestWithFilter('Stun', sql, requestCallback)


  // }


}


module.exports = StunxGameMenu;


