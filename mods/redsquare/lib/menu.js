const RedSquareMainTemplate = require("./main/redsquare-main.template");
const RedSquareMenuTemplate = require("./menu.template");
const RedSquareWideSidebar = require("./sidebar");
const RedSquareGamesSidebar = require("./games-sidebar");
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
      mod.rsidebar.render(app, mod);
      for (let i = 0; i < mod.tweets.length; i++) {
        app.connection.emit('tweet-render-request', mod.tweets[i]);
      }

    }

    obj = document.querySelector('.redsquare-menu-notifications');
    obj.onclick = (e) => {

      mod.notifications.render(app, mod, ".appspace");
      mod.rsidebar.render(app, mod);

      //let invites_self = app.modules.returnModule("Invites");
      //invites_self.respondTo("appspace").render(invites_self.app, invites_self);
    }

    obj = document.querySelector('.redsquare-menu-settings');
    obj.onclick = (e) => {

      // re-render sidebar
      document.querySelector(".saito-sidebar.right").remove();
      mod.wide_sidebar.render(app, mod);

      document.querySelector(".appspace").innerHTML = "";
      let settings_self = app.modules.returnModule("Settings");
      settings_self.respondTo("appspace").render(settings_self.app, settings_self);
    }

    obj = document.querySelector('.redsquare-menu-contacts');
    obj.onclick = (e) => {

      mod.contacts.render(app, mod, ".appspace");
      mod.rsidebar.render(app, mod);

    }

    obj = document.querySelector('.redsquare-menu-games');
    obj.onclick = (e) => {

      mod.games.render(app, mod, ".appspace");
      mod.gsidebar.render(app, mod);

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


