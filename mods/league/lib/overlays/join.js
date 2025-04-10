const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');
const JoinLeagueTemplate = require('./join.template');
const SaitoLoader = require('./../../../../lib/saito/ui/saito-loader/saito-loader');

class JoinLeague {
	constructor(app, mod, league_id = '') {
		this.app = app;
		this.mod = mod;
		this.league_id = league_id;
		this.overlay = new SaitoOverlay(app, mod, false, true);
		this.loader = new SaitoLoader(app, mod, '.league-join-overlay-box');
		this.timer = null;

		this.app.connection.on('join-league-success', () => {
			console.log('League Join success!');
			if (this.timer) {
				clearTimeout(this.timer);
				this.timer = null;
			} else {
				//We have already faked success, so just stop here
				return;
			}
			this.loader.remove();
			this.render();
		});
	}

	async render() {
		let league = this.mod.returnLeague(this.league_id);

		if (league == null) {
			salert(`League not found`);
			console.log('League id: ' + this.league_id);
			return;
		}
		this.overlay.remove();

		if (league.rank >= 0) {
			//console.log("Don't join, I am a member");
			this.app.connection.emit(
				'league-overlay-render-request',
				this.league_id
			);
			return;
		}

		this.game_mod = this.app.modules.returnModuleByName(league.game);
		this.overlay.show(
			JoinLeagueTemplate(this.app, this.mod, league),
			() => {
				this.app.connection.emit(
					'league-overlay-render-request',
					this.league_id
				);
			}
		);
		this.overlay.setBackground(
			this.game_mod.respondTo('arcade-games').image
		);

		this.attachEvents();
	}

	attachEvents() {
		// Phase 1
		const league_join_btn = document.getElementById('league-join-btn');

		if (league_join_btn) {
			league_join_btn.onclick = async (e) => {
				window.history.replaceState('', '', window.location.pathname);
				e.preventDefault();

				let league_id = e.target.getAttribute('data-id');

				//
				// show loader
				//
				document.querySelector('.title-box').remove();
				document.querySelector('.league-join-controls').remove();
				document.querySelector('.league-join-info').remove();
				this.loader.render();

				let newtx = await this.mod.createJoinTransaction(
					league_id /*, user_email*/
				);
				this.app.network.propagateTransaction(newtx);

				if (this.mod.debug) {
					console.log('Join sent! ' + league_id);
				}

				let params = {
					publickey: this.mod.publicKey
				};

				await this.mod.addLeaguePlayer(league_id, params);

				this.timer = setTimeout(() => {
					console.log('Time out');
					this.loader.remove();
					this.render();
					this.timer = null;
				}, 2000);
			};

			document.querySelector('.saito-overlay-form-alt-opt').onclick = (
				e
			) => {
				this.app.connection.emit(
					'recovery-login-overlay-render-request'
				);
				return;
			};
		} else {
			document.querySelector('#gonow').onclick = (e) => {
				this.app.connection.emit(
					'league-overlay-render-request',
					this.league_id
				);
				this.overlay.remove();
			};

			let countDown = document.getElementById('countdown');
			let timer = 9;
			let interval = setInterval(() => {
				timer--;
				countDown.innerHTML = timer;
				if (timer === 0) {
					console.log('Timer expired');
					clearInterval(interval);
					this.app.connection.emit(
						'league-overlay-render-request',
						this.league_id
					);
					this.overlay.remove();
				}
			}, 1000);
		}
	}
}

module.exports = JoinLeague;
