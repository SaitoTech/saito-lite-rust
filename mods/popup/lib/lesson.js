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
		  this.app.browser.addElementToSelector(PopupLessonMainTemplate(this.lesson), '.saito-main');
		  this.app.browser.addElementToSelector(PopupLessonRightTemplate(this.lesson), '.saito-sidebar.right');
		} else {
		  this.app.browser.replaceElementBySelector(PopupLessonMainTemplate(this.lesson), '.lesson-container');
		}


		//
		// sentences
		//
		this.mod.loadLessonSentences(this.lesson, () => {
		  let html = '<h2>Transcript</h2>';
		  html = '<table>';
		  if (this.lesson.sentences) {
		    for (let i = 0; i < this.lesson.sentences.length; i++) {
		      html += SentenceTemplate(this.lesson, this.lesson.sentences[i]);
		    }
		  }
		  html += '</table>';
		  this.app.browser.addElementToSelector(html, '.lesson-section.transcript');
		});


		//
		// words
		//
		this.mod.loadLessonWords(this.lesson, () => {
		  let html = '<h2>Vocabulary</h2>';
		  html = '<table>';
		  if (this.lesson.words) {
		  for (let i = 0; i < this.lesson.words.length; i++) {
		    html += WordTemplate(this.lesson, this.lesson.words[i]);
		  }
		  }
		  html += '</table>';
		  this.app.browser.addElementToSelector(html, '.lesson-section.vocabulary');
		});
	

		//
		// questions
		//
		this.mod.loadLessonQuestions(this.lesson, () => {
		  let html = '<h2>Review:</h2>';
		  html = '<table>';
		  if (this.lesson.questions) {
		    for (let i = 0; i < this.lesson.questions.length; i++) {
		      html += QuestionTemplate(this.lesson, this.lesson.questions[i]);
		    }
		  }
	 	  html += '</table>';
		  this.app.browser.addElementToSelector(html, '.lesson-section.questions');
		});
	

		this.attachEvents();

	}

	attachEvents() {

	}
}

module.exports = PopupLesson;
