const LeagueInviteTemplate = require('./league-invite.template');

module.exports = LeagueInvite = {
    
    render(app, mod, league, link) {
       this.invite_link = link;
       mod.overlay.show(app, mod, LeagueInviteTemplate(app, mod, league, link));
       this.attachEvents(app, mod);
    },

    attachEvents(app, mod) {
        try{
        const invite_self = this;

        document.querySelector('#copy-invite-link').addEventListener('click', (e) => {
            navigator.clipboard.writeText(invite_self.invite_link);
            document.querySelector("#invite-link-text").innerHTML = "Copied to clipboard!";

        });
        }catch(err){
            console.error(err);
        }
    },
}
