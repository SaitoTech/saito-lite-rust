const SaitoOverlay = require("../../../../lib/saito/ui/saito-overlay/saito-overlay");
const InviteOverlayTemplate = require("./invite-overlay.template");



class InviteOverlay {

    // peers = {};
    localStreams = [];
    remoteStreams = [];
    my_pc = [];
    peer_connection = "";
    peer_connections = []


    constructor(app, mod) {
        this.app = app
        this.mod = mod
        this.overlay = new SaitoOverlay(app, mod);


        this.app.connection.on('show-invite-overlay-request', (roomCode) => {
            this.roomCode = roomCode;
            this.render(app, mod);
        })

    }



    render(app, mod) {
        console.log(InviteOverlayTemplate(this.roomCode));
        this.overlay.show(InviteOverlayTemplate(this.roomCode));
        this.attachEvents();
    }

    attachEvents() {
        document.querySelector('#stunx-copy-video-invite-code').addEventListener('click', (e) => {
            navigator.clipboard.writeText(`${this.roomCode}`);
            salert("Copied code to clipboard");
        });
        document.querySelector('#stunx-copy-video-invite-link').addEventListener('click', (e) => {
            navigator.clipboard.writeText(`${window.location.host}/redsquare/#${this.app.modules.returnModule('Stunx').returnSlug()}?invite_code=${this.roomCode}`);
            salert("Copied link to clipboard")
        });

        document.querySelector('#inviteCode').value = this.roomCode;


    }
}

module.exports = InviteOverlay
