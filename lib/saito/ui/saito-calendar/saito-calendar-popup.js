const SaitoOverlay = require('./../saito-overlay/saito-overlay');
const SaitoCalendarPopupTemplate = require('./saito-calendar-popup.template');
// const SaitoScheduler = require('./../saito-scheduler/saito-scheduler');
const SaitoScheduler = require('./saito-scheduler');

class SaitoCalendarPopup {
	constructor(app, mod, day, month, year, events) {
		this.app = app;
		this.mod = mod;
		this.name = 'CalendarPopup';
		this.day = day;
		this.month = month;
		this.year = year;
		this.overlay = new SaitoOverlay(app, mod);
		this.saitoScheduler = new SaitoScheduler(app, mod, ".saito-calendar-event-actions");
	}


	
	render(day = '', month = '', year = '', events = []) {
		let app = this.app;
		let mod = this.mod;
		this.overlay.show(
			SaitoCalendarPopupTemplate(app, mod, day, month, year, events)
		);
		this.attachEvents();
		this.saitoScheduler.render()
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
