const JSON = require("json-bigint");
const ArcadeMainTemplate = require("./main.template");
const ArcadeMenu = require("./menu");
const GameSlider = require("../game-slider");
const ArcadeInitializer = require("./initializer");
const SaitoSidebar = require('./../../../../lib/saito/ui/saito-sidebar/saito-sidebar');

class ArcadeMain {

  constructor(app, mod, container = "") {

    this.app = app;
    this.mod = mod;

    //
    // left sidebar
    //
    this.sidebar = new SaitoSidebar(this.app, this.mod, ".saito-container");
    this.sidebar.align = "nope";
    this.menu = new ArcadeMenu(this.app, this.mod, ".saito-sidebar.left");
    this.sidebar.addComponent(this.menu);
    this.slider = new GameSlider(this.app, this.mod, ".arcade-game-slider");
    this.initializer = new ArcadeInitializer(this.app, this.mod, ".arcade-central-panel");

    //
    // load init page
    //
    app.connection.on("arcade-game-initialize-render-request", (game_id) => {
      document.querySelector(".arcade-central-panel").innerHTML = "";
      this.mod.is_game_initializing = true;
      this.slider.hide();
      this.initializer.render(game_id);
    });

  }



  render() {

    if (document.querySelector(".saito-container")) {
      this.app.browser.replaceElementBySelector(ArcadeMainTemplate(), ".saito-container");
    } else {
      this.app.browser.addElementToSelectorOrDom(ArcadeMainTemplate(), this.container);
    }

    this.sidebar.render();

    //
    // slider
    //
    this.slider.render();

    //
    // invite manager
    //
    this.app.modules.renderInto(".arcade-invites-box");

    //
    // appspace modules
    //
    this.app.modules.renderInto(".arcade-leagues");

    this.attachEvents();

  }



  attachEvents() {

    var scrollableElement = document.querySelector(".saito-container");
    var sidebar = document.querySelector(".saito-sidebar.right");
    var scrollTop = 0;
    var stop = 0;

    scrollableElement.addEventListener("scroll", (e) => {
      if (window.innerHeight - 150 < sidebar.clientHeight) {
        if (scrollTop < scrollableElement.scrollTop) {
          stop = window.innerHeight - sidebar.clientHeight + scrollableElement.scrollTop;
          if (scrollableElement.scrollTop + window.innerHeight > sidebar.clientHeight) {
            sidebar.style.top = stop + "px";
          }
        } else {
          if (stop > scrollableElement.scrollTop) {
            stop = scrollableElement.scrollTop;
            sidebar.style.top = stop + "px";
          }
        }
      } else {
        stop = scrollableElement.scrollTop;
        sidebar.style.top = stop + "px";
      }
      scrollTop = scrollableElement.scrollTop;
    });

  }

}

module.exports = ArcadeMain;

