//const VocabMainTemplate = require('./vocab-main.template');
//const VocabRightTemplate = require('./vocab-right.template');
//const WordTemplate = require('./word.template');
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

	async render(lesson_id = '', offset=0) {

		//
		// vocab content
		//
		this.app.browser.replaceElementContentBySelector(VocabMainTemplate(), '.saito-main');
		this.app.browser.replaceElementContentBySelector(VocabRightTemplate(), '.saito-sidebar.right');

		// offset = 0
		this.vocab = await this.mod.returnVocab(offset);

		let html = '<table>';
		if (this.vocab.length > 0) {
			html += `
				<tr>
					<th></th>
					<th>traditional</th>
					<th>simplified</th>
					<th>english</th>
					<th>pinyin</th>
				</tr>
			`;
	        }
		for (let i = 0; i < this.vocab.length; i++) { html += WordTemplate(0, this.vocab[i], this.mod); }
		html += '</table>';

		document.querySelector('.vocabulary').innerHTML = html;

		this.attachEvents();

	}

	attachEvents() {

		document.querySelector('.start_popup_review').onclick = (e) => {
			this.mod.review.render();
		};

	}

}

module.exports = PopupVocab;

