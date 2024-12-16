const saito = require('./../../../saito/saito');
const SaitoCalendarTemplate = require('./saito-calendar.template');
const SaitoCalendarPopup = require('./saito-calendar-popup');


class SaitoCalendar {
	constructor(app, mod, container = '') {
		this.app = app;
		this.mod = mod;
		this.name = 'SaitoCalendar';
		this.size = 'small';
		this.date = new Date();

		this.container = container;
		this.state = null;

		this.events = [];

		//
		// re-render when event received
		//
		this.app.connection.on('calendar-add-event-from-transaction', (tx) => {
			let txmsg = {};
			//
			// possibly not tx
			//
			if (!tx) {
				txmsg = { invite: tx };
			} else {
				txmsg = tx.returnMessage();
			}
			let invite = txmsg.invite;
			let invite_json = JSON.stringify(invite);
			let new_event = 1;
			for (let i = 0; i < this.events.length; i++) {
				if (JSON.stringify(this.events[i]) !== invite_json) {
					new_event = 0;
					break;
				}
			}
			if (new_event) {
				this.events.push(invite);
			}
			this.render();
		});


		this.app.connection.on('calendar-refresh-request', () => {
			this.render();
		});
	}


	render() {
		let app = this.app;
		let mod = this.mod;

		this.events = this.app.keychain.returnKeys({ type: "event" });

		let calclass = `.saito-calendar.${this.size}`;
		if (!document.querySelector(calclass)) {
			app.browser.addElementToSelector(
				SaitoCalendarTemplate(app, mod, this.size),
				this.container
			);
		} else {
			app.browser.replaceElementBySelector(
				SaitoCalendarTemplate(app, mod, this.size),
				'.saito-calendar'
			);
		}

		let calobj = document.querySelector(calclass);
		calobj.innerHTML = this.returnCalendarTemplate();

		//
		// render calendar
		//
		this.renderCalendar();
		this.addCalendarEvents();
		this.attachEvents();
	}

	addCalendarEvents() {
		//
		// current month and year
		//
		let cy = this.date.getFullYear();
		let cm = this.date.getMonth() + 1;
		let cm_name = this.state.months[this.date.getMonth()];

		//
		// and add events
		//
		for (let z = 0; z < this.events.length; z++) {
			let invite = this.events[z];
			if (this.events[z].invite) {
				invite = this.events[z].invite;
			}

			console.log("*************");
			console.log(invite);

			let pd = new Date(invite.startTime);
			let d = this.app.browser.formatDate(pd.getTime());
			let em = d.month;
			let ey = d.year;
			let ed = d.day;

			if (ey == cy && em == cm_name) {
				let qs = `.saito-calendar-day-${ed}`;
				let obj = document.querySelector(qs);
				obj.innerHTML = `<span class="saito-calendar-day-date">${ed}</span><span> <i class="far fa-calendar-check"></i></span>`;
			}
		}
	}

	renderCalendar() {
		this.state = this.returnCalendarState();
		this.state.monthDays = document.querySelector('.saito-calendar-days');
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
		document.querySelector('.saito-calendar-date .month').innerHTML =
			this.state.months[this.date.getMonth()];
		document.querySelector('.saito-calendar-date .year').innerHTML =
			this.date.getFullYear();

		let days = '';
		for (let x = this.state.firstDayIndex; x > 0; x--) {
			days += `<div class="saito-calendar-day prev-date">${this.state.prevLastDay - x + 1
				}</div>`;
		}

		for (let i = 1; i <= this.state.lastDay; i++) {
			if (
				i === new Date().getDate() &&
				this.date.getMonth() === new Date().getMonth()
			) {
				days += `<div class="saito-calendar-day saito-calendar-day-${i} today" data-id="${i}">${i}</span></div>`;
			} else {
				days += `<div class="saito-calendar-day saito-calendar-day-${i}" data-id="${i}">${i}</div>`;
			}
		}

		for (let j = 1; j <= this.state.nextDays; j++) {
			days += `<div class="saito-calendar-day next-date">${j}</div>`;
		}
		this.state.monthDays.innerHTML = days;
	}

	clearEvents() {
		document.querySelectorAll('.saito-calendar-day').forEach((el) => {
			el.onclick = (e) => { };
		});
		document.querySelectorAll('.saito-calendar-prev').forEach((el) => {
			el.onclick = (e) => { };
		});
		document.querySelectorAll('.saito-calendar-next').forEach((el) => {
			el.onclick = (e) => { };
		});
	}

	attachEvents() {
		let app = this.app;
		let mod = this.mod;

		document.querySelectorAll('.saito-calendar-prev').forEach((el) => {
			el.onclick = (e) => {
				this.clearEvents();
				this.date.setMonth(this.date.getMonth() - 1);
				this.renderCalendar();
				this.addCalendarEvents();
				this.attachEvents();
			};
		});

		document.querySelectorAll('.saito-calendar-next').forEach((el) => {
			el.onclick = (e) => {
				this.clearEvents();
				this.date.setMonth(this.date.getMonth() + 1);
				this.renderCalendar();
				this.addCalendarEvents();
				this.attachEvents();
			};
		});

		document.querySelectorAll('.saito-calendar-day').forEach((el) => {
			el.onclick = (e) => {
				let year = this.date.getFullYear();
				let month_as_num = this.date.getMonth() + 1;
				let month = this.state.months[this.date.getMonth()];
				let day = el.getAttribute('data-id');

				const selectedDay = {
					day,
					month,
					month_as_num,
					year
				}

				console.log(selectedDay);

				if (!day) {
					return;
				}

				let events_today = this.generateTodaysEvents(selectedDay);

				let calpop = new SaitoCalendarPopup(
					app,
					mod,
					day,
					month,
					month_as_num,
					year,
					events_today
				);
				calpop.render(day, month, year, events_today);

			};
		});

		//
		// these overwrite above event
		//
		document
			.querySelectorAll('.saito-calendar-day.next-date')
			.forEach((el) => {
				el.onclick = (e) => {
					document.querySelector('.saito-calendar-next').click();
				};
			});

		document
			.querySelectorAll('.saito-calendar-day.prev-date')
			.forEach((el) => {
				el.onclick = (e) => {
					document.querySelector('.saito-calendar-prev').click();
				};
			});
	}

	returnCalendarState() {
		return {
			monthDays: '',
			lastDay: '',
			prevLastDay: '',
			firstDayIndex: '',
			lastDayIndex: '',
			nextDays: '',
			months: [
				'January',
				'February',
				'March',
				'April',
				'May',
				'June',
				'July',
				'August',
				'September',
				'October',
				'November',
				'December'
			]
		};
	}

	returnCalendarTemplate() {
		return `
        <div class="saito-calendar-month">
          <i class="fas fa-angle-left saito-calendar-prev"></i>
          <div class="saito-calendar-date">
            <span class="month">December</span>
            <span class="year">2022</span>
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

	generateTodaysEvents(obj) {

		let {day, month, month_as_num, year} = obj;
		let events_today = [];

		//
		// and add events
		//
		for (let z = 0; z < this.events.length; z++) {
			let invite = this.events[z];

			if (this.events[z].invite) {
				invite = this.events[z].invite;
			}

			let d = new Date(invite.startTime);
			let m = d.getMonth() + 1;
			let y = d.getFullYear();
			let fd = this.app.browser.formatDate(d.getTime());
			let ed = fd.day;

			if (
				y == year &&
				month_as_num == m &&
				parseInt(ed) === parseInt(day)
			) {
				events_today.push(this.events[z]);
			}
		}

		return events_today;

	}
}

module.exports = SaitoCalendar;
