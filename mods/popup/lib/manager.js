const LessonManagerTemplate = require("./manager.template");
const TeaserTemplate = require("./teaser.template");
const SaitoLoader = require("./../../../lib/saito/ui/saito-loader/saito-loader");

class LessonManager {

  constructor(app, mod, container = ".popup-content") {
    this.app = app;
    this.mod = mod;
    this.container = container;

    //This is an in-place loader... not super useful when content is overflowing off the bottom of the screen
    this.loader = new SaitoLoader(app, mod, "#popup-intersection");

    //////////////////////////////
    // load more on scroll-down //
    //////////////////////////////
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {

            this.showLoader();
/**
            mod.loadMoreLessons(null, (txs) => {
                this.hideLoader();
                if (document.querySelector("#popup-intersection")) {
                  this.intersectionObserver.unobserve(
                    document.querySelector("#popup-intersection")
                  );
                }
            });
**/
          }
        });
      },
      {
        root: null,
        rootMargin: "30px",
        threshold: 1,
      }
    );
  }


  render(level="all") {

    //
    // Stop observering while we rebuild the page
    //
    this.intersectionObserver.disconnect();

    this.app.browser.addElementToSelector(LessonManagerTemplate(), this.container);
    this.showLoader();

    for (let i = 0; i < this.mod.lessons.length; i++) {
      if (level === "all" || this.mod.lessons[i].userslug === level) {
        this.app.browser.addElementToSelector(TeaserTemplate(this.mod.lessons[i]), ".lessons"); 
      }
    }

    setTimeout(() => {
      this.hideLoader();
    }, 50);

    //
    // enable intersection observer
    //
    this.attachEvents();

  }

  attachEvents() {

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

    document.querySelector(".short-stories").onclick = (e) => {
      window.history.pushState({}, document.title, "/lessons/short-stories");
      history.replaceState(null, null, ' ');
      this.app.connection.emit("popup-lessons-render-request", ("short-stories"));
    }

    document.querySelector(".ktv-wednesday").onclick = (e) => {
      window.history.pushState({}, document.title, "/lessons/ktv-wednesday");
      history.replaceState(null, null, ' ');
      this.app.connection.emit("popup-lessons-render-request", ("ktv-wednesday"));
    }




    //
    // click to lesson
    //
    document.querySelectorAll(".teaser").forEach((el) => {
      el.onclick = (e) => {
	let lesson_id = e.currentTarget.id;
        this.app.connection.emit("popup-lesson-render-request", (lesson_id));
      }
    });


    //
    // dynamic content loading
    //
    let ob = document.getElementById("popup-intersection");
    if (ob) { this.intersectionObserver.observe(ob); }

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

  }

  showLoader() {
    this.loader.show();
  }

  hideLoader() {
    this.loader.hide();
  }
}

module.exports = LessonManager;
