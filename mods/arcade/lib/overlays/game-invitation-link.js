const InvitationLinkTemplate = require('./game-invitation-link.template');
const SaitoOverlay = require("./../../../../lib/saito/ui/saito-overlay/saito-overlay");

class InvitationLink {

    constructor(app, mod, data={}){
        this.app = app;
        this.mod = mod;
        this.data = data;
        this.overlay = new SaitoOverlay(app, mod);
    }
    
    render(data = null) {
        if (data != null) { this.data = data; }
        this.overlay.show(InvitationLinkTemplate(this.app, this.mod, this.data));
        this.attachEvents();
    }

    attachEvents() {
        try{
            document.querySelector('#copy-invite-link').addEventListener('click', (e) => {
                navigator.clipboard.writeText(e.currentTarget.dataset.link);
                this.overlay.remove();
            });
        }catch(err){
            console.error(err);
        }
    }
}


module.exports = InvitationLink;
