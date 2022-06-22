const SaitoCalendarTemplate = require("./saito-calendar.template");
const UIModTemplate = require("./../../../templates/uimodtemplate");

class SaitoCalendar {

  constructor(app) {

    this.app = app;
    this.name = "SaitoCalendar";
    this.size = "small";
    this.date = new Date();

  }


  render(app, mod, class_container="") {

    let calclass = `.saito-calendar.${this.size}`;

    if (!document.querySelector(calclass)) {
      app.browser.addElementToClass(SaitoCalendarTemplate(app, mod, this.size), class_container);
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

    state.monthDays = document.querySelector(".calendar-days");

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
    document.querySelector(".calendar-date h4").innerHTML = state.months[this.date.getMonth()];
    document.querySelector(".calendar-date p").innerHTML = this.date.getFullYear();

    let days = "";
    for (let x = state.firstDayIndex; x > 0; x--) {
      days += `<div class="prev-date">${state.prevLastDay - x + 1}</div>`;
    }

    for (let i = 1; i <= state.lastDay; i++) {
      if (
        i === new Date().getDate() &&
        this.date.getMonth() === new Date().getMonth()
      ) {
        days += `<div class="today">${i}</div>`;
      } else {
        days += `<div>${i}</div>`;
      }
    }

    for (let j = 1; j <= state.nextDays; j++) {
      days += `<div class="next-date">${j}</div>`;
      state.monthDays.innerHTML = days;
    }

  }



  attachEvents(app, mod) {

    document.querySelector(".calendar-prev").addEventListener("click", () => {
      this.date.setMonth(this.date.getMonth() - 1);
      this.renderCalendar();
    });

    document.querySelector(".calendar-next").addEventListener("click", () => {
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

      <div class="calendar">
        <div class="calendar-month">
          <i class="fas fa-angle-left calendar-prev"></i>
          <div class="calendar-date">
            <div>
              <h4>December</h4>
              <p>2022</p>
            </div>
          </div>
          <i class="fas fa-angle-right calendar-next"></i>
        </div>
        <div class="calendar-weekdays">
          <div>S</div>
          <div>M</div>
          <div>Tu</div>
          <div>W</div>
          <div>Th</div>
          <div>F</div>
          <div>Sat</div>
        </div>
        <div class="calendar-days">
      </div>
    </div>

    `;
  }

}

module.exports = SaitoCalendar;


