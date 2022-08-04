const SaitoOverlay = require("../../../../lib/saito/ui/saito-overlay/saito-overlay");
const InviteOverlayTemplate = require("./invite-overlay.template");



class InviteOverlay {

    // peers = {};
    localStreams = [];
    remoteStreams = [];
    my_pc = [];
    peer_connection = "";
    peer_connections = []
    overlay = new SaitoOverlay(this.app, true);


    constructor(app, mod) {
        this.app = app
        this.mod = mod
        this.app.connection.on('show-invite-overlay-request', (roomCode) => {
            this.roomCode = roomCode;
            this.render(app, mod);
        })

    }



    render(app, mod) {
        console.log(InviteOverlayTemplate(this.roomCode));
        this.overlay.show(this.app, this.mod, InviteOverlayTemplate(this.roomCode), null);
        this.attachEvents();
    }

    attachEvents() {
        console.log("attaching copy event");
        document.querySelector('#copyVideoInviteCode i').addEventListener('click', (e) => {
            navigator.clipboard.writeText(`${this.roomCode}`);
            document.querySelector("#copyVideoInviteCode").textContent = "Copied to clipboard";
        });
        document.querySelector('#copyVideoInviteLink i').addEventListener('click', (e) => {
            navigator.clipboard.writeText(`${window.location.host}/stunx?invite_code=${this.roomCode}`);
            document.querySelector("#copyVideoInviteLink").textContent = "Copied to clipboard";
        });

        document.querySelector('#inviteCode').value = this.roomCode;


    }
}

module.exports = InviteOverlay