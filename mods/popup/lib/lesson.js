const PopupLessonTemplate = require("./lesson.template");

class PopupLesson {

  constructor(app, mod, container = ".popup-lesson") {
    this.app = app;
    this.mod = mod;
    this.container = container;
    this.name = "PopupLesson";
    this.lesson_id = "";
  }

  render(lesson_id="") {

    //
    // get our content
    //
    let lesson = this.mod.returnLesson(lesson_id);

    //
    // lesson content
    //
    this.app.browser.replaceElementContentBySelector(PopupLessonTemplate(lesson), ".popup-content");
    this.attachEvents();

    //
    // lesson title
    //
    let obj = document.querySelector(".popup-menu .header");
    if (obj) { obj.innerHTML = `<div class="level">${lesson.username}: </div><div class="title">${lesson.title}</div>`; }

    //
    // lesson menu
    //
    document.querySelectorAll("non-lesson").forEach((el) => { el.style.display = "none"; });
    document.querySelectorAll("lesson").forEach((el) => { el.style.display = "block"; });


  }

  attachEvents() {

    //document.querySelector(".popup-lesson-lessons").onclick = (e) => {
      //window.history.pushState({}, document.title, "/" + this.mod.slug);
      //history.replaceState(null, null, ' ');
      //this.app.connection.emit("popup-lessons-render-request");
    //}

  }
}

module.exports = PopupLesson;

