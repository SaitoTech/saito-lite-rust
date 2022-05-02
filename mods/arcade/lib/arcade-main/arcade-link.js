const ArcadeLinkTemplate = require('./templates/arcade-link.template');

module.exports = ArcadeLink = {
    
    render(app, mod, data = {}) {
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
            document.querySelector("#invite-link-text").innerHTML = "Copied to clipboard!";

        });
        }catch(err){
            console.error(err);
        }
    },
}



