class EventCreator {
	constructor(app, mod) {
		this.app = app;
		this.name = 'EventCreator';
	}

	//
	// we have no need for a secondary menu, so our render function simply creates the invite directly
	// by sending the submitted options object directly to the invite module.
	//
	async render(app, mod) {
		let invite_obj = mod.options;

		//
		// creates and sends
		//
		await mod.createOpenTransaction(invite_obj);

		alert('event / invitation sent');
	}
}

module.exports = EventCreator;
