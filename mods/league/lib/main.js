const LeagueWizard = require('./overlays/league-wizard');
const LeagueMainTemplate = require('./main.template');
const LeagueMenu = require('./menu');

class LeagueMain {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.wizard = null;

		app.connection.on('leagues-render-request', (league) => {
			this.render();
		});
	}

	async render() {
		//
		// Wipe the main container and create a fresh build render main template
		//

		if (document.getElementById('league-main-container') != null) {
			this.app.browser.replaceElementBySelector(
				LeagueMainTemplate(),
				'#league-main-container'
			);
		} else {
			this.app.browser.addElementToDom(LeagueMainTemplate());
		}

		let leagues = this.mod.leagues.filter((l) => l.admin);
		if (this.app.browser.returnURLParameter('show_all_leagues')) {
			leagues = this.mod.leagues;
		}

		if (this.mod.debug) {
			console.log(JSON.parse(JSON.stringify(leagues)));
		}

		let filter1 = leagues.filter((l) => l.admin == this.mod.publicKey);
		let filter2 = leagues.filter(
			(l) => l.rank >= 0 && l.admin != this.mod.publicKey
		);
		let filter3 = leagues.filter(
			(l) => l.rank < 0 && l.admin != this.mod.publicKey
		);

		if (filter1.length > 0) {
			filter1.forEach((lg) => {
				let x = new LeagueMenu(
					this.app,
					this.mod,
					'#leagues-for-admin',
					lg
				);
				x.render();
			});
		}

		if (filter2.length > 0) {
			filter2.forEach((lg) => {
				let x = new LeagueMenu(
					this.app,
					this.mod,
					'#leagues-for-play',
					lg
				);
				x.render();
			});
		}

		if (filter3.length > 0) {
			filter3.forEach((lg) => {
				let x = new LeagueMenu(
					this.app,
					this.mod,
					'#leagues-for-play',
					lg
				);
				x.render();
			});
		}

		this.attachEvents();
	}

	attachEvents() {
		if (document.getElementById('create-new-league')) {
			document.getElementById('create-new-league').onclick = () => {
				this.app.connection.emit('arcade-launch-game-selector', {
					callback: (obj) => {
						if (this.wizard != null) {
							delete this.wizard;
						}
						let game_mod = this.app.modules.returnModuleByName(
							obj.game
						);
						this.wizard = new LeagueWizard(
							this.app,
							this.mod,
							game_mod
						);
						this.wizard.render();
					}
				});
			};
		}
	}
}

module.exports = LeagueMain;
