const InviteOverlayTemplate = require('./invite-overlay-template');

/*
* For some reason we need a slightly different version of lib/saito/ui/gameOverlay or lib/saito/ui/saitoOverlay
* changing selectors to #advanced so it doesn't block gameoverlay (since it gets embedded in an element that gets hidden)
*/
class InviteOverlay {

    invite_link;

    constructor(app) {
        this.app = app;
    }

    render(app, mod) {
        if (!document.querySelector(".invite-overlay-container")) { app.browser.addElementToDom(InviteOverlayTemplate(app, mod), "arcade-container"); }




    }

    attachEvents(app, game_mod) {
        const overlay_self = this;
        tippy("#copy-invite-link", {
            content: "Copied",
            trigger: "click",
        });

        tippy(document.querySelectorAll("#copy-invite-link"), {
            content: "Copy",
        });

        tippy(document.querySelectorAll(".share"), {
            content: "Share",
        });

        document.querySelector('#copy-invite-link').addEventListener('click', (e) => {
            // console.log(overlay_self.invite_link);
            navigator.clipboard.writeText(overlay_self.invite_link);
        })
        document.querySelector('.close-invite-link').addEventListener('click', (e) => {
            console.log(e)
            overlay_self.hide();
        })
        document.querySelector('.invite-overlay-container').addEventListener('click', (e) => {

            if (e.target === document.querySelector(".invite-overlay")) {
                overlay_self.hide();
            }


        })


    }

    show(invite_link) {
        this.invite_link = invite_link
        console.log("Show invite overlay");
        document.querySelector(".invite-link-text").textContent = invite_link


    }

    hide(mycallback = null) {

        document.querySelector('.invite-overlay-container').parentElement.removeChild(document.querySelector('.invite-overlay-container'));

    }
}

module.exports = InviteOverlay

