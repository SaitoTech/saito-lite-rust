const PopupLessonMainTemplate = require('./lesson-main.template');
const PopupLessonRightTemplate = require('./lesson-right.template');
const WordTemplate = require('./word.template');
const QuestionTemplate = require('./question.template');
const SentenceTemplate = require('./sentence.template');
const SaitoLoader = require('./../../../lib/saito/ui/saito-loader/saito-loader');

class PopupLesson {
	constructor(app, mod, container = '.popup-lesson') {
		this.app = app;
		this.mod = mod;
		this.container = container;
		this.name = 'PopupLesson';
		this.lesson = '';
		this.loader = new SaitoLoader(this.app, this.mod, '.popup-content');
	}

	render(lesson_id = '') {

		//
		// get our content
		//
		this.lesson = this.mod.returnLesson(lesson_id);

		//
		// lesson content
		//
		if (!document.querySelector(".lesson-container")) {
		  this.app.browser.addElementToSelector(PopupLessonMainTemplate(this.lesson, this.mod), '.saito-main');
		  this.app.browser.addElementToSelector(PopupLessonRightTemplate(this.lesson, this.mod), '.saito-sidebar.right');
		} else {
		  this.app.browser.replaceElementBySelector(PopupLessonMainTemplate(this.lesson), '.lesson-container');
		}

		//
		// sentences
		//
		this.mod.loadLessonSentences(this.lesson, () => {
		  let html = '<div class="lesson-section header">transcript</div>';
		  if (this.lesson.sentences) {
		    html += '<table style="width:100%;max-width:1400px;">';
		    for (let i = 0; i < this.lesson.sentences.length; i++) {
		      html += SentenceTemplate(this.lesson, this.lesson.sentences[i], this.mod);
		    }
		    html += '</table>';
		    this.app.browser.addElementToSelector(html, '.lesson-section.transcript');
		  }
		});


		//
		// words
		//
		this.mod.loadLessonWords(this.lesson, () => {
		  if (this.lesson.words) {
		    let html = '<div class="lesson-section header">vocabulary</div>';
		    html += '<table style="width:100%;max-width:1400px;">';
		    for (let i = 0; i < this.lesson.words.length; i++) {
		      html += WordTemplate(this.lesson, this.lesson.words[i], this.mod);
		    }
		    html += '</table>';
		    this.app.browser.addElementToSelector(html, '.lesson-section.vocabulary');
		  }
		});
	

		//
		// questions
		//
/***
		this.mod.loadLessonQuestions(this.lesson, () => {
		  if (this.lesson.questions) {
		    let html = '<div class="lesson-section header">comprehension:</div>';
		    html += '<table style="width:100%;max-width:1400px;">';
		    for (let i = 0; i < this.lesson.questions.length; i++) {
		      html += QuestionTemplate(this.lesson, this.lesson.questions[i]);
		    }
	 	    html += '</table>';
		  }
		  this.app.browser.addElementToSelector(html, '.lesson-section.questions');
		});
***/	

		this.attachEvents();

	}

	attachEvents() {

	}
}

module.exports = PopupLesson;
