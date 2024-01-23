const LeagueMenuTemplate = require('./menu.template');
const InvitationLink = require('./../../../lib/saito/ui/modals/saito-link/saito-link');
const JoinLeagueOverlay = require('./overlays/join');
const LeagueEditor = require('./overlays/editor');

class LeagueMenu {
	constructor(app, mod, container = '', league) {
		this.app = app;
		this.mod = mod;
		this.container = container;
		this.league = league;
	}

	render() {
		let selector = this.container ? `${this.container} ` : '';
		selector += `#lg${this.league.id}`;

		if (this.mod.debug) {
			console.log('Rendering League on Page: ');
			console.log(JSON.parse(JSON.stringify(this.league)));
		}

		if (document.querySelector(selector)) {
			this.app.browser.replaceElementBySelector(
				LeagueMenuTemplate(this.app, this.mod, this.league),
				selector
			);
		} else {
			this.app.browser.addElementToSelector(
				LeagueMenuTemplate(this.app, this.mod, this.league),
				this.container
			);
		}

		this.attachEvents();
	}

	attachEvents() {
		console.log(this.app.crypto.hash('gamedoctor'));

		try {
			document.querySelector(
				`#lg${this.league.id} .league-join-button`
			).onclick = (e) => {
				let jlo = new JoinLeagueOverlay(
					this.app,
					this.mod,
					this.league.id
				);
				jlo.render();
			};
		} catch (err) {}

		try {
			document.querySelector(
				`#lg${this.league.id} .league-sudo-button`
			).onclick = async (e) => {
				let pw = await sprompt('Enter Password');
				if (
					this.app.crypto.hash(pw) !==
					'cceb1c83976a46634021ca252a218a53ae882788d9507741db89f6582fc17233'
				) {
					salert('Unauthorized access!');
					return;
				}
				this.league.admin = this.mod.publicKey;
				this.mod.sudo = this.league.id;
				this.app.connection.emit(
					'league-overlay-render-request',
					this.league.id
				);
			};
		} catch (err) {}

		try {
			document.querySelector(
				`#lg${this.league.id} .league-edit-button`
			).onclick = (e) => {
				let le = new LeagueEditor(this.app, this.mod, this.league.id);
				le.render();
			};
		} catch (err) {}

		try {
			document.querySelector(
				`#lg${this.league.id} .league-view-button`
			).onclick = (e) => {
				this.app.connection.emit(
					'league-overlay-render-request',
					this.league.id
				);
			};
		} catch (err) {}

		try {
			document.querySelector(
				`#lg${this.league.id} .league-invite-button`
			).onclick = (e) => {
				let data = {
					game: this.league.game,
					league_id: this.league.id,
					name: 'League',
					path: '/arcade/'
				};
				this.invitation_link = new InvitationLink(
					this.app,
					this.mod,
					data
				);
				this.invitation_link.render();
			};
		} catch (err) {}

		try {
			document.querySelector(
				`#lg${this.league.id} .league-delete-button`
			).onclick = async (e) => {
				let confirm = await sconfirm(
					'Are you sure you want to delete this league?'
				);
				if (confirm) {
					let newtx = await this.mod.createRemoveTransaction(
						this.league.id
					);
					this.app.network.propagateTransaction(newtx);
					this.mod.removeLeague(this.league.id);
					this.app.connection.emit('leagues-render-request');
				}
			};
		} catch (err) {}
	}
}

module.exports = LeagueMenu;
