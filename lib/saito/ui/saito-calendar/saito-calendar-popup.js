const SaitoOverlay = require('./../saito-overlay/saito-overlay');
const SaitoCalendarPopupTemplate = require('./saito-calendar-popup.template');
const SaitoScheduler = require('./../saito-scheduler/saito-scheduler');


class SaitoCalendarPopup {

  constructor(app, mod, day, month, year, events) {
    this.app = app;
    this.mod = mod;
    this.name = "CalendarPopup";
    this.day = day;
    this.month = month;
    this.year = year;
    this.overlay = new SaitoOverlay(app, mod);
  }

  render(day = "", month = "", year = "", events = []) {
    let app = this.app;
    let mod = this.mod;

    this.overlay.show(SaitoCalendarPopupTemplate(app, mod, day, month, year, events));
    this.attachEvents();
  }

  attachEvents(app, mod) {

/*****
//
// this button is removed, but code being kept as scheduling will likely
// be possible in the future from this modal popup!
//
    document.getElementById("invites-new-invite").onclick = (e) => {

      let m = 0;
      if (this.month === "February") 	{ m = 1; }
      if (this.month === "March") 	{ m = 2; }
      if (this.month === "April") 	{ m = 3; }
      if (this.month === "May") 	{ m = 4; }
      if (this.month === "June") 	{ m = 5; }
      if (this.month === "July") 	{ m = 6; }
      if (this.month === "August") 	{ m = 7; }
      if (this.month === "September") 	{ m = 8; }
      if (this.month === "October") 	{ m = 9; }
      if (this.month === "November") 	{ m = 10; }
      if (this.month === "December")	{ m = 11; }

      let options = { date : new Date(this.year, m, this.day) };

      let sc = new SaitoScheduler(app, mod, options);
      sc.render(function(data) {
        //What do we render as a callback?
      });
    }
*****/
  }

}


module.exports = SaitoCalendarPopup;

