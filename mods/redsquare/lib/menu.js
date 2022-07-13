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
      app.browser.addElementToClass(RedSquareMenuTemplate(app, mod), container);
    }

    this.attachEvents(app, mod);

  }

  attachEvents(app, mod) {

    let obj;

    obj = document.querySelector('.redsquare-menu-invites');
    obj.onclick = (e) => {
      document.querySelector(".appspace").innerHTML = "";
      let invites_self = app.modules.returnModule("Invites");
      invites_self.respondTo("appspace").render(invites_self.app, invites_self);
    }

    obj = document.querySelector('.redsquare-menu-settings');
    obj.onclick = (e) => {
      document.querySelector(".appspace").innerHTML = "";
      let settings_self = app.modules.returnModule("Settings");
      settings_self.respondTo("appspace").render(settings_self.app, settings_self);
    }

    obj = document.querySelector('.redsquare-menu-contacts');
    obj.onclick = (e) => {
      document.querySelector(".appspace").innerHTML = "";
      mod.contactlist.render(app, mod);
    }

    obj = document.querySelector('.redsquare-menu-arcade');
    obj.onclick = (e) => {

      //
      let arcade_mod = app.modules.returnModule("Arcade");
      ArcadeMain.render(app, arcade_mod);
      ArcadeMain.attachEvents(app, arcade_mod);

/***
      // re-render element
      document.querySelector(".saito-sidebar.right").remove();
      mod.games_sidebar.render(app, mod);

      // remove appspace content and re-fill
      document.querySelector(".appspace").innerHTML = "";
      let arcade_self = app.modules.returnModule("Arcade");
      arcade_self.respondTo("appspace").render(arcade_self.app, arcade_self);
***/

      //
      // we need a good way to remove events
      //
      let red_button = document.querySelector("#redsquare-red-button");
      red_button.innerHTML = "Create Game";
      red_button.addEventListener("click", (e) => {
alert("click");
        let arcade_self = app.modules.returnModule("Arcade");
        GameCreateMenu.render(app, arcade_self);
        GameCreateMenu.attachEvents(app, arcade_self);
      });

    }

  } 



}

module.exports = RedSquareMenu;


