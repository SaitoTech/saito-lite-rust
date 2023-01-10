const SaitoOverlay = require("./../../../../lib/saito/ui/saito-overlay/saito-overlay");
const SaitoScheduler = require("./../../../../lib/saito/ui/saito-scheduler/saito-scheduler");
const ScheduleInviteTemplate = require("./game-scheduler.template");
const JSON = require('json-bigint');

class GameScheduler {

    constructor(app, mod, invite_tx = null) {
      this.app = app;
      this.mod = mod;
      this.invite_tx = invite_tx;
      this.overlay = new SaitoOverlay(app);

      this.app.connection.on("arcade-launch-game-scheduler", (invite_tx={}) => {
        this.invite_tx = invite_tx;
        this.render();
      });

    }

    render() {
      this.overlay.show(ScheduleInviteTemplate(this.app, this.mod));
      this.attachEvents();
    }


    attachEvents() {

      let scheduler_self = this;
      let app = this.app;
      let mod = this.mod;

      //
      // create invite now
      //
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

        console.log('add game invite_tx');
        console.log(scheduler_self.invite_tx);

        mod.addGame(scheduler_self.invite_tx, "open");

        // 
        // create invite link from the game_sig
        // 
        mod.showShareLink(scheduler_self.invite_tx.transaction.sig);
      }

      //
      // create future invite
      //
      document.getElementById("create-specific-date").onclick = (e) => {
	let txmsg = scheduler_self.invite_tx.returnMessage();
	let title = "Game Invite: " + txmsg.options.game;
        this.overlay.hide();
	let scheduler = new SaitoScheduler(app, mod, { date : new Date() , tx : scheduler_self.invite_tx , title : title });
	scheduler.render(app, mod, function() {
	  alert("CALLBACK WHEN DATE SELECTED");
	});
      }

    }
}

module.exports = GameScheduler;

