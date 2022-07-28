const ScheduleOverlayTemplate = require("./schedule-overlay.template");
const SaitoOverlay = require("./../../../../../lib/saito/new-ui/saito-overlay/saito-overlay");

class SchedulerOverlay {

  constructor(app, mod) {
    this.app 		= app;
    this.name 		= "SchedulerOverlay";
    this.overlay        = new SaitoOverlay(this.app);
    this.mycallback     = null;
  }

  render(app, mod, mycallback=null) {
    if (mycallback != null) { this.mycallback = mycallback; }
    this.overlay.show(app, mod, ScheduleOverlayTemplate(app, mod));

    //
    // identify modules that support InviteModTemplate and insert them 
    // into the select somehow.
    //



    this.attachEvents(app, mod, this.mycallback);
  }


  attachEvents(app, mod, mycallback){

    document.getElementById("").onclick = (e) => {

      let data = { timestamp : (new Date().getTime()) };
      if (this.mycallback != null) { this.mycallback(app, mod, data); }
      this.overlay.hide();

    }

  }

}

module.exports = SchedulerOverlay;

