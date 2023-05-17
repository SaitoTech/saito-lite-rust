const SaitoSchedulerTemplate = require("./saito-scheduler.template");
const SaitoOverlay = require("./../saito-overlay/saito-overlay");
const SaitoInviter = require("./../saito-inviter/saito-inviter");

class SaitoScheduler {
  constructor(app, mod, options = { date: new Date(), tx: null, title: "New Event", adds: [] }) {
    this.app = app;

    this.name = "SaitoScheduler";

    this.tx = options.tx; // what we are scheduling, possibly a game invitation?
    this.title = options.title;
    this.overlay = new SaitoOverlay(app);
    this.mycallback = null;
    this.options = {};
    this.options.adds = [];
    for (let z = 0; z < options.adds.length; z++) {
      if (!this.options.adds.includes(options.adds[z])) {
        this.options.adds.push(options.adds[z]);
      }
    }
    this.options.datetime = 0;
    this.options.title = this.title;
    let d = options.date;
    if (!d) {
      d = new Date();
    }
    let utcOffset = d.getTimezoneOffset(); // returns offset in minutes

    this.options.date = d;
    this.options.default_utc_offset = -(utcOffset / 60); //convert offset minutes to UTC
    this.options.default_utc_sign = Math.sign(this.options.default_utc_offset) == 1 ? "+" : "-";
    this.options.default_utc_value =
      this.options.default_utc_sign + this.options.default_utc_offset;
  }

  render(mycallback = null) {
    let app = this.app;
    let mod = this.mod;

    if (mycallback != null) {
      this.mycallback = mycallback;
    }
    this.overlay.show(SaitoSchedulerTemplate(app, mod, this.options));
    this.attachEvents(this.mycallback);
  }

  attachEvents(mycallback = null) {
    let app = this.app;
    let mod = this.mod;

    let scheduler_self = this;

    document.querySelector(".saito-scheduler-button").onclick = async (e) => {
      let datetime = document.getElementById("schedule-datetime-input").value;
      let invitemod = app.modules.returnModule("Invites");
      invitemod.resetInviteOptions();

      //
      // set invite datetime
      //
      invitemod.options.datetime = datetime;
      invitemod.options.title = this.options.title;

      //
      // set recipients to approve
      //
      invitemod.addPrivateSlotToInviteOptions(await this.app.wallet.getPublicKey());
      for (let i = 0; i < this.options.adds.length; i++) {
        invitemod.addPrivateSlotToInviteOptions(this.options.adds[i]);
      }
      invitemod.options.num = this.options.adds.length;
      invitemod.options.min = this.options.adds.length;
      invitemod.options.max = this.options.adds.length;

      //
      // and send the invite
      //
      await invitemod.createOpenTransaction(invitemod.options);

      //
      // next steps
      //
      scheduler_self.overlay.hide();
      if (mycallback != null) {
        mycallback();
      }
    };
  }
}

module.exports = SaitoScheduler;
