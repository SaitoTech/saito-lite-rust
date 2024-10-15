const DebatersTemplate = require('./debaters.template');
const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');

class DebatersOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.visible = false;
		this.overlay = new SaitoOverlay(app, mod);
	}

	hide() {
		this.visible = false;
		this.overlay.hide();
	}

	render(faction = '') {
		this.visible = true;
		this.overlay.show(DebatersTemplate());

		for (let i = 0; i < this.mod.game.state.debaters.length; i++) {
			let committed = '';
			if (this.mod.game.state.debaters[i].committed == 1) {
				committed = ' debater-commited';
			}
			this.app.browser.addElementToSelector(
				`<div class="debaters-tile debaters-tile${i} ${committed}" data-key="${this.mod.game.state.debaters[i].key}" data-id="${this.mod.game.state.debaters[i].img}" style="background-image:url('/his/img/tiles/debaters/${this.mod.game.state.debaters[i].img}')"></div>`,
				'.debaters-overlay'
			);
		}

		for (let i = 0; i < this.mod.game.state.debaters.length; i++) {
			let tile_f =
				'/his/img/tiles/debaters/' +
				this.mod.game.state.debaters[i].img;
			let tile_b = tile_f.replace('.svg', '_back.svg');

			let divsq = `.debaters-tile${i}`;

			$(divsq)
				.mouseover(function () {
					$(this).css('background-image', `url('${tile_b}')`);
				})
				.mouseout(function () {
					$(this).css('background-image', `url('${tile_f}')`);
				});
		}

		this.attachEvents();
	}

	attachEvents() {
		let overlay_self = this;
		let his_self = this.mod;
		let protestant_player = his_self.returnPlayerOfFaction('protestant');
		let papacy_player = his_self.returnPlayerOfFaction('papacy');
		if (
			his_self.game.player != protestant_player &&
			his_self.game.player != papacy_player
		) {
			return;
		}

		let faction = 'protestant';
		if (his_self.game.player === papacy_player) {
			faction = 'papacy';
		}

		for (let i = 0; i < his_self.game.state.debaters.length; i++) {
			let divsq = `.debaters-tile${i}`;
			let tile_f =
				'/his/img/tiles/debaters/' +
				his_self.game.state.debaters[i].img;
			let tile_b = tile_f.replace('.svg', '_back.svg');

			//
			//
			//
			//$(divsq).click(function() {
			//
			// let key = $(this).attr("data-key");
			//
			//  if (his_self.game.state.debaters[i].committed == 0 && his_self.canPlayerCommitDebater(faction, key)) {
			//    alert("Commiting Debater for Bonus");
			//    his_self.commitDebater(faction, key, 1);
			//    his_self.addMove("commit\t"+faction+"\t"+key);
			//    his_self.endTurn();
			//    $(this).css('background-image', `url('${tile_b}')`);
			//    overlay_self.render();
			//  } else {
			//    alert("cannot commit debater now");
			//  }
			//});
			//
		}
	}
}

module.exports = DebatersOverlay;
