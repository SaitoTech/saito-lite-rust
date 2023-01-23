const InvitationLinkTemplate = require('./league-invitation-link.template');
const SaitoOverlay = require("./../../../../lib/saito/ui/saito-overlay/saito-overlay");

class InvitationLink {

    constructor(app, mod, link="") {
        this.app = app;
        this.mod = mod;
        this.link = link;
        this.overlay = new SaitoOverlay(app, mod);
    }
    
    render() {
        this.overlay.show(InvitationLinkTemplate(this.app, this.mod, this.link));
        this.attachEvents();
    }

    attachEvents() {
        try{
            document.querySelector('#copy-invite-link').addEventListener('click', (e) => {
                navigator.clipboard.writeText(e.currentTarget.dataset.link);
                this.overlay.remove();
            });
        } catch(err){
            console.error(err);
        }
    }
}


module.exports = InvitationLink;
