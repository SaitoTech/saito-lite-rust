var saito = require('../../lib/saito/saito');
var InviteTemplate = require('../../lib/templates/invitetemplate');
const InvitesAppspace = require('./lib/appspace/main');

class Invites extends InviteTemplate {
	constructor(app) {
		super(app);

		this.app = app;
		this.name = 'Invites';
		this.slug = 'invites';
		this.appname = 'Invites';
		this.description = 'Demo module with UI for invite display and acceptance';
		this.categories = 'Utilities Education Demo';

		this.icon = 'fas fa-envelope-open-text';
		this.invites = [];
		this.scripts = [];
		this.styles = ['/invites/style.css'];

		return this;
	}

	canRenderInto(qs) {
		if (qs === '.saito-main' && this.invites.length > 0) {
			return true;
		}
		return false;
	}

	async renderInto(qs) {
		if (qs == '.saito-main') {
			if (!this.renderIntos[qs]) {
				this.renderIntos[qs] = [];
				this.renderIntos[qs].push(
					new InvitesAppspace(this.app, this, qs)
				);
			}
			this.attachStyleSheets();
			for (const comp of this.renderIntos[qs]) {
				await comp.render();
			}
		}
	}

	async onPeerHandshakeComplete(app, peer) {
		//
		// emit any invite events for rendering
		//
		await super.onPeerHandshakeComplete(app, peer);
	}

	async onConfirmation(blk, tx, conf) {
		await super.onConfirmation(blk, tx, conf);
	}
}

module.exports = Invites;
