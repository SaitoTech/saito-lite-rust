const SaitoCalendarTemplate = require("./saito-calendar.template");
const UIModTemplate = require("./../../../templates/uimodtemplate");
const SaitoCalendarPopup = require("./saito-calendar-popup");


class SaitoCalendar {

  constructor(app, mod, container = "") {

    this.app = app;
    this.mod = mod;
    this.name = "SaitoCalendar";
    this.size = "small";
    this.date = new Date();
    this.container = container;

    this.events = [];

    //
    // re-render when event received
    //
    this.app.connection.on('event-render-request', (tx) => {

      console.log("RECEIVED EVENT RENDER REQUEST");
      let txmsg = tx.returnMessage();
      console.log("TXMSG: " + JSON.stringify(txmsg));

      let txmsg_json = JSON.stringify(txmsg);
      let new_event = 1;

      for (let i = 0; i < this.events.length; i++) {
        if (JSON.stringify(this.events[i]) !== txmsg_json) {
          new_event = 0;
          break;
        }
      }

      if (new_event) { this.events.push(txmsg); }

      this.render();

    });

  }


  render() {

    let app = this.app;
    let mod = this.mod;

    let calclass = `.saito-calendar.${this.size}`;

    if (!document.querySelector(calclass)) {
      app.browser.addElementToSelector(SaitoCalendarTemplate(app, mod, this.size), this.container);
    } else {
      app.browser.replaceElementBySelector(SaitoCalendarTemplate(app, mod, this.size), ".saito-calendar");
    }

    let calobj = document.querySelector(calclass);
    calobj.innerHTML = this.returnCalendarTemplate();

    this.renderCalendar();
    this.attachEvents(app, mod);

  }

  renderCalendar() {

    let state = this.returnCalendarState();

    state.monthDays = document.querySelector(".saito-calendar-days");

    state.lastDay = new Date(
      this.date.getFullYear(),
      this.date.getMonth() + 1,
      0
    ).getDate();

    state.prevLastDay = new Date(
      this.date.getFullYear(),
      this.date.getMonth(),
      0
    ).getDate();

    state.firstDayIndex = new Date(
      this.date.getFullYear(),
      this.date.getMonth(),
      1
    ).getDay();

    state.lastDayIndex = new Date(
      this.date.getFullYear(),
      this.date.getMonth() + 1,
      0
    ).getDay();

    state.nextDays = 7 - state.lastDayIndex - 1;

    //
    // and update HTML
    //
    document.querySelector(".saito-calendar-date h4").innerHTML = state.months[this.date.getMonth()];
    document.querySelector(".saito-calendar-date p").innerHTML = this.date.getFullYear();

    let days = "";
    for (let x = state.firstDayIndex; x > 0; x--) {
      days += `<div class="saito-calendar-day prev-date">${state.prevLastDay - x + 1}</div>`;
    }

    for (let i = 1; i <= state.lastDay; i++) {

      if (
        i === new Date().getDate() &&
        this.date.getMonth() === new Date().getMonth()
      ) {
        days += `<div class="saito-calendar-day today" data-id="${i}"><span class="saito-calendar-day-date">${i} </span> <span> <i class="saito-calendar-day-icon fas fa-gamepad">  </i> </span></div>`;
      } else {
        days += `<div class="saito-calendar-day" data-id="${i}">${i}</div>`;

      }

    }



    for (let j = 1; j <= state.nextDays; j++) {
      days += `<div class="saito-calendar-day next-date">${j}</div>`;
    }
    state.monthDays.innerHTML = days;


  }



  attachEvents(app, mod) {

    document.querySelector(".saito-calendar-prev").addEventListener("click", () => {
      this.date.setMonth(this.date.getMonth() - 1);
      this.renderCalendar();
    });

    document.querySelector(".saito-calendar-next").addEventListener("click", () => {
      this.date.setMonth(this.date.getMonth() + 1);
      this.renderCalendar();
    });


    document.querySelectorAll(".saito-calendar-day").forEach(el => {
      el.onclick = (e) => {

        let state = this.returnCalendarState();
        let year = this.date.getFullYear();
        let month = state.months[this.date.getMonth()];
        let day = el.getAttribute("data-id");

        let calpop = new SaitoCalendarPopup(app, mod, day, month, year, this.events);
        calpop.render(day, month, year, this.events);

      }
    });

  }


  returnCalendarState() {
    return {
      monthDays: "",
      lastDay: "",
      prevLastDay: "",
      firstDayIndex: "",
      lastDayIndex: "",
      nextDays: "",
      months: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ]
    };
  }

  returnCalendarTemplate() {
    return `


        <div class="saito-calendar-month">
          <i class="fas fa-angle-left saito-calendar-prev"></i>
          <div class="saito-calendar-date">
            <div>
              <h4>December</h4>
              <p>2022</p>
            </div>
          </div>
          <i class="fas fa-angle-right saito-calendar-next"></i>
        </div>
        <div class="saito-calendar-weekdays">
          <div>S</div>
          <div>M</div>
          <div>Tu</div>
          <div>W</div>
          <div>Th</div>
          <div>F</div>
          <div>Sat</div>
        </div>
        <div class="saito-calendar-days">
      </div>


    `;
  }

}

module.exports = SaitoCalendar;


