const PopupCommentTemplate = require('./comment.template');

class PopupComment {
	constructor(app, mod, container = '.popup-comment') {
		this.app = app;
		this.mod = mod;
		this.container = container;
		this.name = 'PopupComment';
		this.comment_id = '';
	}

	render(comment_id = '') {
		//
		// comment content
		//
		this.app.browser.replaceElementContentBySelector(
			PopupCommentTemplate(this.app, this.mod),
			'.comments'
		);
		this.attachEvents();
	}

	attachEvents() {}
}

module.exports = PopupComment;
