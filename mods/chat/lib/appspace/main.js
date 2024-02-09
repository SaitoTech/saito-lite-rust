const ChatMainTemplate = require('./main.template');

class ChatMain {
	constructor(app, mod) {
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
			this.app.browser.addElementToDom(ChatMainTemplate());
		}

		this.attachEvents();
	}

	attachEvents() {}
}

module.exports = ChatMain;
