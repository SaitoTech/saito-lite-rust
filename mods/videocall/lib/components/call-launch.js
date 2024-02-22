const SaitoOverlay = require('../../../../lib/saito/ui/saito-overlay/saito-overlay.js');
const StunLaunchTemplate = require('./call-launch.template.js');
const CallSetting = require('../components/call-setting.js');
const SaitoLoader = require('../../../../lib/saito/ui/saito-loader/saito-loader.js');

/**
 *
 * This is a splash screen for initiating a Saito Video call
 *
 **/

class CallLaunch {
	constructor(app, mod, container = '') {
		this.app = app;
		this.mod = mod;
		this.container = container;
		this.overlay = new SaitoOverlay(app, mod);
		this.callSetting = new CallSetting(app, this);

		//
		//this looks a lot better if it is in the dom structure
		//
		// this.loader = new SaitoLoader(app, mod, ".stunx-appspace-splash");

		//
		// close-preview-window *also* shuts down the streams in call-settings
		//
		app.connection.on('close-preview-window', () => {
			this.overlay.remove();
			if (document.querySelector('.stun-appspace')) {
				document.querySelector('.stun-appspace').remove();
			}
		});
	}

	render() {
		if (document.querySelector('.stun-appspace')) {
			return;
		}
		if (this.container === '.saito-overlay') {
			this.overlay.show(StunLaunchTemplate(this.app, this.mod), () => {
				//Stop the video if we close the overlay
				this.app.connection.emit('close-preview-window');
			});
		} else if (this.container === 'body') {
			this.app.browser.addElementToDom(
				StunLaunchTemplate(this.app, this.mod)
			);
		}

		//
		// We should be able to toggle our video/audio controls
		// Do not make it a blocking loader
		//

		this.attachEvents(this.app, this.mod);

		this.callSetting.render();
	}

	attachEvents(app, mod) {
		if (document.getElementById('createRoom')) {
			document.getElementById('createRoom').onclick = (e) => {
				//
				// Set big screen video as desired call interface
				//
				this.app.connection.emit('stun-init-call-interface', 'large');

				if (!this.mod.isRelayConnected) {
					siteMessage('Wait for peer connection');
					return;
				}

				//
				// I am initializing the call
				//
				if (!this.mod.room_obj) {
					this.mod.room_obj = {
						call_id: this.mod.createRoomCode(),
						host_public_key: this.mod.publicKey
					};
				}

				//
				//Close this component
				//
				this.app.connection.emit('close-preview-window');
				//
				// Start the stun call
				//
				this.app.connection.emit('start-stun-call');
			};
		}
	}
}

module.exports = CallLaunch;
