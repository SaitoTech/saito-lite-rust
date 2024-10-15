const ModTemplate = require('../../lib/templates/modtemplate');
const sanitizer = require('sanitizer');
const JSON = require('json-bigint');


class ATR extends ModTemplate {

	constructor(app) {
		super(app);
		this.app = app;
		this.name = 'ATR';
		this.description = `Explorer for ATR Testing`;
		this.categories = 'Utilities Dev';
		this.class = 'utility';
	}

}

module.exports = ATR;
