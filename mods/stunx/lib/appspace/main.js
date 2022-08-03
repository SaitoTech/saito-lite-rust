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
    }

    attachEvents(app, mod) {
        document.body.addEventListener('click', (e) => {
            if (e.target.id === "add-to-listeners-btn") {
                let input = document.querySelector('#listeners-input').value.split(',');
                const listeners = input.map(listener => listener.trim());
                let stun_mod = app.modules.returnModule("Stun");
                stun_mod.addListeners(listeners);
            }

            if (e.target.id === "createInvite") {
                let stunx_mod = app.modules.returnModule("Stunx");
                stunx_mod.sendCreateRoomRequest();
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
        let room = null;
        const stunx_mod = this.app.modules.returnModule('Stunx');

        let requestCallback = async (res) => {
            let room = res.rows[0];
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
            let peersInRoom = JSON.parse(room.peers);

            // first to join the room?
            if (peersInRoom.length === 0) {
                // add to the room list and save
                peersInRoom.push(my_public_key);
                stunx_mod.sendUpdateRoomRequest(roomCode, JSON.stringify(peersInRoom));
                this.app.connection.emit('show-video-chat-request', new RTCPeerConnection(), this.app, this);
                this.app.connection.emit('add-local-stream-request', localStream);
                siteMessageNew("You are the only participant in this room");
                return;

            } else {
                peersInRoom.push(my_public_key);
                stunx_mod.sendUpdateRoomRequest(roomCode, JSON.stringify(peersInRoom));

                // filter my public key
                peersInRoom = peersInRoom.filter(public_key => public_key !== my_public_key);
                stunx_mod.createStunConnectionWithPeers(peersInRoom);
                this.app.connection.emit('show-video-chat-request', new RTCPeerConnection(), this.app, this);
                this.app.connection.emit('add-local-stream-request', localStream);

                peersInRoom.forEach(peer => {
                    this.app.connection.emit('add-remote-stream-request', null, peer, null, 'fromRecipient');
                });
            }








        }

        stunx_mod.sendPeerDatabaseRequestWithFilter('Stunx', sql, requestCallback)

    }

}


module.exports = StunxAppspace;


