const EffectsTemplate = require('./effects.template');
const SaitoOverlay = require('../../../../lib/saito/ui/saito-overlay/saito-overlay');

class Effects {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(app, mod);
		this.blurIntensity = 2;
	}

	render() {
		this.overlay.show(EffectsTemplate(this.app, this.mod));
		this.attachEvents();
	}

	attachEvents() {
		try {
			if (document.querySelector('#apply-blur-background')) {
				document.querySelector('#apply-blur-background').onclick = (
					e
				) => {
					console.log('appying blur');
					this.overlay.remove();
					applyBlur(1);
				};
			}
		} catch (err) {
			console.error(err);
		}
	}
}

module.exports = Effects;
