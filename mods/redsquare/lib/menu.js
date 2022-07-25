const RedSquareMenuTemplate = require("./menu.template");
const RedSquareWideSidebar = require("./sidebar/sidebar");
const RedSquareGamesSidebar = require("./sidebar/games-sidebar");

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
    }

    obj = document.querySelector('.redsquare-menu-notifications');
    obj.onclick = (e) => {
      mod.notifications.render(app, mod, ".appspace");
      mod.rsidebar.render(app, mod, ".saito-sidebar-right");
    }

    obj = document.querySelector('.redsquare-menu-settings');
    obj.onclick = (e) => {

      let obj = document.querySelector(".overlay");
      obj.classList.toggle("show");

/***
      // re-render sidebar
      mod.rsidebar.render(app, mod, ".saito-sidebar-right");

      // settings can render into appspace
      document.querySelector(".appspace").innerHTML = "";
      let settings_self = app.modules.returnModule("Settings");
      settings_self.respondTo("appspace").render(settings_self.app, settings_self);
***/
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
    }

  } 



}

module.exports = RedSquareMenu;


