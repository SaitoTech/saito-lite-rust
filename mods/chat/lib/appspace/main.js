const JSON = require('json-bigint');
const ChatMainTemplate = require('./main.template');

class ChatMain {
	constructor(app, mod, container = '') {
		this.app = app;
		this.mod = mod;

	}

	render() {
		if (document.querySelector('.saito-container')) {
			this.app.browser.replaceElementBySelector(
				ChatMainTemplate(),
				'.saito-container'
			);
		} else {
			this.app.browser.addElementToSelector(
				ChatMainTemplate(),
				this.container
			);
		}

		this.attachEvents();
	}

	attachEvents() {}
}

module.exports = ChatMain;
