const SettingsTemplate = require('./spider-settings.template');

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
			document.querySelectorAll('input[name=\'spider-difficulty\']')
		).forEach((radio) => {
			radio.addEventListener('change', (e) => {
				if (
					e.currentTarget.value !==
					this.mod.loadGamePreference('spider-difficulty')
				) {
					if (this.mod.browser_active){
						this.mod.changeDifficulty(e.currentTarget.value);	
					}else{
						this.mod.saveGamePreference('spider-difficulty', e.currentTarget.value);
					}
				}
			});
		});

		Array.from(
			document.querySelectorAll('input[name=\'play_mode\']')
		).forEach((radio) => {
			radio.addEventListener('change', (e) => {
				console.log("Update play mode: ", e.currentTarget.value, this.mod.loadGamePreference('spider-play-mode'));
				if (
					e.currentTarget.value !==
					this.mod.loadGamePreference('spider-play-mode')
				) {
					this.mod.saveGamePreference("spider-play-mode", e.currentTarget.value);
					this.mod.attachEventsToBoard();
				}
			});
		});
	}
}

module.exports = Settings;
