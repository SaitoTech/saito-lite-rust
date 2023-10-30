const PopupMenuTemplate = require("./menu.template");

class PopupMenu {

  constructor(app, mod, container = ".popup-menu") {
    this.app = app;
    this.mod = mod;
    this.container = container;
    this.name = "PopupMenu";
  }

  render() {

    //
    // replace element or insert into page
    //
    this.app.browser.replaceElementContentBySelector(PopupMenuTemplate(this.app, this.mod), ".popup-menu");
    this.attachEvents();

  }

  attachEvents() {

    document.querySelector(".podcast-archives").onclick = (e) => {
      window.history.pushState({}, document.title, "/lessons");
      history.replaceState(null, null, ' ');
      this.app.connection.emit("popup-lessons-render-request", ("all"));
    }

    document.querySelector(".absolute-beginners").onclick = (e) => {
      window.history.pushState({}, document.title, "/lessons/absolute-beginners");
      history.replaceState(null, null, ' ');
      this.app.connection.emit("popup-lessons-render-request", ("absolute-beginners"));
    }

    document.querySelector(".elementary").onclick = (e) => {
      window.history.pushState({}, document.title, "/lessons/elementary");
      history.replaceState(null, null, ' ');
      this.app.connection.emit("popup-lessons-render-request", ("elementary"));
    }

    document.querySelector(".intermediate").onclick = (e) => {
      window.history.pushState({}, document.title, "/lessons/intermediate");
      history.replaceState(null, null, ' ');
      this.app.connection.emit("popup-lessons-render-request", ("intermediate"));
    }

    document.querySelector(".advanced").onclick = (e) => {
      window.history.pushState({}, document.title, "/lessons/advanced");
      history.replaceState(null, null, ' ');
      this.app.connection.emit("popup-lessons-render-request", ("advanced"));
    }

    document.querySelector(".film-friday").onclick = (e) => {
      window.history.pushState({}, document.title, "/lessons/film-friday");
      history.replaceState(null, null, ' ');
      this.app.connection.emit("popup-lessons-render-request", ("film-friday"));
    }

    document.querySelector(".quiz-night").onclick = (e) => {
      window.history.pushState({}, document.title, "/lessons/quiz-night");
      history.replaceState(null, null, ' ');
      this.app.connection.emit("popup-lessons-render-request", ("quiz-night"));
    }

/***
    document.querySelector(".popup-menu-vocabulary").onclick = (e) => {
      //window.history.pushState({}, document.title, "/" + this.mod.slug);
      //window.location.hash = "#notifications";
      this.app.connection.emit("popup-vocabulary-render-request");
    };

    document.querySelector(".popup-menu-tools").onclick = (e) => {
      //window.history.pushState({}, document.title, "/" + this.mod.slug);
      //window.location.hash = "#profile";
      this.app.connection.emit("popup-tools-render-request", this.mod.publicKey);
    };
***/

  }
}

module.exports = PopupMenu;

