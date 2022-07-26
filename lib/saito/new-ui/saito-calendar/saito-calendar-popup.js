const SaitoOverlay = require('./../saito-overlay/saito-overlay');
const SaitoCalendarPopupTemplate = require('./saito-calendar-popup.template');


class SaitoCalendarPopup {

  constructor(app, mod, day, month, year) {
    this.app = app;
    this.name = "CalendarPopup";
    this.day = day;
    this.month = month;
    this.year = year;
    this.overlay = new SaitoOverlay(app, mod);
  }

  render(app, mod, day, month, yeah) {
    this.overlay.show(app, mod, SaitoCalendarPopupTemplate(app, mod));
    this.attachEvents(app, mod);
  }

  attachEvents(app, mod) {
  }

}


module.exports = SaitoCalendarPopup;

