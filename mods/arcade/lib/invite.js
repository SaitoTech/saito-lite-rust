const JoinGameOverlay = require("./overlays/join-game");
const InviteTemplate = require("./invite.template");
const JSON = require('json-bigint');

class Invite {
	
  constructor(app, mod, container="", tx=null) {

    this.app = app;
    this.mod = mod;
    this.container = container;
    this.join = new JoinGameOverlay(app, mod, tx);
    this.tx = tx;


    //
    // handle requests to re-render invites -- move to INVITE FILE
    //
    this.app.connection.on("arcade-invite-render-request", (game_id) => {
      if (this.tx == null) { return; }
      if (this.mod.is_game_initializing == true) { return; }
      if (game_id === this.tx.transaction.sig) {
        this.render();
      }
    });

  }

  render() {
    if (document.querySelector(".arcade-invites")) {
      this.app.browser.replaceElementBySelector(InviteTemplate(this.app, this.mod, this.tx), ".arcade-invites");
    } else {
      this.app.browser.addElementToSelector(InviteTemplate(this.app, this.mod, this.tx), this.container);
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

