const SettingsTemplate = require('./stun-settings.template');

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
			document.querySelectorAll("input[name='stun-privacy']")
		).forEach((radio) => {
			radio.addEventListener('change', (e) => {
				if (
					e.currentTarget.value !==
					this.app.options.stun.settings.privacy
				) {
					this.app.options.stun.settings.privacy =
						e.currentTarget.value;
					this.app.storage.saveOptions();
				}
			});
		});
	}
}

module.exports = Settings;
