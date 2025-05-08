const SettingsTemplate = require('./poker-settings.template');

class Settings {
	constructor(app, mod, container = '.saito-module-settings') {
		this.app = app;
		this.mod = mod;
		this.container = container;
	}

	render() {
		this.app.browser.addElementToSelector(
			SettingsTemplate(this.app, this.mod),
			this.container
		);
		this.attachEvents();
	}

	attachEvents() {
		let settings_self = this;

		Array.from(
			document.querySelectorAll('input[name=\'board\']')
		).forEach((radio) => {
			radio.addEventListener('change', (e) => {
				this.mod.theme = e.currentTarget.value;
				this.mod.saveGamePreference("poker-theme", this.mod.theme);
				if (this.mod.browser_active){
					this.mod.board.toggleView();
				}
			});
		});


		Array.from(
			document.querySelectorAll('input[name=\'card_backs\']')
		).forEach((radio) => {
			radio.addEventListener('change', (e) => {

				this.mod.card_img = e.currentTarget.value;
				this.mod.saveGamePreference('poker-cards', this.mod.card_img);
				if (this.mod.browser_active){
					this.mod.board.render();
				}

			});
		});
	
		Array.from(
			document.querySelectorAll('input[name=\'table_felt\']')
		).forEach((radio) => {
			radio.addEventListener('change', (e) => {

				this.mod.felt = e.currentTarget.value;
				this.mod.saveGamePreference('poker-felt', this.mod.felt);
				if (this.mod.browser_active){
					this.mod.board.changeFelt();
				}

			});
		});

		if (document.getElementById('show-player-pot')) {
		document
			.getElementById('show-player-pot')
			.addEventListener('change', (e) => {
				if (e.currentTarget.checked) {
					this.mod.saveGamePreference('poker-hide-pot', false);
				} else {
					this.mod.saveGamePreference('poker-hide-pot', true);
				}
			});
		}

	}
}

module.exports = Settings;
