const RedSquareMainTemplate = require("./main.template");
const RedSquareAppspaceHome = require("./appspace/home");
const RedSquareAppspaceNotifications = require("./appspace/notifications");
const RedSquareAppspaceGames = require("./appspace/games");
const RedSquareAppspaceContacts = require("./appspace/contacts");

class RedSquareMain {

  constructor(app, mod, container = "") {

    this.app = app;
    this.mod = mod;
    this.container = container;
    this.name = "RedSquareMain";

    this.components = {};
    this.components['home'] = new RedSquareAppspaceHome(app, mod, ".saito-main");
    this.components['notifications'] = new RedSquareAppspaceNotifications(app, mod, ".saito-main");
    this.components['games'] = new RedSquareAppspaceGames(app, mod, ".saito-main");
    this.components['contacts'] = new RedSquareAppspaceContacts(app, mod, ".saito-main");
    this.render_component = 'home';


    this.app.connection.on("redsquare-home-render-request", (tx) => {
      document.querySelector(".saito-main").innerHTML = "";
      this.render_component = 'home';
      this.components[this.render_component].render();
    });

    this.app.connection.on("redsquare-notifications-render-request", (tx) => {
      document.querySelector(".saito-main").innerHTML = "";
      this.render_component = 'notifications';
      this.components[this.render_component].render();
    });

    this.app.connection.on("redsquare-contacts-render-request", (tx) => {
      document.querySelector(".saito-main").innerHTML = "";
      this.render_component = 'contacts';
      this.components[this.render_component].render();
    });

    this.app.connection.on("redsquare-games-render-request", (tx) => {
      document.querySelector(".saito-main").innerHTML = "";
      this.render_component = 'games';
      this.components[this.render_component].render();
    });

    this.app.connection.on("redsquare-tweet-render-request", (tweet) => {
      //this.app.browser.removeElementBySelector(this.components[this.render_component].container);
      //if (this.render_component == "home") {
      //  tweet.render();
      //}
    });



  }

  render() {

    //
    // render framework for app
    //
    if (document.querySelector(".saito-container")) {
      this.app.browser.replaceElementBySelector(RedSquareMainTemplate(), ".saito-container");
    } else {
      this.app.browser.addElementToSelectorOrDom(RedSquareMainTemplate(), this.container);
    }

    //
    // render home / tweet / games etc.
    //
    if (this.components[this.render_component]) {
      this.components[this.render_component].render();
    }

    //
    //
    //
    this.attachEvents();

  }  

  attachEvents() {
  }

}

module.exports = RedSquareMain;

