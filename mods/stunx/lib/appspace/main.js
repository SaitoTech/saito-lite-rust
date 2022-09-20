const StunxAppspaceTemplate = require('./main.template.js');

class StunxAppspace {
    constructor(app, mod) {
        this.app = app;
        this.mod = mod;
    }

    render(app, mod) {
        if (!document.querySelector(".stunx-appspace")) {
            app.browser.addElementToSelector(StunxAppspaceTemplate(app, mod), ".appspace");
        }
        this.attachEvents(app, mod);
        const inviteCode = window.location.hash.split('=')[1];


        const stunx_mod = app.modules.returnModule('Stunx');



        if (inviteCode && stunx_mod.appspaceRendered === false) {
      
            setTimeout(() => {
                stunxAppspace.joinVideoInvite(app, mod, inviteCode);
                console.log('invite code ', window.location.hash.split('=')[1])
            }, 3000)
        }
        stunx_mod.appspaceRendered = true;




        this.joined = true;

    }

    attachEvents(app, mod) {
        document.body.onclick = ('click', (e) => {
            if (e.target.id === "add-to-listeners-btn") {
                let input = document.querySelector('#listeners-input').value.split(',');
                const listeners = input.map(listener => listener.trim());
                let stun_mod = app.modules.returnModule("Stun");
                stun_mod.addListeners(listeners);
            }
            if (e.target.id === "createInvite") {
                let stunx_mod = app.modules.returnModule("Stunx");
                stunx_mod.sendCreateRoomTransaction();
            }
            if (e.target.id === "joinInvite") {
                const inviteCode = document.querySelector("#inviteCode").value;
                console.log(inviteCode, 'invite code'), 
                this.joinVideoInvite(app, mod ,inviteCode.trim());
            }
            if (e.target.id === "createDataChannel") {
                const pubkey = document.querySelector("#publicKey").value;
                console.log(pubkey, 'pubkey'), 
                this.public_key = pubkey
                this.createDataChannelWithPeer(app, mod ,pubkey);
            }
            if (e.target.id === "sendMessage") {
                const message = document.querySelector("#message").value;
                this.sendMessageToPeer(app, mod ,message);
            }
        })
    }


    joinVideoInvite(app, mod , roomCode) {
        console.log(roomCode)
        if (!roomCode) return siteMessageNew("Please insert a room code", 5000);
        let sql = `SELECT * FROM rooms WHERE room_code = "${roomCode}"`;
        // const stunx_mod = app.modules.returnModule('Stunx');
        // console.log(stunx_mod)
        let requestCallback = async (res) => {
            let room = res.rows[0];
            console.log(res, 'res')
            if (!room) {
                console.log('Invite code is invalid');
                return siteMessageNew("Invite code is invalid");
            }
            if (room.isMaxCapicity) {
                console.log("Room has reached max capacity");
                return siteMessageNew("Room has reached max capacity");
            }
            if (Date.now() < room.startTime) {
                siteMessageNew("Video call time is not yet reached", 5000);
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
                mod.sendUpdateRoomTransaction(roomCode, data);
                this.app.connection.emit('show-video-chat-request', app, this, 'large');
                this.app.connection.emit('render-local-stream-request', localStream, 'large');
                siteMessageNew("You are the only participant in this room");
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

                mod.sendUpdateRoomTransaction(roomCode, data);

                // filter my public key
                peers_in_room = peers_in_room.filter(public_key => public_key !== my_public_key);
                mod.createStunConnectionWithPeers(peers_in_room, 'large');
                this.app.connection.emit('show-video-chat-request', app, this, 'large');
                this.app.connection.emit('render-local-stream-request', localStream, 'large');
                peers_in_room.forEach(peer => {
                    this.app.connection.emit('render-remote-stream-placeholder-request', peer, 'large');
                });
            }
        }
        mod.sendPeerDatabaseRequestWithFilter('Stunx', sql, requestCallback)
    }


    createDataChannelWithPeer(app, mod, pubkey){
        mod.createDataChannelConnectionWithPeers([pubkey]);
    }

    sendMessageToPeer(app, mod, message){
        console.log( mod.peer_datachannel_connections[this.public_key], message, this.public_key)
        mod.peer_datachannel_connections[this.public_key].dc.send(message)
        console.log(mod.peer_datachannel_connections[this.public_key].dc.send)
    }
}


module.exports = StunxAppspace;


