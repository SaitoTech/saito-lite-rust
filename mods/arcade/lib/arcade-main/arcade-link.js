const ArcadeLinkTemplate = require('./templates/arcade-link.template');
const SaitoOverlay = require("./../../../../lib/saito/ui/saito-overlay/saito-overlay");

module.exports = ArcadeLink = {
    
    render(app, mod, data = {}) {
        if (mod.overlay == null) {
            mod.overlay = new SaitoOverlay(app);
        }
        
        mod.overlay.show(app, mod, ArcadeLinkTemplate(app, mod, data));
        
        if (data.invite_link){
            this.invite_link = data.invite_link;
        }
        console.log("ARCADE LINK:",this.invite_link);
    },

    attachEvents(app, game_mod) {
        try{
        const invite_self = this;

        /*tippy(document.querySelectorAll("#copy-invite-link"), {
            content: "Copy",
        });

        tippy(document.querySelectorAll(".share"), {
            content: "Share",
        });
        */
        
        document.querySelector('#copy-invite-link').addEventListener('click', (e) => {
            navigator.clipboard.writeText(invite_self.invite_link);
            salert("Copied to clipboard!");
        });
        }catch(err){
            console.error(err);
        }
    },
}



