const SaitoSchedulerTemplate = require("./saito-scheduler.template");
const SaitoOverlay = require("./../saito-overlay/saito-overlay");
const SaitoInviter = require("./../saito-inviter/saito-inviter");


class SaitoScheduler {

  constructor(app, mod) {

    this.app 		    = app;
    this.name 		    = "SaitoScheduler";

    this.overlay            = new SaitoOverlay(this.app);
    this.mycallback         = null;
    this.options            = {};
    this.options.slots      = [];
    this.options.mods       = [];
    this.options.mods_index = [];

    const d = new Date();
    let utcOffset = d.getTimezoneOffset(); // returns offset in minutes

    this.options.default_utc_offset = -(utcOffset/60); //convert offset minutes to UTC 
    this.options.default_utc_sign = (Math.sign(this.options.default_utc_offset) == 1) ? '+' : '-';
    this.options.default_utc_value = this.options.default_utc_sign+this.options.default_utc_offset;

  }

  render(app, mod, mycallback=null) {

    for (let i = 0; i < app.modules.mods.length; i++) {
      if (app.modules.mods[i].respondTo("invite") != null) {
	this.options.mods.push(app.modules.mods[i]);
      }
    }

    if (mycallback != null) { this.mycallback = mycallback; }
    this.overlay.show(app, mod, SaitoSchedulerTemplate(app, mod, this.options));
    this.attachEvents(app, mod, this.mycallback);

  }


  attachEvents(app, mod, mycallback){

    let scheduler_self = this;

    document.querySelector(".saito-scheduler-button").onclick = (e) => {

      let type = document.getElementById("schedule-type").value;
      let datetime = document.getElementById("schedule-datetime-input").value;

      let invite_index = 0;
      for (let i = 0; i < scheduler_self.options.mods.length; i++) {
        if (type === scheduler_self.options.mods[i].returnSlug()) {
	  invite_index = i;
	  scheduler_self.options.mods_index = i;
	}
      }


      //
      // set invite recipients
      //
      let invitemod = scheduler_self.options.mods[invite_index];
      invitemod.resetInviteOptions();
      invitemod.addPrivateSlotToInviteOptions(app.wallet.returnPublicKey());
      for (let i = 0; i < scheduler_self.options.slots.length; i++) {
	if (scheduler_self.options.slots[i] !== "public") {
	  invitemod.addPrivateSlotToInviteOptions(schedulers_self.options.slots[i]);
	} else {
	  invitemod.addPublicSlotToInviteOptions(schedulers_self.options.slots[i]);
	}
      }

      //
      // set invite datetime
      //
      invitemod.options.datetime = datetime;

      //
      // next steps
      //
      if (invitemod.respondTo("invite")) {
	scheduler_self.overlay.hide();
        invitemod.respondTo("invite").render(app, invitemod);
      }

    }

    document.querySelector('.saito-scheduler-invite.saito-user').onclick = (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      let inviter = new SaitoInviter(app, mod);
      inviter.render(app, mod, function(options) {
        scheduler_self.options.slots.push(options);
        scheduler_self.overlay.show(app, mod, SaitoSchedulerTemplate(app, mod, scheduler_self.options));
        scheduler_self.attachEvents(app, mod, scheduler_self.mycallback);
      });

    }
  }

}

module.exports = SaitoScheduler;

