const SaitoOverlay = require('./../../../lib/saito/ui/saito-overlay/saito-overlay');
const ThemeSwitcherOverlayTemplate = require('./theme-switcher-overlay.template');

class ThemeSwitcherOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(app, mod, false, true);
	}

	render() {
		let mod_obj = this.app.modules.returnActiveModule();
		let selected_theme = '';
		if (this.app.options.theme) {
			selected_theme = this.app.options.theme[mod_obj.returnSlug()];
		}
		this.overlay.show(
			ThemeSwitcherOverlayTemplate(
				this.app,
				this.mod,
				mod_obj.theme_options,
				selected_theme
			)
		);
		this.attachEvents();
	}

	attachEvents() {
		this_self = this;
		document
			.querySelectorAll('.saito-modal-menu-option')
			.forEach(function (elem) {
				elem.addEventListener('click', function (e) {
					let theme = e.currentTarget.getAttribute('data-theme');
					if (theme != null) {
						this_self.app.browser.switchTheme(theme);
						this_self.overlay.remove();
					}
				});
			});
	}
}

module.exports = ThemeSwitcherOverlay;
