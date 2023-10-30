const PopupMainTemplate = require("./main.template");
const TestimonialsTemplate = require("./testimonials.template");

class PopupMain {

  constructor(app, mod, container = "") {

    this.app = app;
    this.mod = mod;
    this.container = container;
    this.name = "PopupMain";

    this.app.connection.on("popup-home-render-request", () => {
      document.querySelector(".popup-content").innerHTML = "";
      this.app.browser.addElementToSelector(TestimonialsTemplate(), ".popup-content");
    });

    this.app.connection.on("popup-lessons-render-request", (level="all") => {
      document.querySelector(".popup-content").innerHTML = "";
      this.mod.manager.render(level);
    });

    this.app.connection.on("popup-lesson-render-request", (lesson_id) => {
      document.querySelector(".popup-content").innerHTML = "";
      this.mod.lesson.render(lesson_id);
    });

  }

  render() {

    if (!document.querySelector(".saito-container")) {
      this.app.browser.addElementToDom(PopupMainTemplate());
      this.app.browser.addElementToSelector(TestimonialsTemplate(), ".popup-content");
    } else {
      this.app.browser.replaceElementBySelector(PopupMainTemplate(), ".saito-container");
    }

    this.attachEvents();
  }

  attachEvents() {

    

  }

}

module.exports = PopupMain;
