const PopupMainTemplate = require("./main.template");

class PopupMain {

  constructor(app, mod, container = "") {

    this.app = app;
    this.mod = mod;
    this.container = container;
    this.name = "PopupMain";

    this.app.connection.on("popup-home-render-request", () => {
      document.querySelector(".popup-content").innerHTML = "";
      this.mod.lesson.render(0);
    });

    this.app.connection.on("popup-lessons-render-request", (level="all") => {
alert("L: " + level);
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
    } else {
      this.app.browser.replaceElementBySelector(PopupMainTemplate(), ".saito-container");
    }


    this.attachEvents();
  }

  attachEvents() {

    

  }

}

module.exports = PopupMain;
