const SaitoCalendarTemplate = require("./saito-calendar.template");
const UIModTemplate = require("./../../../templates/uimodtemplate");

class SaitoCalendar {

  constructor(app, mod, selector="") {

    this.app = app;
    this.name = "SaitoCalendar";
    this.size = "small";
    this.date = new Date();
    this.selector = selector;

  }


  render(app, mod, selector = "") {

    let calclass = `.saito-calendar.${this.size}`;

    if (!document.querySelector(calclass)) {
      if (selector == "" && this.selector != "") {
        app.browser.addElementToSelector(SaitoCalendarTemplate(app, mod, this.size), selector);
      } else {
        app.browser.addElementToSelector(SaitoCalendarTemplate(app, mod, this.size), selector);
      }
    }

    let calobj = document.querySelector(calclass);

    //
    // reset calendar to default
    //   
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

    state.firstDayIndex = this.date.getDay();

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
        days += `<div class="saito-calendar-day today">${i}</div>`;
      } else {
        days += `<div class="saito-calendar-day">${i}</div>`;
      }
    }

    for (let j = 1; j <= state.nextDays; j++) {
      days += `<div class="saito-calendar-day next-date">${j}</div>`;
      state.monthDays.innerHTML = days;
    }

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


