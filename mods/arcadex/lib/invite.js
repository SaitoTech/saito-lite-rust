const SaitoModuleOverlay = require("./../../../lib/saito/ui/saito-module-overlay/saito-module-overlay");
const InviteTemplate = require("./invite.template");

class Invite {
	
  constructor(app, mod, container="", invite) {
    this.app = app;
    this.mod = mod;
    this.container = container;
    this.invite = invite;
  }

  render() {
    //
    // insert content we will render into
    //
    if (document.querySelector(".arcade-invites")) {
      this.app.browser.replaceElementBySelector(InviteTemplate(this.app, this.mod, this.invite), ".arcade-invites");
    } else {
      this.app.browser.addElementToSelector(InviteTemplate(this.app, this.mod, this.invite), this.container);
    }

    this.attachEvents();

  }

  attachEvents() {
    invite_self = this;

    document.querySelectorAll(`.saito-game`).forEach(function(elem){
      elem.onclick = (e) => {
        e.stopImmediatePropagation();

        let game_id = e.currentTarget.getAttribute("data-id");
        let game_cmd = e.currentTarget.getAttribute("data-cmd");
        let name = e.currentTarget.getAttribute("data-name");
        let game = e.currentTarget.getAttribute("data-game");

        let invite = {
          name: name,
          game: game,
          cmd: game_cmd
        }

        let saito_mod_detials_overlay = new SaitoModuleOverlay(invite_self.app, invite_self.mod, invite);
        saito_mod_detials_overlay.render();

      }
    });

  }

};

module.exports = Invite;

