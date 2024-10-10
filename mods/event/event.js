const InviteTemplate = require('./../../lib/templates/invitetemplate');
const EventInvite = require('./lib/invite/main');

class Event extends InviteTemplate {
	constructor(app) {
		super(app);

		this.app = app;
		this.name = 'Event';
		this.slug = 'event';
		this.appname = 'Event';
		this.description = 'Module for generic scheduling functionality';
		this.categories = 'Utilities Scheduling Office';

		this.icon = 'fas fa-envelope-open-text';
		this.invites = [];
		this.scripts = [];
		this.styles = ['/invites/style.css'];

		return this;
	}

	async initialize(app) {
		await super.initialize(app);
	}

	respondTo(type) {
		if (type == 'invite') {
			super.render(this.app, this); // for scripts + styles
			return new EventInvite(this.app, this);
		}

		return null;
	}
}

module.exports = Event;
