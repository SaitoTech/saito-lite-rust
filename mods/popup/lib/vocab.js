const VocabTemplate = require('./vocab.template');
const WordTemplate = require('./word.template');
const SaitoLoader = require('./../../../lib/saito/ui/saito-loader/saito-loader');

class PopupVocab {
	constructor(app, mod, container = '.popup-lesson') {
		this.app = app;
		this.mod = mod;
		this.container = container;
		this.name = 'PopupVocab';
		this.lesson = '';
		this.loader = new SaitoLoader(this.app, this.mod, '.popup-content');
	}

	async render(lesson_id = '') {
		//
		// vocab content
		//
		this.app.browser.replaceElementContentBySelector(
			VocabTemplate(),
			'.popup-content'
		);

		//
		// get our content
		//
		this.vocab = await this.mod.returnVocab(lesson_id);

		let html = '<table>';
		for (let i = 0; i < this.vocab.length; i++) {
			html += WordTemplate(this.vocab[i]);
		}
		html += '</table>';

		document.querySelector('.lesson-section.vocabulary').innerHTML = html;
	}

	attachEvents() {}
}

module.exports = PopupVocab;
