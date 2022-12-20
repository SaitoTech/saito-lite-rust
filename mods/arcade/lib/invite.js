const JoinGameOverlay = require("./overlays/join-game");
const InviteTemplate = require("./invite.template");

class Invite {
	
  constructor(app, mod, container="", invite) {
    this.app = app;
    this.mod = mod;
    this.container = container;
    this.join = new JoinGameOverlay(app, mod);
  }

  render() {
    if (document.querySelector(".arcade-invites")) {
      this.app.browser.replaceElementBySelector(InviteTemplate(this.app, this.mod, this.invite), ".arcade-invites");
    } else {
      this.app.browser.addElementToSelector(InviteTemplate(this.app, this.mod, this.invite), this.container);
    }
    this.attachEvents();
  }


  attachEvents() {

    invite_self = this;

    document.querySelectorAll(`.saito-game`).forEach( (elem) => {
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

	invite_self.join.invite = invite;
	invite_self.join.render();

      }
    });

  }

};

module.exports = Invite;

