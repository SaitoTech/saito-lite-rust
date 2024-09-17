const SaitoOverlay = require('./../saito-overlay/saito-overlay');
const SaitoCalendarPopupTemplate = require('./saito-calendar-popup.template');
const SaitoScheduler = require('./saito-scheduler');

class SaitoCalendarPopup {
	constructor(app, mod, day, month, month_as_num, year, events) {
		this.app = app;
		this.mod = mod;
		this.name = 'CalendarPopup';
		this.day = day;
		this.month = month;
		this.month_as_num = month_as_num
		this.year = year;
		this.overlay = new SaitoOverlay(app, mod);
		this.saitoScheduler = new SaitoScheduler(app, mod, ".saito-calendar-event-actions");

		app.connection.on('calendar-popup-render-request', (events)=> {
			this.render(day, month, year, events)
		}) 

	}

	
	render(day = '', month = '', year = '', events = []) {
		if(!document.querySelector('#saito-modal-calendar')){
			this.overlay.show(
				SaitoCalendarPopupTemplate(this.app, this.mod, day, month, year, events)
			);
		}else {
			this.app.browser.replaceElementBySelector(
				SaitoCalendarPopupTemplate(this.app, this.mod, day, month, year, events),
				'#saito-modal-calendar'
			);
		}	
		this.attachEvents();
		
		this.saitoScheduler.render(day, this.month_as_num, year)
	}

	attachEvents() {
		let tab1Button = document.querySelector('.saito-tab-button.active');
		let tab2Button = document.querySelector('.saito-tab-button:not(.active)');
		
		let tab1Content = document.getElementById('tab1');
		let tab2Content = document.getElementById('tab2');
	
		tab1Button.addEventListener('click', (e) => {
			tab1Button.classList.add('active');
			tab2Button.classList.remove('active');
	
			tab1Content.style.display = 'block';
			tab2Content.style.display = 'none';
		});
	

		tab2Button.addEventListener('click', (e) => {
			tab2Button.classList.add('active');
			tab1Button.classList.remove('active');
			tab2Content.style.display = 'block';
			tab1Content.style.display = 'none';
		});
	}
	
}

module.exports = SaitoCalendarPopup;
