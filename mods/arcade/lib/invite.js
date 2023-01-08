const JoinGameOverlay = require("./overlays/join-game");
const ContinueGameOverlay = require("./overlays/continue-game");
const WaitingGameOverlay = require("./overlays/waiting-game");
const InviteTemplate = require("./invite.template");
const JSON = require('json-bigint');

class Invite {
	
  constructor(app, mod, container="", tx=null) {

    this.app = app;
    this.mod = mod;
    this.container = container;
    this.join = new JoinGameOverlay(app, mod, tx);
    this.continue_game = new ContinueGameOverlay(app, mod, tx);
    this.waiting_game = new WaitingGameOverlay(app, mod, tx);
    this.tx = tx;

    //
    // information may be stored in different places, so we 
    // save these variables in our invite, and use the invite
    // version to display our overlay templates.
    //
    this.game_id = "";
    this.game_type = "standard game";
    this.game_name = "";
    this.game_slug = "";
    this.game_mod = null;
    this.game_status = "";
    this.originator = null;
    if (this.tx) {
      let txmsg = this.tx.returnMessage();
      if (txmsg.status) { this.game_status = txmsg.status; }
      if (this.tx.transaction.sig) { this.game_id = this.tx.transaction.sig; }
      if (txmsg.game_id) { this.game_id = txmsg.game_id; }
      if (txmsg.name) { this.game_name = txmsg.name; }
      if (this.game_name) { this.game_slug = this.game_name.toLowerCase(); }
      if (!txmsg.name) { this.game_name = txmsg.game; }
      this.game_mod = app.modules.returnModule(txmsg.game);
      this.originator = txmsg.originator || null;
    }
    if (this.game_mod) {
      this.game_name = this.game_mod.returnName();
      this.game_slug = this.game_mod.returnSlug();
    }

    //
    // private invites
    //
    if (mod.isMyGame(this.tx)) {
      if (!mod.isJoined(tx, app.wallet.returnPublicKey())) {
        this.game_type = "private invite";
      }
      if (this.tx.transaction.to.length > 1) {
        this.game_type = "private invite";
      }
    }




    //
    //
    // handle requests to re-render invites -- move to INVITE FILE
    //
    this.app.connection.on("arcade-invite-render-request", (game_id) => {
      this.game_id = game_id;
      if (this.tx == null) { return; }
      if (this.mod.is_game_initializing == true) { return; }
      if (game_id === this.tx.transaction.sig) {
        this.render();
      }
    });

  }

  render() {
    if (document.querySelector(".arcade-invites")) {
      this.app.browser.replaceElementBySelector(InviteTemplate(this.app, this.mod, this), ".arcade-invites");
    } else {
      this.app.browser.addElementToSelector(InviteTemplate(this.app, this.mod, this), this.container);
    }
    this.attachEvents();
  }


  attachEvents() {

    let qs = `.saito-game-${this.game_id}`;

    document.querySelector(qs).onclick = (e) => {

        e.stopImmediatePropagation();

	if (this.mod.isMyGame(this.tx)) {
	  if (this.mod.isAccepted(this.tx, this.app.wallet.returnPublicKey())) {
	    if (this.game_status === "open") {
              this.waiting_game.invite = this;
              this.waiting_game.render();
  	      return;
	    } else {
              this.continue_game.invite = this;
              this.continue_game.render();
  	      return;
	    }
	  } else {
      	    this.join.invite = this;
      	    this.join.render();
	    return;
	  }
	} else {
      	  this.join.invite = this;
      	  this.join.render();
	  return;
	}

    };

  }

};

module.exports = Invite;

