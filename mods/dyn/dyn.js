const ModTemplate = require('../../lib/templates/modtemplate');

class Dyn extends ModTemplate {
	constructor(app) {
		super(app);
		console.log("dyn module loaded");
		this.name = "Dyn";
	}
	respondTo(request_type = '', obj) {
		console.log("dyn responding to " + request_type);
		return super.respondTo(request_type, obj);
	}
}

module.exports = Dyn;