const JoinGameOverlay = require("./overlays/join-game");
const InviteTemplate = require("./invite.template");
const JSON = require('json-bigint');

class Invite {
	
  constructor(app, mod, container="", tx=null) {

    this.app = app;
    this.mod = mod;
    this.container = container;

    //Save a copy of the tx, though we parse it for info here
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
    this.desired_opponent_publickeys = [];
    this.options = {};

    if (this.tx) {

      let txmsg = this.tx.returnMessage();

      if (txmsg.status) { this.game_status = txmsg.status; }
      if (this.tx.transaction.sig) { this.game_id = this.tx.transaction.sig; }
      if (txmsg.game_id) { this.game_id = txmsg.game_id; }
      if (txmsg.name) { this.game_name = txmsg.name; }
      if (!txmsg.name) { this.game_name = txmsg.game; }
      if (txmsg.players) { this.players = txmsg.players; }
      if (txmsg.players_needed) { this.players_needed = txmsg.players_needed; }
      if (txmsg.desired_opponent_publickey) { this.desired_opponent_publickeys.push(txmsg.desired_opponent_publickey); }
     
      this.game_mod = app.modules.returnModule(txmsg.game);
      this.originator = txmsg.originator || null;

      this.game_slug = this.game_mod.returnSlug() || this.game_name.toLowerCase();

      //
      // crypto invites and games
      //
      if (txmsg.options) {
        this.options = txmsg.options;
        if (txmsg.options.crypto) {
          this.game_type = `${txmsg.options.crypto} invite`;
          if (this.players_needed <= this.players.length) {
             this.game_type = `${txmsg.options.crypto} game`;
          }
        }
      }

    }

    //
    // private invites
    //
    /*if (mod.isMyGame(this.tx)) {
      if (!mod.isJoined(tx, app.wallet.returnPublicKey())) {
        this.game_type = "private invite";
      }
      if (this.tx.transaction.to.length > 1) {
        this.game_type = "private invite";
      }
      if (this.players_needed <= this.players.length) {
        this.game_type = "private game";
      }
    }*/

    // calculate empty slots 
    if (this.players.length < this.players_needed) {
      this.empty_slots = this.players_needed - this.players.length;
    }

    // remove empty slots if any players are requested
    if (this.game_type == 'private invite') {
      if (this.desired_opponent_publickeys.length != 0) {
        this.empty_slots = this.empty_slots - this.desired_opponent_publickeys.length;
      }
    }

  }


  render() {
    if (this.debug){
      console.log("Rendering Invite into: ", this.container);
    }

    if (this.container && document.querySelector(this.container)) {
      this.app.browser.addElementToSelector(InviteTemplate(this.app, this.mod, this), this.container);
    } else {
      this.app.browser.replaceElementBySelector(InviteTemplate(this.app, this.mod, this), ".arcade-invites");
    }
    this.attachEvents();
  }


  attachEvents() {

    let qs = `#saito-game-${this.game_id}`;

    document.querySelector(qs).onclick = (e) => {
      e.stopImmediatePropagation();

      let game_overlay = new JoinGameOverlay(this.app, this.mod, this);
      game_overlay.render();

  	  return;
    };

  }

};

module.exports = Invite;

