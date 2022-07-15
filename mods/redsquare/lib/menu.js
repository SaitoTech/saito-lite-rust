const RedSquareMenuTemplate = require("./menu.template");
const RedSquareWideSidebar = require("./sidebar/sidebar");
const RedSquareGamesSidebar = require("./sidebar/games-sidebar");
const GameCreateMenu = require("./../../arcade/lib/arcade-main/game-create-menu");
const ArcadeMain = require("./../../arcade/lib/arcade-main/arcade-main");

class RedSquareMenu {

  constructor(app) {
    this.name = "RedSquareMenu";
  }

  render(app, mod, container="") {

    if (!document.querySelector(".redsquare-menu")) {
      app.browser.addElementToSelector(RedSquareMenuTemplate(app, mod), container);
    }

    this.attachEvents(app, mod);

  }

  attachEvents(app, mod) {

    let obj;

    obj = document.querySelector('.redsquare-menu-home');
    obj.onclick = (e) => {

      mod.home.render(app, mod, ".appspace");
      mod.rsidebar.render(app, mod, ".saito-sidebar-right");
      for (let i = 0; i < mod.tweets.length; i++) {
        app.connection.emit('tweet-render-request', mod.tweets[i]);
      }

    }

    obj = document.querySelector('.redsquare-menu-notifications');
    obj.onclick = (e) => {
      mod.notifications.render(app, mod, ".appspace");
      mod.rsidebar.render(app, mod, ".saito-sidebar-right");
    }

    obj = document.querySelector('.redsquare-menu-settings');
    obj.onclick = (e) => {

      // re-render sidebar
      mod.rsidebar.render(app, mod, ".saito-sidebar-right");

      document.querySelector(".appspace").innerHTML = "";
      let settings_self = app.modules.returnModule("Settings");
      settings_self.respondTo("appspace").render(settings_self.app, settings_self);
    }

    obj = document.querySelector('.redsquare-menu-contacts');
    obj.onclick = (e) => {
      mod.contacts.render(app, mod, ".appspace");
      mod.rsidebar.render(app, mod, ".saito-sidebar-right");
    }

    obj = document.querySelector('.redsquare-menu-games');
    obj.onclick = (e) => {
      mod.games.render(app, mod, ".appspace");
      mod.gsidebar.render(app, mod, ".saito-sidebar-right");

      //
      // we need a good way to remove events
      //
      let red_button = document.querySelector("#redsquare-red-button");
      red_button.innerHTML = "Create Game";
      red_button.addEventListener("click", (e) => {
        let arcade_self = app.modules.returnModule("Arcade");
        GameCreateMenu.render(app, arcade_self);
        GameCreateMenu.attachEvents(app, arcade_self);
      });

    }

  } 



}

module.exports = RedSquareMenu;


