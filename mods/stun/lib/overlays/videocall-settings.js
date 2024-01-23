const SaitoOverlay = require('../../../../lib/saito/ui/saito-overlay/saito-overlay');
const VideoCallSettingsTemplate = require('./videocall-settings.template');

class VideoCallSettings {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.saitoOverlay = new SaitoOverlay(app, mod);
	}

	render(display_mode) {
		this.saitoOverlay.show(
			VideoCallSettingsTemplate(display_mode, this.mod)
		);
		this.attachEvents();
	}

	attachEvents() {
		this_self = this;
		Array.from(
			document.querySelectorAll('.videocall-option-input')
		).forEach((option) => {
			option.onchange = (e) => {
				let choice = e.currentTarget.getAttribute('value');
				this_self.app.connection.emit('stun-switch-view', choice);
				this_self.saitoOverlay.remove();
			};
		});

		if (document.querySelector('.share-control')) {
			document.querySelector('.share-control').onclick = (e) => {
				e.preventDefault();
				e.stopPropagation();
				if (this_self.mod.screen_share) {
					console.log('Emit event to stop');
					this_self.app.connection.emit('stop-share-screen');
				} else {
					console.log('Emit event to start');
					this_self.app.connection.emit('begin-share-screen');
				}
				this_self.saitoOverlay.remove();
			};
		}

		if (document.querySelector('.advanced-settings-link')) {
			document.querySelector('.advanced-settings-link').onclick = (e) => {
				let anotherOverlay = new SaitoOverlay(this.app, this.mod);
				anotherOverlay.show(
					'<div class="videocall-setting-grid-item saito-module-settings"></div>'
				);
				this.mod.loadSettings('.saito-module-settings');
			};
		}
	}
}

module.exports = VideoCallSettings;
