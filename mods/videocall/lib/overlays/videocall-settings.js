const SaitoOverlay = require('../../../../lib/saito/ui/saito-overlay/saito-overlay');
const VideoCallSettingsTemplate = require('./videocall-settings.template');

class VideoCallSettings {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.saitoOverlay = new SaitoOverlay(app, mod);
	}

	render() {
		this.saitoOverlay.show(VideoCallSettingsTemplate(this.mod, this.app));
		this.mod.loadSettings('.videocall-setting-grid-item');

		this.attachEvents();
	}

	attachEvents() {
		this_self = this;

		Array.from(document.querySelectorAll('.videocall-option-input')).forEach((option) => {
			option.onchange = (e) => {
				let choice = e.currentTarget.getAttribute('value');
				this_self.app.connection.emit('stun-switch-view', choice);

				this_self.app.options.stun.settings.layout = choice;
				this_self.app.storage.saveOptions();

				this_self.saitoOverlay.remove();
			};
		});

	}
}

module.exports = VideoCallSettings;
