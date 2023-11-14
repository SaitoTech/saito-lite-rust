const PopupLessonTemplate = require("./lesson.template");
const WordTemplate = require("./word.template");
const QuestionTemplate = require("./question.template");
const SentenceTemplate = require("./sentence.template");
const SaitoLoader = require("./../../../lib/saito/ui/saito-loader/saito-loader");

class PopupLesson {

  constructor(app, mod, container = ".popup-lesson") {
    this.app = app;
    this.mod = mod;
    this.container = container;
    this.name = "PopupLesson";
    this.lesson = "";
    this.loader = new SaitoLoader(this.app, this.mod, ".popup-content");
  }

  render(lesson_id="") {

    //
    // get our content
    //
    this.lesson = this.mod.returnLesson(lesson_id);

    //
    // lesson content
    //
    this.app.browser.replaceElementContentBySelector(PopupLessonTemplate(this.lesson), ".popup-content");
    this.attachEvents();

    //
    // lesson title
    //
    let obj = document.querySelector(".popup-menu .header");
    if (obj) { obj.innerHTML = `<div class="level">${this.lesson.username}: </div><div class="title">${this.lesson.title}</div>`; }

    //
    // lesson menu
    //
    document.querySelectorAll(".option.non-lesson").forEach((el) => { el.style.display = "none"; });
    document.querySelectorAll(".option.lesson").forEach((el) => { el.style.display = "block"; });

  }

  attachEvents() {

    document.querySelector(".discussion").onclick = (e) => {
      document.querySelectorAll(".lesson-section").forEach((el) => { el.style.display = "none"; });
      document.querySelectorAll(".lesson-section.discussion").forEach((el) => { el.style.display = "block"; });
    }

    document.querySelector(".transcript").onclick = (e) => {
      document.querySelectorAll(".lesson-section").forEach((el) => { el.style.display = "none"; });
      this.loader.show();
      this.mod.fetchLessonSentences(this.lesson, (res) => {

	let html = '<table>';
	for (let i = 0; i < this.lesson.sentences.length; i++) { html += SentenceTemplate(this.lesson, this.lesson.sentences[i]); }
	html += '</table>';
	
        let obj = document.querySelector(".lesson-section.transcript");
	obj.innerHTML = html;
	obj.style.display = "block";
        this.loader.hide();

      });
    }

    document.querySelector(".vocabulary").onclick = (e) => {
      document.querySelectorAll(".lesson-section").forEach((el) => { el.style.display = "none"; });
      this.loader.show();
      this.mod.fetchLessonVocabulary(this.lesson, (res) => {

console.log("RESULTS: " + JSON.stringify(res));

	let html = '<table>';
	for (let i = 0; i < this.lesson.words.length; i++) { html += WordTemplate(this.lesson.words[i]); }
	html += '</table>';
	
        let obj = document.querySelector(".lesson-section.vocabulary");
	obj.innerHTML = html;
	obj.style.display = "block";
        this.loader.hide();

      });
    }

    document.querySelector(".writing").onclick = (e) => {
      
    }

    document.querySelector(".test").onclick = (e) => {
      document.querySelectorAll(".lesson-section").forEach((el) => { el.style.display = "none"; });
      this.loader.show();
      this.mod.fetchLessonQuestions(this.lesson, (res) => {

	let html = '<table>';
	for (let i = 0; i < this.lesson.questions.length; i++) { html += QuestionTemplate(this.lesson.questions[i]); }
	html += '</table>';
	
        let obj = document.querySelector(".lesson-section.questions");
	obj.innerHTML = html;
	obj.style.display = "block";
        this.loader.hide();

      });
    }

  }
}

module.exports = PopupLesson;

