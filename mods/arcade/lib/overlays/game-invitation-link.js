const InvitationLinkTemplate = require('./game-invitation-link.template');
const SaitoOverlay = require("./../../../../lib/saito/ui/saito-overlay/saito-overlay");

class InvitationLink {

    constructor(app, mod, data={}){
        this.app = app;
        this.mod = mod;
        this.game = data.game;
        this.link = data.link;
        this.overlay = new SaitoOverlay(app, mod);
    }
    
    render() {
        this.overlay.show(InvitationLinkTemplate(this.game));

        try{
            document.querySelector('#copy-invite-link').addEventListener('click', (e) => {
                navigator.clipboard.writeText(this.invite_link);
                this.overlay.remove();
            });
        }catch(err){
            console.error(err);
        }

    }

}


module.exports = InvitationLink;
