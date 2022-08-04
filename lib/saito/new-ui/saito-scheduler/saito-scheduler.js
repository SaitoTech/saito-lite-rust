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

console.log("start of render");


    //
    // identify modules that support InviteModTemplate
    //
    for (let i = 0; i < app.modules.mods.length; i++) {
console.log("mod is: " + app.modules.mods[i].name);
console.log("does mod respond to scheduler-overlay 1 " + i);
      if (app.modules.mods[i].respondTo("scheduler-overlay") != null) {

console.log("does mod respond to scheduler-overlay 2 " + i);

	this.options.mods.push(app.modules.mods[i]);
      }
    }

console.log("start of render 2");

    if (mycallback != null) { this.mycallback = mycallback; }
console.log("start of render 3");
    this.overlay.show(app, mod, SaitoSchedulerTemplate(app, mod, this.options));
console.log("start of render 4");
    this.attachEvents(app, mod, this.mycallback);
console.log("start of render 5");

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
      let number_of_participants = 1 + scheduler_self.options.slots.length;
      let recipients = [];
      for (let i = 0; i < scheduler_self.options.slots.length; i++) {
	if (scheduler_self.options.slots[i] !== "public") {
	  recipients.push(scheduler_self.options.slots[i]);
	}
      }


      //
      // fetch the module that 
      //
      let invitemod = scheduler_self.options.mods[invite_index];
      invitemod.invite_options = scheduler_self.options;
      if (invitemod.respondTo("scheduler-overlay")) {
	scheduler_self.overlay.hide();
	invitemod.respondTo("scheduler-overlay").render(app, mod);
      }

/****
      let invite_obj =  {
         status         : "open" ,
         type           : "event",
         num            : 2 ,
         date           : datetime ,
         public         : "public" ,
         terms          : "on accept" ,
         //invite_id      : [tx_sig of original invite] ,
         adds           : recipients,
         //terms          : ["on accept", "on accept"] ,
       }

      invitemod.createOpenTransaction(app.wallet.returnPublicKey(), invite_obj);

****/
      alert("Schedule type: "+type+" - when: "+datetime+" UTC "+this.options.default_utc_value);

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

