var saito = require('../../lib/saito/saito');
var ModTemplate = require('../../lib/templates/modtemplate');
const DebugAppspaceMain = require('./lib/appspace/main');

class Debug extends ModTemplate {
	constructor(app) {
		super(app);

		this.app = app;
		this.name = 'Debug';
		this.appname = 'Debug';
		this.description =
			'Email plugin that allows visual exploration and debugging of the Saito wallet.';
		this.categories = 'Utilities Core';
		this.icon = 'fas fa-code';

		this.description = 'A debug configuration dump for Saito';
		this.categories = 'Dev Utilities';
		return this;
	}

	respondTo(type) {
		if (type === 'appspace') {
			this.styles = [
				'/saito/lib/jsonTree/jsonTree.css',
				'/debug/style.css'
			];
			super.render(this.app, this);
			return new DebugAppspaceMain(this.app, this);
		}

		return null;
	}

	attachEventsEmail(app, mod) {}
}

module.exports = Debug;
