const SettingsTemplate = require('./settings-settings.template');

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
	
		document.getElementById("show").addEventListener('change', (e) => {
			if (e.currentTarget.checked){
				settings_self.app.options.settings.debug = true;
			}else{
				settings_self.app.options.settings.debug = false;
			}

			settings_self.app.modules.mods.forEach(m => {
				m.debug = settings_self.app.options.settings.debug;
			});

			settings_self.app.storage.saveOptions();
		});

	}
}

module.exports = Settings;
