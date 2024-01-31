const ImperiumAgendaSelectionOverlayTemplate = require('./agenda-selection.template');
const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');

class AgendaSelectionOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(this.app, this.mod, false);
		this.overlay.clickToClose = false;
	}

	hide() {
		this.overlay.hide();
	}

	render(
		available_agendas,
		selected_agendas,
		num_to_select,
		mycallback,
		removal_callback
	) {
		let agendas = this.mod.returnAgendaCards();

		this.overlay.show(ImperiumAgendaSelectionOverlayTemplate());
		this.overlay.setBackground(
			'/imperium/img/backgrounds/agenda-selection-background.png',
			false
		);

		for (let i = 0; i < available_agendas.length; i++) {
			let a = agendas[available_agendas[i]];
			this.app.browser.addElementToSelector(
				a.returnCardImage(),
				'.agenda-selection-cards'
			);
			if (selected_agendas.includes(available_agendas[i])) {
				let el = document.querySelector('#' + available_agendas[i]);
				el.classList.add('opaque');
				el.classList.remove('nonopaque');
			} else {
				let el = document.querySelector(
					'.agenda-selection-cards .' + available_agendas[i]
				);
				el.classList.remove('opaque');
				el.classList.add('nonopaque');
			}
		}

		this.attachEvents(
			available_agendas,
			selected_agendas,
			num_to_select,
			mycallback,
			removal_callback
		);
	}

	attachEvents(
		available_agendas,
		selected_agendas,
		num_to_select,
		mycallback,
		removal_callback
	) {
		document
			.querySelectorAll('.agenda-selection-cards .card')
			.forEach((el) => {
				el.onclick = (e) => {
					if (el.classList.contains('opaque')) {
						el.classList.add('nonopaque');
						el.classList.remove('opaque');
						removal_callback(e.currentTarget.id);
					} else {
						el.classList.add('opaque');
						mycallback(e.currentTarget.id);
					}
				};
			});
	}
}

module.exports = AgendaSelectionOverlay;
