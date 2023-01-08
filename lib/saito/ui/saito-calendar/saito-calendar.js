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
    this.state = null;

    this.events = [];

    //
    // re-render when event received
    //
    this.app.connection.on('event-render-request', (tx) => {

	console.log("========");
	console.log("========");
	console.log("========");
      console.log("RECEIVED EVENT RENDER REQUEST IN CALENDAR");
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

    //
    // render calendar
    //
    this.renderCalendar();

    //
    // current month and year
    //
    let cy = this.date.getFullYear();
    let cm = this.date.getMonth() + 1;

    //
    // and add events
    //
    for (let z = 0; z < this.events.length; z++) {
console.log("datetime of event: " + this.events[z].invite.datetime);
      let d = new Date(this.events[z].invite.datetime);
console.log("DATE of EVENT: " + d.getTime());
      let m = d.getMonth() + 1;
      let y = d.getFullYear();
console.log(m + " -- " + y);
      if (y == cy && m == cm) {

console.log("match: ");
	let ed = d.getDay();
console.log("day: " + ed);
	let qs = `.saito-calendar-day-${ed}`;
console.log("qs: " + qs);
        let obj = document.querySelector(qs);
console.log("current: " + obj.innerHTML);
       obj.innerHTML = `<span class="saito-calendar-day-date">${z}</span><span> <i class="saito-calendar-day-icon fas fa-gamepad"></i></span>`;
console.log("done!");

      }
    }


    this.attachEvents();

  }

  renderCalendar() {

    this.state = this.returnCalendarState();

    this.state.monthDays = document.querySelector(".saito-calendar-days");

    this.state.lastDay = new Date(
      this.date.getFullYear(),
      this.date.getMonth() + 1,
      0
    ).getDate();

    this.state.prevLastDay = new Date(
      this.date.getFullYear(),
      this.date.getMonth(),
      0
    ).getDate();

    this.state.firstDayIndex = new Date(
      this.date.getFullYear(),
      this.date.getMonth(),
      1
    ).getDay();

    this.state.lastDayIndex = new Date(
      this.date.getFullYear(),
      this.date.getMonth() + 1,
      0
    ).getDay();

    this.state.nextDays = 7 - this.state.lastDayIndex - 1;

    //
    // and update HTML
    //
    document.querySelector(".saito-calendar-date h4").innerHTML = this.state.months[this.date.getMonth()];
    document.querySelector(".saito-calendar-date p").innerHTML = this.date.getFullYear();

    let days = "";
    for (let x = this.state.firstDayIndex; x > 0; x--) {
      days += `<div class="saito-calendar-day prev-date">${this.state.prevLastDay - x + 1}</div>`;
    }

    for (let i = 1; i <= this.state.lastDay; i++) {
      if (i === new Date().getDate() && this.date.getMonth() === new Date().getMonth()) {
        days += `<div class="saito-calendar-day saito-calendar-day-${i} today" data-id="${i}"><span class="saito-calendar-day-date">${i} </span> <span> <i class="saito-calendar-day-icon fas fa-gamepad">  </i> </span></div>`;
      } else {
        days += `<div class="saito-calendar-day saito-calendar-day-${i}" data-id="${i}">${i}</div>`;
      }
    }

    for (let j = 1; j <= this.state.nextDays; j++) {
      days += `<div class="saito-calendar-day next-date">${j}</div>`;
    }
    this.state.monthDays.innerHTML = days;

  }



  attachEvents() {

    let app = this.app;
    let mod = this.mod;

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

        let year = this.date.getFullYear();
        let month_as_num = this.date.getMonth() + 1;
        let month = this.state.months[this.date.getMonth()];
        let day = el.getAttribute("data-id");

        let events_today = [];

        //
        // and add events
        //
        for (let z = 0; z < this.events.length; z++) {
console.log("datetime of event: " + this.events[z].invite.datetime);

          let d = new Date(this.events[z].invite.datetime);
console.log("DATE of EVENT: " + d.getTime());
          let m = d.getMonth() + 1;
          let y = d.getFullYear();
          let ed = d.getDay();

console.log(m + " -- " + y);
          if (y == year && month_as_num == cm && parseInt(ed) === parseInt(day)) {

console.log("match!");
            events_today.push(this.events[z]);

	  }
	}

        let calpop = new SaitoCalendarPopup(app, mod, day, month, year, events_today);
        calpop.render(day, month, year, events_today);

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


