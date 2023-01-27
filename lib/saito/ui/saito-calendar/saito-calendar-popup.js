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

  attachEvents() {
  }

}


module.exports = SaitoCalendarPopup;

