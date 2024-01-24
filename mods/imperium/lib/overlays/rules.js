const ImperiumRulesOverlayTemplate = require('./rules.template');
const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');

class RulesOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(this.app, this.mod, false);
	}

	render() {
		this.overlay.show(ImperiumRulesOverlayTemplate());

		this.attachEvents();
	}

	attachEvents() {
		let game_mod = this.mod;

		$('.menu-item').on('click', function () {
			let player_action = $(this).attr('id');

			switch (player_action) {
			case 'basic':
				game_mod.handleHowToPlayMenuItem();
				break;
			case 'movement':
				game_mod.overlay.show(game_mod.returnUnitsOverlay());
				break;
			case 'production':
				game_mod.overlay.show(
					'<div style="margin-left:auto;margin-right:auto;width:auto;height:90vh"><img src="/imperium/img/tutorials/production.png" style="width:auto; height:90vh;" /></div>'
				);
				break;
			case 'combat':
				game_mod.combat_overlay.render();
				break;
			case 'factions':
				game_mod.factions_overlay.render();
				break;
			default:
				break;
			}
		});
	}
}

module.exports = RulesOverlay;
