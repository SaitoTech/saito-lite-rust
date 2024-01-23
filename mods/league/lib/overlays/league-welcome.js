const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');
const LeagueWelcomeTemplate = require('./league-welcome.template');

class LeagueWelcome {
	constructor(app, mod, league) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(this.app, this.mod, false);
		this.league = league;
	}

	render() {
		this.overlay.show(LeagueWelcomeTemplate(this.app, this.league));

		this.attachEvents();
	}

	attachEvents() {
		let btn = document.getElementById('league-email-btn');
		if (btn) {
			this.overlay.blockClose();
			btn.onclick = (e) => {
				let msg = document.querySelector('.email-to-admin').value;
				//
				//Let's not actually send the message until we make it secure!
				//
				//this.app.connection.emit("chat-message-user", this.league.admin, msg);
				this.overlay.remove();
				this.app.connection.emit(
					'league-overlay-render-request',
					this.league.id
				);
			};
		}
	}
}

module.exports = LeagueWelcome;
