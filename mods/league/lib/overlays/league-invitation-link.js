const InvitationLinkTemplate = require('./league-invitation-link.template');
const SaitoOverlay = require("./../../../../lib/saito/ui/saito-overlay/saito-overlay");

class InvitationLink {

    constructor(app, mod, league) {
        this.app = app;
        this.mod = mod;
        this.league = league;

        let inviteLink = window.location.href;
        if (inviteLink.includes("arcade")) { inviteLink = inviteLink.replace("arcade", "league"); }
        if (!inviteLink.includes("#")) { inviteLink += "#"; }
        if (inviteLink.includes("?")) { inviteLink = inviteLink.replace("#", "&league_join_league=" + this.league.id); } 
 	else { inviteLink = inviteLink.replace("#", "?league_join_league=" + this.league.id); }
        inviteLink += "&game=";
        inviteLink += league.game;

        this.link = inviteLink;
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
