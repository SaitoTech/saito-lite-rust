const InvitationLinkTemplate = require('./invitation-link.template');
const SaitoOverlay = require("./../../saito-overlay/saito-overlay");

module.exports = InvitationLinkModal = {
    
    render(app, mod, data = {}) {
        let overlay = new SaitoOverlay(app);
        overlay.show(app, mod, InvitationLinkTemplate(app, mod, data));
        this.attachEvents(app, mod);
    },

    attachEvents(app, game_mod) {
        try{
        
            document.querySelector('#copy-invite-link').addEventListener('click', (e) => {
            navigator.clipboard.writeText(e.currentTarget.dataset.link);
            salert("Copied to clipboard!");
        });
        }catch(err){
            console.error(err);
        }
    },
}



