const SaitoSchedulerTemplate = require("./saito-scheduler.template");
const SaitoOverlay = require("./../saito-overlay/saito-overlay");
const SaitoInviter = require("./../saito-inviter/saito-inviter");

class SaitoScheduler {

  constructor(app, mod, options = { date: new Date() , tx : null , title : "New Event" , adds : []}) {

    this.app = app;

    this.name = "SaitoScheduler";

console.log("CONSTRUCTING SCHEDULER: ");
console.log(JSON.stringify(options));

    this.tx = options.tx; // what we are scheduling, possibly a game invitation? 
    this.title = options.title;
    this.overlay = new SaitoOverlay(app);
    this.mycallback = null;
    this.options = {};
    this.options.adds = [];
    if (this.options.publickey) { this.options.adds.push(publickey); }
    this.options.datetime = 0;
    this.options.title = this.title;
    let d = options.date;
    if (!d) {
      d = new Date();
    }
    let utcOffset = d.getTimezoneOffset(); // returns offset in minutes

    this.options.date = d;
    this.options.default_utc_offset = -(utcOffset / 60); //convert offset minutes to UTC 
    this.options.default_utc_sign = (Math.sign(this.options.default_utc_offset) == 1) ? '+' : '-';
    this.options.default_utc_value = this.options.default_utc_sign + this.options.default_utc_offset;

  }

  render(mycallback = null) {

    let app = this.app;
    let mod = this.mod;

    if (mycallback != null) { this.mycallback = mycallback; }
    this.overlay.show(SaitoSchedulerTemplate(app, mod, this.options));
    this.attachEvents(this.mycallback);

  }

  attachEvents(mycallback = null) {

    let app = this.app;
    let mod = this.mod;

    let scheduler_self = this;

    document.querySelector(".saito-scheduler-button").onclick = (e) => {

      let datetime = document.getElementById("schedule-datetime-input").value;
      let invitemod = app.modules.returnModule("Invites");
      invitemod.resetInviteOptions();

      //
      // set invite datetime
      //
      invitemod.options.datetime = datetime;
     
console.log("OPTIONS FOR INVITE: " + JSON.stringify(invitemod.options));

      //
      // set recipients to approve
      //
      this.addPrivateSlotToInviteOptions(this.app.wallet.returnPublicKey());
      for (let i = 0; i < this.options.adds.length; i++) { this.addPrivateSlotToInviteOptions(publickey); }

      //
      // and send the invite
      //
      invitemod.createOpenTransaction(invitemod.options);

      //
      // next steps
      //
      scheduler_self.overlay.hide();
      if (mycallback != null) { 
console.log("AAA");
	mycallback(); 
console.log("BBB");
      }

    }

  }

}

module.exports = SaitoScheduler;

