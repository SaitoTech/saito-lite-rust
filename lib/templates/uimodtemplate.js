const ModTemplate = require('./modtemplate');

//
// UI Modules are modules that are created at the time we create
// our UI elements, but that we want to have all of the functionality
// of initialized Saito modules, such as the ability to receive
// transactions via onConfirmation or handlePeerTransaction messages.
//
// This requires them to be added to the list of active modules, which
// is all this parent class really adds.
//
class UIModTemplate extends ModTemplate {
	constructor(app, mod, container = '') {
		super(app, mod, container);

		//
		// ui components are always visible by definition
		//
		if (this.browser_active == 0) {
			this.browser_active = 1;
		}
		if (this.name == '') {
			this.name = 'UI Component';
		}
	}

	async initialize(app) {
		//
		// all other modules have been initialized and added
		// to app.modules by the time that we get around to
		// creating UI components (render), so when we are
		// creating these UI components we manually add the
		// modules and initialize them here.
		//
		if (!app.modules.uimods.includes(this)) {
			app.modules.uimods.push(this);
		}
		await super.initialize(app);
	}
}

module.exports = UIModTemplate;
