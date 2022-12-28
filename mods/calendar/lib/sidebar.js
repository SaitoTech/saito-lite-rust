const CalendarSidebarTemplate = require('./sidebar.template.js');


class CalendarSidebar {

  constructor(app, mod, container="") {
    this.app = app;
    this.mod = mod;
    this.container = container;
  }

  render() {

    if (document.querySelector(".calendar-sidebar")) {
      this.app.browser.replaceElementBySelector(CalendarSidebarTemplate(this.app, this.mod), ".calendar-sidebar");
    } else {
      this.app.browser.addElementToSelectorOrDom(CalendarSidebarTemplate(this.app, this.mod), this.container);
    }

   this.renderMonth();

  }


  attachEvents() {

  }

  renderMonth() {

    let app = this.app;
    let mod = this.mod;

    //
    // convert appointments to calendar event-format
    //
    let uevents = [];
    for (let i = 0; i < mod.appointments.length; i++) {
      let txmsg = mod.appointments[i].returnMessage();
      uevents.push(txmsg);
    }

    var calendarEl = document.getElementById("tiny-calendar-box");
    calendarEl.innerHTML = "";
    var calendar = new FullCalendar.Calendar(calendarEl, {

        fixedWeekCount: false,

        aspectRatio: 1.8,

        contentHeight: "auto",

        plugins: [ 'dayGrid' ],

        events: uevents,

        dayRender:(dayRenderInfo) => {
          dayRenderInfo.el.innerHTML = '<div class="calendar-day"><div class="calendar-day-appointment-num"></div></div>';
          console.log("DAY INFO: " + dayRenderInfo.date);
          dayRenderInfo.el.onclick = () => {

            if (mod.overlay_calendar_active == 1) {
              alert("Clicking on Large Calendar Overlay");
            }

            if (mod.tiny_calendar_active == 1 && mod.overlay_calendar_active == 0) {
              let html = `<div class="large-calendar" id="large-calendar"></div>`;
              mod.overlay.showOverlay(app, mod, html, function() {
                mod.overlay_calendar_active = 0;
                document.getElementById("large-calendar").remove();
                mod.renderLargeCalendar(app, mod);
              });
              mod.renderLargeCalendar(app, mod);
              mod.overlay_calendar_active = 1;
            }

          }
        },
    });

    calendar.render();
    calendar.updateSize();
  }

}

module.exports = CalendarSidebar;

