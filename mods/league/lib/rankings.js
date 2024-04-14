const LeagueRankingsTemplate = require('./rankings.template');
//const LeagueOverlay = require("./overlays/league");

class LeagueRankings {
	constructor(app, mod, container = '') {
		this.app = app;
		this.mod = mod;
		this.container = container;
		//Currently being defined by module
		//this.overlay = new LeagueOverlay(this.app, this.mod);

		app.connection.on('league-rankings-render-request', () => {
			if (this.mod.debug) {
				console.log('league-rankings-render-request');
			}
			this.render();
		});
	}

	render() {
		//
		// insert content we will render into
		//
		if (document.querySelector('.league-rankings')) {
			this.app.browser.replaceElementBySelector(
				LeagueRankingsTemplate(),
				'.league-rankings'
			);
		} else {
			this.app.browser.addElementToSelector(
				LeagueRankingsTemplate(),
				this.container
			);
		}

		//
		// add content to league rankings
		//
		let leagues = this.mod.leagues.slice();

		leagues.sort((a, b) => {
			if (a.rank <= 0 && b.rank <= 0){
				return 0;
			}
			if (a.rank <= 0) {
				return 1;
			}
			if (b.rank <= 0) {
				return -1;
			}
			return a.rank - b.rank;
		});

		let html = '';
		if (leagues.length > 0) {
			let cnt = 0;
			leagues.forEach((l) => {
				html += `<div data-id="${l.id}" data-game="${l.game}" class="saito-table-row league-leaderboard-ranking">
			              <div class="saito-table-gamename">${l.name}</div>`;

				if (l.rank > 0) {
					html += `<div class="saito-table-rank">${l.rank}</div></div>`;
				} else {
					html += `<div class="saito-table-rank saito-deemphasize">…</div></div>`;
				}
			});
		}

		this.app.browser.addElementToSelector(
			html,
			'.league-rankings  .saito-table-body'
		);

		this.attachEvents();
	}

	attachEvents() {
		document
			.querySelectorAll('.league-leaderboard-ranking')
			.forEach((el) => {
				el.onclick = (e) => {
					let lid = e.currentTarget.getAttribute('data-id');
					this.app.browser.logMatomoEvent(
						'LeagueOverlay',
						this.app.modules.returnActiveModule().returnName(),
						e.currentTarget.getAttribute('data-game')
					);
					this.app.connection.emit(
						'league-overlay-render-request',
						lid
					);
				};
			});
	}
}

module.exports = LeagueRankings;
