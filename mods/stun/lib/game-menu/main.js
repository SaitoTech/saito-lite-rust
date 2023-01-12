
const saito = require("../../../../lib/saito/saito");
class StunxGameMenu {

    constructor(app, mod) {
        this.app = app;
        this.mod = mod;

        app.connection.on('game-receive-video-call', (app, offer_creator, offer) => {
            // this.receiveVideoCall(app, offer_creator, offer);
        })
        this.app.connection.on('game-start-video-call', (peers) => {
            this.startVideoCall(peers);
        })

        app.connection.on('join-direct-room-with-code', (code) => {
            console.log('app', this.app, 'mod', this.mod)
            this.joinVideoInvite(this.app, code)
        })
    }


    async startVideoCall(peers) {
        if (peers.constructor !== Array) {
            peers = [peers]
        }
        const stun_mod = this.app.modules.returnModule('Stun');

        let callback = async function (app, mod, roomCode) {
            app.connection.emit('join-direct-room-with-code', roomCode);
            let newtx = app.wallet.createUnsignedTransaction();
            peers.forEach(peer => {
                newtx.transaction.to.push(new saito.default.slip(peer))
            })

            newtx.msg.module = "Stun";
            newtx.msg.request = "receive room code"
            newtx.msg.data = {
                roomCode,
                creator: app.wallet.returnPublicKey()

            };
            newtx = app.wallet.signTransaction(newtx);
            app.network.propagateTransaction(newtx)
            // console.log('sending room code')
        }
        stun_mod.sendCreateRoomTransaction(callback);
    }



    joinVideoInvite(app, room_code) {
        console.log(room_code)
        const mod = app.modules.returnModule('Stun');
        if (!room_code) return siteMessage("Please insert a room code", 5000);
        let sql = `SELECT * FROM rooms WHERE room_code = "${room_code}"`;

        let requestCallback = async (res) => {
            let room = res.rows[0];
            console.log(res, 'res')
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

            const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            mod.setLocalStream(localStream);
            let my_public_key = this.app.wallet.returnPublicKey();
            let peers_in_room = JSON.parse(room.peers);

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
                siteMessage("You are the only participant in this room", 5000);
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
                mod.createMediaConnectionWithPeers(peers_in_room, 'large', "Video");
                this.app.connection.emit('show-video-chat-request', app, this, 'large', 'video', room_code);
                this.app.connection.emit('render-local-stream-request', localStream, 'large');
                peers_in_room.forEach(peer => {
                    this.app.connection.emit('render-remote-stream-placeholder-request', peer, 'large');
                });
            }
        }

        mod.sendPeerDatabaseRequestWithFilter('Stun', sql, requestCallback)
        const stun_mod = app.modules.returnModule('Stun');

    }

}


module.exports = StunxGameMenu;


