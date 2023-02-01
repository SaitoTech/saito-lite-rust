const InvitationLinkTemplate = require('./game-invitation-link.template');
const SaitoOverlay = require("./../../../../lib/saito/ui/saito-overlay/saito-overlay");

class InvitationLink {

    constructor(app, mod, data={}){
        this.game = data.game;
        this.invite_link = data.invite_link;
        this.overlay = new SaitoOverlay(app, mod);
    }
    
    render() {
        this.overlay.show(InvitationLinkTemplate(this.game));
        this.attachEvents();
    }

    attachEvents(){
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
