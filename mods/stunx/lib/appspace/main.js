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
        const inviteCode = app.browser.returnURLParameter('invite_code');
        this.joinVideoInvite(inviteCode);
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
                this.joinVideoInvite(inviteCode.trim());
            }
        })
    }


    joinVideoInvite(roomCode) {
        if (!roomCode) return siteMessageNew("Please insert a room code", 5000);
        let sql = `SELECT * FROM rooms WHERE room_code = "${roomCode}"`;
        const stunx_mod = this.app.modules.returnModule('Stunx');
        console.log(stunx_mod)
        let requestCallback = async (res) => {
            let room = res.rows[0];
            console.log(room);
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
            stunx_mod.setLocalStream(localStream);
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
                stunx_mod.sendUpdateRoomTransaction(roomCode, data);
                this.app.connection.emit('show-video-chat-request', this.app, this, 'large');
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

                stunx_mod.sendUpdateRoomTransaction(roomCode, data);

                // filter my public key
                peers_in_room = peers_in_room.filter(public_key => public_key !== my_public_key);
                stunx_mod.createStunConnectionWithPeers(peers_in_room, 'large');
                this.app.connection.emit('show-video-chat-request', this.app, this, 'large');
                this.app.connection.emit('render-local-stream-request', localStream, 'large');
                peers_in_room.forEach(peer => {
                    this.app.connection.emit('render-remote-stream-placeholder-request', peer, 'large');
                });
            }
        }
        stunx_mod.sendPeerDatabaseRequestWithFilter('Stunx', sql, requestCallback)
    }
}


module.exports = StunxAppspace;


