const SaitoSchedulerTemplate = require("./saito-scheduler.template");
const SaitoOverlay = require("./../saito-overlay/saito-overlay");
const SaitoInviter = require("./../saito-inviter/saito-inviter");
const Moment = require("moment");

class SaitoScheduler {

  constructor(app, mod, options = { date: new Date() , tx : null , title : "New Event"}) {

    this.app = app;

    this.name = "SaitoScheduler";

    this.tx = options.tx; // what we are scheduling, possibly a game invitation? 
    this.title = options.title;
    this.overlay = new SaitoOverlay(app);
    this.mycallback = null;
    this.options = {};
    this.options.slots = [];
    this.options.datetime = 0;
    this.options.title = this.title;
    this.options.max_participants = 4;
    
    if (this.tx != null) {
      this.options.max_participants = this.tx.transaction.to.length;
      for (let i = 0; i < this.tx.transaction.to.length; i++) {
	let add = this.tx.transaction.to[i].add;
	if (add !== app.wallet.returnPublicKey()) {
	  this.options.slots.push(add);
	}
      }
    }

    const d = options.date;
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

  attachEvents(mycallback) {

    let app = this.app;
    let mod = this.mod;

    let scheduler_self = this;

    document.querySelector(".saito-scheduler-button").onclick = (e) => {

      let type = document.querySelector(".saito-scheduler-title").innerHTML;
      let datetime = document.getElementById("schedule-datetime-input").value;

      //
      // set invite recipients
      //
      let invitemod = app.modules.returnModule("Invites");
      invitemod.resetInviteOptions();
      invitemod.addPrivateSlotToInviteOptions(app.wallet.returnPublicKey());
      for (let i = 0; i < scheduler_self.options.slots.length; i++) {
        if (scheduler_self.options.slots[i] !== "public") {
          invitemod.addPrivateSlotToInviteOptions(scheduler_self.options.slots[i]);
        } else {
          invitemod.addPublicSlotToInviteOptions(scheduler_self.options.slots[i]);
        }
      }


      //
      // set invite datetime
      //
      invitemod.options.datetime = datetime;
      invitemod.options.title = type;


      //
      // and send the invite
      //
      invitemod.createOpenTransaction(invitemod.options);



      //
      // next steps
      //
      scheduler_self.overlay.hide();
      mycallback();

    }

    document.querySelector('.saito-scheduler-invite.saito-user:last-of-type').onclick = (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      let type = document.querySelector(".saito-scheduler-title").innerHTML;
      let datetime = document.getElementById("schedule-datetime-input").value;
      scheduler_self.options.date = new Date(datetime);
      let inviter = new SaitoInviter(app, mod);
      inviter.render(function (options) {
        scheduler_self.options.slots.push(options);
        scheduler_self.overlay.show(SaitoSchedulerTemplate(app, mod, scheduler_self.options));
        scheduler_self.attachEvents(scheduler_self.mycallback);
      });

    }


    document.querySelector(".saito-scheduler-text-input").addEventListener("keyup", (e) => {
      var td = 0;
//Chrono.parseDate(e.target.value, { forwardDate: true })
      console.log(td);
      if (td) {
        let displayDate = new Date(td - (td.getTimezoneOffset()*60*1000)).toISOString().substring(0,16);
        document.querySelector(".scheduler-datetime-input").value = displayDate;
        document.querySelector(".scheduler-datetime-input").dataset.gmdTs = td - 0;
        //use this for the GMT timestamp of the date.
        document.querySelector(".saito-scheduler-natural-time").innerHTML = "[" + Moment(td).fromNow() + "]";
      }
    });

    document.querySelector(".scheduler-datetime-input").addEventListener("change", (e) => {
      document.querySelector(".saito-scheduler-natural-time").innerHTML = Moment(e.target.value).fromNow();
      document.querySelector(".saito-scheduler-text-input").value = "";
    });
  }

}

module.exports = SaitoScheduler;

