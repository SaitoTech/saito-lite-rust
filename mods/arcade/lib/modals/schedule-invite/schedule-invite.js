const SaitoOverlay = require("./../../../../../lib/saito/new-ui/saito-overlay/saito-overlay");
const SaitoScheduler = require("./../../../../../lib/saito/new-ui/saito-scheduler/saito-scheduler");
const ScheduleInviteTemplate = require("./schedule-invite.template");
const JSON = require('json-bigint');

class ScheduleInvite {

    constructor(app, mod, invite_tx = null) {
      this.app = app;
      this.invite_tx = invite_tx;
      this.overlay = new SaitoOverlay(app);

console.log("INVITE TX");
console.log(JSON.stringify(this.invite_tx));

    }

    render(app, mod) {
      this.overlay.show(app, mod, ScheduleInviteTemplate(app, mod));
      this.attachEvents(app, mod);
    }

    attachEvents(app, mod) {

      let scheduler_self = this;

      document.getElementById("create-invite-now").onclick = (e) => {

        this.overlay.hide();
	app.network.propagateTransaction(scheduler_self.invite_tx);

        //
        // and relay open if exists
        //
        let peers = [];
        for (let i = 0; i < app.network.peers.length; i++) {
          peers.push(app.network.peers[i].returnPublicKey());
        }
        let relay_mod = app.modules.returnModule("Relay");
        if (relay_mod != null) {
          relay_mod.sendRelayMessage(peers, "arcade spv update", scheduler_self.invite_tx);
        }

        mod.addGameToOpenList(scheduler_self.invite_tx);

        console.log("INVUTE TX: " + JSON.stringify(scheduler_self.invite_tx));
        // 
        // create invite link from the game_sig
        // 
        mod.showShareLink(newtx.transaction.sig);
      }
      document.getElementById("create-specific-date").onclick = (e) => {
	let txmsg = scheduler_self.invite_tx.returnMessage();
console.log("IT");
console.log(JSON.stringify(txmsg));
	let title = "Game Invite: " + txmsg.options.game;
console.log("title: " + title);
        this.overlay.hide();
	let scheduler = new SaitoScheduler(app, mod, { date : new Date() , tx : scheduler_self.invite_tx , title : title });
	scheduler.render(app, mod);
      }
      document.getElementById("create-negotiate-date").onclick = (e) => {
        this.overlay.hide();
      }
    }
}

module.exports = ScheduleInvite;

