const SettingsTemplate = require('./settlers-settings.template');

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
			document.querySelectorAll('input[name=\'confirm_moves\']')
		).forEach((radio) => {
			radio.addEventListener('change', (e) => {
				if (
					e.currentTarget.value !=
					this.mod.loadGamePreference('settlers_confirm_moves')
				) {
					this.mod.saveGamePreference('settlers_confirm_moves', parseInt(e.currentTarget.value));
				}
			});
		});

		Array.from(
			document.querySelectorAll('input[name=\'overlays\']')
		).forEach((radio) => {
			radio.addEventListener('change', (e) => {
				if (
					e.currentTarget.value !=
					this.mod.loadGamePreference('settlers_overlays')
				) {
					this.mod.saveGamePreference("settlers_overlays", parseInt(e.currentTarget.value));
				}
			});
		});
	}
}

module.exports = Settings;
