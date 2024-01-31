const LeagueWizardTemplate = require('./league-wizard.template');
const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');

class LeagueWizard {
	constructor(app, mod, game_mod) {
		this.app = app;
		this.mod = mod;
		this.game_mod = game_mod;
		this.overlay = new SaitoOverlay(app);

		this.app.connection.on('league-launch-wizard', (game_mod = {}) => {
			if (!game_mod) {
				console.log('No game module to launch league wizard');
				return;
			}
			this.game_mod = game_mod;
			this.render();
		});
	}

	async render() {
		this.overlay.show(
			LeagueWizardTemplate(this.app, this.mod, this.game_mod)
		);
		this.attachEvents();
	}

	attachEvents() {
		document.querySelector('#league-name').onclick = (e) => {
			document.querySelector('#league-name').select();
		};

		document.querySelector('#league-desc').onclick = (e) => {
			document.querySelector('#league-desc').select();
		};

		document.querySelector('#create-league-btn').onclick = async (e) => {
			e.stopPropagation();
			e.preventDefault();

			let title = document.getElementById('league-name')?.value;
			let desc = document.getElementById('league-desc')?.value;
			let contact = document.getElementById('admin-contact')?.value;

			if (!title || title === 'League Name') {
				alert('Your league must have a name');
				return false;
			}

			if (!desc || desc === 'Describe your league...') {
				alert('Your league must have a description');
				return false;
			}

			//let status = document.querySelector(".league-wizard-status-select").value;

			//
			let obj = this.mod.validateLeague(
				this.game_mod.respondTo('default-league')
			);
			obj.name = title;
			obj.description = desc;
			obj.admin = this.mod.publicKey;
			obj.contact = contact || '';

			if (obj.game === 'Unknown') {
				obj.game = this.game_mod.name;
			}

			let newtx = await this.mod.createCreateTransaction(obj);
			await this.app.network.propagateTransaction(newtx);
			this.overlay.remove();

			salert('please wait a few moments for the league to be confirmed');
			return false;
		};
	}
}

module.exports = LeagueWizard;
