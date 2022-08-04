const SaitoSchedulerTemplate = require("./saito-scheduler.template");
const SaitoOverlay = require("./../saito-overlay/saito-overlay");
const SaitoInviter = require("./../saito-inviter/saito-inviter");


class SaitoScheduler {

  constructor(app, mod) {

    this.app 		= app;
    this.name 		= "SaitoScheduler";
    this.overlay        = new SaitoOverlay(this.app);
    this.mycallback     = null;
    this.options        = {};
    this.options.slots  = [];

    const d = new Date();
    let utcOffset = d.getTimezoneOffset(); // returns offset in minutes

    this.options.default_utc_offset = -(utcOffset/60); //convert offset minutes to UTC 
    this.options.default_utc_sign = (Math.sign(this.options.default_utc_offset) == 1) ? '+' : '-';
    this.options.default_utc_value = this.options.default_utc_sign+this.options.default_utc_offset;

  }

  render(app, mod, mycallback=null) {

    if (mycallback != null) { this.mycallback = mycallback; }
    this.overlay.show(app, mod, SaitoSchedulerTemplate(app, mod, this.options));


    //
    // identify modules that support InviteModTemplate and insert them 
    // into the select
    //

    this.attachEvents(app, mod, this.mycallback);

  }


  attachEvents(app, mod, mycallback){

    let scheduler_self = this;

    document.querySelector(".saito-scheduler-button").onclick = (e) => {
      let type = document.getElementById("schedule-type").value;
      let datetime = document.getElementById("schedule-datetime-input").value;
      let desc = document.getElementById("schedule-desc").value;
      alert("Schedule type: "+type+" - when: "+datetime+" UTC "+this.options.default_utc_value+" - details: "+desc);
    }

    document.querySelector('.saito-scheduler-invite.saito-user').onclick = (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      let inviter = new SaitoInviter(app, mod);
      inviter.render(app, mod, function(options) {
	alert(JSON.stringify(options));
        scheduler_self.options.slots.push(options);
        scheduler_self.overlay.show(app, mod, SaitoSchedulerTemplate(app, mod, scheduler_self.options));
        scheduler_self.attachEvents(app, mod, scheduler_self.mycallback);
        alert("DONE!");
      });

    }
  }

}

module.exports = SaitoScheduler;

