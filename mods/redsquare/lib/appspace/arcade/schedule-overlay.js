const ScheduleOverlayTemplate = require("./schedule-overlay.template");
const SaitoOverlay = require("./../../../../../lib/saito/new-ui/saito-overlay/saito-overlay");

class SchedulerOverlay {

  constructor(app, mod) {
    this.app 		= app;
    this.name 		= "SchedulerOverlay";
    this.overlay = new SaitoOverlay(this.app);
  }

  render(app, mod, selector="") {
    if (selector === "") { selector = ".saito-container"; }

    app.browser.addElementToSelector(ScheduleOverlayTemplate(app, mod), selector);
    this.attachEvents(app, mod);
  }

  attachEvents(app, mod){
    document.body.addEventListener( 'click', function ( event ) {
      // if( event.target.id == 'scheduler-overlay-next-btn' ) {
      //   // get input values
      //   let eventDatetime = document.getElementById("schedule-datetime").value;
      //   let eventType = document.querySelector('input[name="schedule-type"]').value;
      //   let eventGame = document.querySelector('input[name="game"]:checked').value;
       
      //   let msg = eventGame + " scheduled for: " + eventDatetime;
      //   app.browser.addElementToClass(msg, 'schedule-msg');

      //   document.getElementById("first-step").classList.add("hide");
      //   document.getElementById("second-step").classList.remove("hide");

      // } else if (event.target.id == 'scheduler-overlay-back-btn') {
      //     console.log('inisde back btn click');
      //     document.getElementById("first-step").classList.remove("hide");
      //     document.getElementById("second-step").classList.add("hide");
      // }

    });
  }

}

module.exports = SchedulerOverlay;

