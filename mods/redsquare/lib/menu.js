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

    //
    // appspace modules
    //
    for (let i = 0; i < app.modules.mods.length; i++) {
      let x = app.modules.mods[i].respondTo("appspace");
      if (x) {
	let html = `
                <li class="redsquare-menu-${app.modules.mods[i].returnSlug()}" data-id="${i}">
                  <i class="${app.modules.mods[i].icon}"></i>
                  <span> ${app.modules.mods[i].name}</span>
                </li>
	`;
	app.browser.addElementToSelector(html, ".saito-menu-list");
      }
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

      // re-render sidebar
      mod.rsidebar.render(app, mod, ".saito-sidebar-right");

      // settings can render into appspace
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
    }


    //
    // appspace modules
    //
    for (let i = 0; i < app.modules.mods.length; i++) {
      let x = app.modules.mods[i].respondTo("appspace");
      if (x) {
	let qs = ".redsquare-menu-"+app.modules.mods[i].returnSlug();
        obj = document.querySelector(qs);
        obj.onclick = (e) => {
	  document.querySelector(".appspace").innerHTML = "";
          x.render(app, mod, ".appspace");
        }
      }
    }

  } 



}

module.exports = RedSquareMenu;


