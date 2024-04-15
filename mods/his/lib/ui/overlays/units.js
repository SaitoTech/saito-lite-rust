const UnitsTemplate = require('./units.template');
const SaitoOverlay = require('./../../../../../lib/saito/ui/saito-overlay/saito-overlay');

class UnitsOverlay {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(this.app, this.mod, true, false);
	}

	hide() {
		this.overlay.hide();
	}

	pullHudOverOverlay() {
		//
		// pull GAME HUD over overlay
		//
		let overlay_zindex = parseInt(this.overlay.zIndex);
		if (document.querySelector('.hud')) {
			document.querySelector('.hud').style.zIndex = overlay_zindex + 1;
			this.mod.hud.zIndex = overlay_zindex + 1;
		}
	}
	pushHudUnderOverlay() {
		//
		// push GAME HUD under overlay
		//
		let overlay_zindex = parseInt(this.overlay.zIndex);
		if (document.querySelector('.hud')) {
			document.querySelector('.hud').style.zIndex = overlay_zindex - 2;
			this.mod.hud.zIndex = overlay_zindex - 2;
		}
	}

	render() {
		let his_self = this.mod;

		this.overlay.show(UnitsTemplate());
		this.pushHudUnderOverlay();

		document.querySelector('.units-title').innerHTML = `Available Units`;

		his_self.game.state.board['protestant'] =
			his_self.returnOnBoardUnits('protestant');
		his_self.game.state.board['papacy'] =
			his_self.returnOnBoardUnits('papacy');
		his_self.game.state.board['hapsburg'] =
			his_self.returnOnBoardUnits('hapsburg');
		his_self.game.state.board['england'] =
			his_self.returnOnBoardUnits('england');
		his_self.game.state.board['france'] =
			his_self.returnOnBoardUnits('france');
		his_self.game.state.board['ottoman'] =
			his_self.returnOnBoardUnits('ottoman');
		his_self.game.state.board['hungary'] =
			his_self.returnOnBoardUnits('hungary');
		his_self.game.state.board['scotland'] =
			his_self.returnOnBoardUnits('scotland');
		his_self.game.state.board['venice'] =
			his_self.returnOnBoardUnits('venice');
		his_self.game.state.board['genoa'] =
			his_self.returnOnBoardUnits('genoa');
		his_self.game.state.board['independent'] =
			his_self.returnOnBoardUnits('independent');

		for (let f in his_self.game.state.board) {
			let available = his_self.game.state.board[f].available;

			his_self.app.browser.addElementToSelector(
				`
	  <div class="units-faction">${his_self.returnFactionName(f)}</div>
	  <div class="units-faction-available ${f}-units"></div>
        `,
				'.units-table'
			);

			for (let i = 0; i < available['regular']['1']; i++) {
				let imgtile = '';
				if (f == 'hapsburg') {
					imgtile = `<img class="army_tile" src="/his/img/tiles/hapsburg/HapsburgReg-1.svg" />`;
				}
				if (f == 'protestant') {
					imgtile = `<img class="army_tile" src="/his/img/tiles/protestant/ProtestantReg-1.svg" />`;
				}
				if (f == 'papacy') {
					imgtile = `<img class="army_tile" src="/his/img/tiles/papacy/PapacyReg-1.svg" />`;
				}
				if (f == 'ottoman') {
					imgtile = `<img class="army_tile" src="/his/img/tiles/ottoman/OttomanReg-1.svg" />`;
				}
				if (f == 'france') {
					imgtile = `<img class="army_tile" src="/his/img/tiles/france/FrenchReg-1.svg" />`;
				}
				if (f == 'england') {
					imgtile = `<img class="army_tile" src="/his/img/tiles/england/EnglandReg-1.svg" />`;
				}
				if (f == 'scotland') {
					imgtile = `<img class="army_tile" src="/his/img/tiles/scotland/ScottishReg-1.svg" />`;
				}
				if (f == 'venice') {
					imgtile = `<img class="army_tile" src="/his/img/tiles/venice/VeniceReg-1.svg" />`;
				}
				if (f == 'genoa') {
					imgtile = `<img class="army_tile" src="/his/img/tiles/genoa/GenoaReg-1.svg" />`;
				}
				if (f == 'hungary') {
					imgtile = `<img class="army_tile" src="/his/img/tiles/hungary/HungaryReg-1.svg" />`;
				}
				if (f == 'independent') {
					imgtile = `<img class="army_tile" src="/his/img/tiles/independent/IndependentReg-1.svg" />`;
				}
				let qs = `.units-faction-available.${f}-units`;
				his_self.app.browser.addElementToSelector(imgtile, qs);
			}
			for (let i = 0; i < available['regular']['2']; i++) {
				let imgtile = '';
				if (f == 'hapsburg') {
					imgtile = `<img class="army_tile" src="/his/img/tiles/hapsburg/HapsburgReg-2.svg" />`;
				}
				if (f == 'protestant') {
					imgtile = `<img class="army_tile" src="/his/img/tiles/protestant/ProtestantReg-2.svg" />`;
				}
				if (f == 'papacy') {
					imgtile = `<img class="army_tile" src="/his/img/tiles/papacy/PapacyReg-2.svg" />`;
				}
				if (f == 'ottoman') {
					imgtile = `<img class="army_tile" src="/his/img/tiles/ottoman/OttomanReg-2.svg" />`;
				}
				if (f == 'france') {
					imgtile = `<img class="army_tile" src="/his/img/tiles/france/FrenchReg-2.svg" />`;
				}
				if (f == 'england') {
					imgtile = `<img class="army_tile" src="/his/img/tiles/england/EnglandReg-2.svg" />`;
				}
				if (f == 'scotland') {
					imgtile = `<img class="army_tile" src="/his/img/tiles/scotland/ScottishReg-2.svg" />`;
				}
				if (f == 'venice') {
					imgtile = `<img class="army_tile" src="/his/img/tiles/venice/VeniceReg-2.svg" />`;
				}
				if (f == 'genoa') {
					imgtile = `<img class="army_tile" src="/his/img/tiles/genoa/GenoaReg-2.svg" />`;
				}
				if (f == 'hungary') {
					imgtile = `<img class="army_tile" src="/his/img/tiles/hungary/HungaryReg-2.svg" />`;
				}
				if (f == 'independent') {
					imgtile = `<img class="army_tile" src="/his/img/tiles/independent/IndependentReg-2.svg" />`;
				}
				let qs = `.units-faction-available.${f}-units`;
				his_self.app.browser.addElementToSelector(imgtile, qs);
			}
			for (let i = 0; i < available['regular']['4']; i++) {
				let imgtile = '';
				if (f == 'hapsburg') {
					imgtile = `<img class="army_tile" src="/his/img/tiles/hapsburg/HapsburgReg-4.svg" />`;
				}
				if (f == 'protestant') {
					imgtile = `<img class="army_tile" src="/his/img/tiles/protestant/ProtestantReg-4.svg" />`;
				}
				if (f == 'papacy') {
					imgtile = `<img class="army_tile" src="/his/img/tiles/papacy/PapacyReg-4.svg" />`;
				}
				if (f == 'ottoman') {
					imgtile = `<img class="army_tile" src="/his/img/tiles/ottoman/OttomanReg-4.svg" />`;
				}
				if (f == 'france') {
					imgtile = `<img class="army_tile" src="/his/img/tiles/france/FrenchReg-4.svg" />`;
				}
				if (f == 'england') {
					imgtile = `<img class="army_tile" src="/his/img/tiles/england/EnglandReg-4.svg" />`;
				}
				if (f == 'scotland') {
					imgtile = `<img class="army_tile" src="/his/img/tiles/scotland/ScottishReg-4.svg" />`;
				}
				if (f == 'venice') {
					imgtile = `<img class="army_tile" src="/his/img/tiles/venice/VeniceReg-4.svg" />`;
				}
				if (f == 'genoa') {
					imgtile = `<img class="army_tile" src="/his/img/tiles/genoa/GenoaReg-4.svg" />`;
				}
				if (f == 'hungary') {
					imgtile = `<img class="army_tile" src="/his/img/tiles/hungary/HungaryReg-4.svg" />`;
				}
				if (f == 'independent') {
					imgtile = `<img class="army_tile" src="/his/img/tiles/independent/IndependentReg-4.svg" />`;
				}
				let qs = `.units-faction-available.${f}-units`;
				his_self.app.browser.addElementToSelector(imgtile, qs);
			}
			for (let i = 0; i < available['regular']['6']; i++) {
				let imgtile = '';
				if (f == 'hapsburg') {
					imgtile = `<img class="army_tile" src="/his/img/tiles/hapsburg/HapsburgReg-6.svg" />`;
				}
				if (f == 'protestant') {
					imgtile = `<img class="army_tile" src="/his/img/tiles/protestant/ProtestantReg-6.svg" />`;
				}
				if (f == 'papacy') {
					imgtile = `<img class="army_tile" src="/his/img/tiles/papacy/PapacyReg-6.svg" />`;
				}
				if (f == 'ottoman') {
					imgtile = `<img class="army_tile" src="/his/img/tiles/ottoman/OttomanReg-6.svg" />`;
				}
				if (f == 'france') {
					imgtile = `<img class="army_tile" src="/his/img/tiles/france/FrenchReg-6.svg" />`;
				}
				if (f == 'england') {
					imgtile = `<img class="army_tile" src="/his/img/tiles/england/EnglandReg-6.svg" />`;
				}
				if (f == 'scotland') {
					imgtile = `<img class="army_tile" src="/his/img/tiles/scotland/ScottishReg-6.svg" />`;
				}
				if (f == 'venice') {
					imgtile = `<img class="army_tile" src="/his/img/tiles/venice/VeniceReg-6.svg" />`;
				}
				if (f == 'genoa') {
					imgtile = `<img class="army_tile" src="/his/img/tiles/genoa/GenoaReg-6.svg" />`;
				}
				if (f == 'hungary') {
					imgtile = `<img class="army_tile" src="/his/img/tiles/hungary/HungaryReg-6.svg" />`;
				}
				if (f == 'independent') {
					imgtile = `<img class="army_tile" src="/his/img/tiles/independent/IndependentReg-6.svg" />`;
				}
				let qs = `.units-faction-available.${f}-units`;
				his_self.app.browser.addElementToSelector(imgtile, qs);
			}

			for (let i = 0; i < available['squadron']['1']; i++) {
				let imgtile = '';
				if (f == 'hapsburg') {
					imgtile = `<img class="army_tile" src="/his/img/tiles/hapsburg/Hapsburg_squadron.svg" />`;
				}
				if (f == 'papacy') {
					imgtile = `<img class="army_tile" src="/his/img/tiles/papacy/Papacy_squadron.svg" />`;
				}
				if (f == 'ottoman') {
					imgtile = `<img class="army_tile" src="/his/img/tiles/ottoman/Ottoman_squadron.svg" />`;
				}
				if (f == 'france') {
					imgtile = `<img class="army_tile" src="/his/img/tiles/france/French_squadron.svg" />`;
				}
				if (f == 'england') {
					imgtile = `<img class="army_tile" src="/his/img/tiles/england/English_squadron.svg" />`;
				}
				if (f == 'scotland') {
					imgtile = `<img class="army_tile" src="/his/img/tiles/scotland/Scottish_squadron.svg" />`;
				}
				if (f == 'venice') {
					imgtile = `<img class="army_tile" src="/his/img/tiles/venice/Venice_squadron.svg" />`;
				}
				if (f == 'genoa') {
					imgtile = `<img class="army_tile" src="/his/img/tiles/genoa/Genoa_squadron.svg" />`;
				}
				let qs = `.units-faction-available.${f}-units`;
				his_self.app.browser.addElementToSelector(imgtile, qs);
			}
		}

		this.attachEvents();
	}

	attachEvents() {}
}

module.exports = UnitsOverlay;
