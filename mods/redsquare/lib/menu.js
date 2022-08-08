const RedSquareMenuTemplate = require("./menu.template");
const RedSquareWideSidebar = require("./sidebar/sidebar");
const RedSquareGamesSidebar = require("./sidebar/games-sidebar");
const RedSquareSettingsSidebar = require("./sidebar/settings-sidebar");



class RedSquareMenu {

  constructor(app) {
    this.name = "RedSquareMenu";
  }

  render(app, mod, container = "") {

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
                  <span> ${app.modules.mods[i].appname}</span>
                </li>
    `;
        if (!document.querySelector(`.redsquare-menu-${app.modules.mods[i].returnSlug()}`)){
          app.browser.addElementToSelector(html, ".saito-menu-list");          
        }

      }
    }
    this.attachEvents(app, mod);
  }


  attachEvents(app, mod) {

    this_menu = this;

    let obj;

    obj = document.querySelector('.redsquare-menu-home');
    obj.onclick = (e) => {
      this_menu.renderItem(app, mod, "home");
    }

    obj = document.querySelector('.redsquare-menu-notifications');
    obj.onclick = (e) => {
      this_menu.renderItem(app, mod, "notifications");
    }

    obj = document.querySelector('.redsquare-menu-settings');
    obj.onclick = (e) => {
      this_menu.renderItem(app, mod, "settings");
    }

    obj = document.querySelector('.redsquare-menu-contacts');
    obj.onclick = (e) => {
      this_menu.renderItem(app, mod, "contacts");
    }
    obj = document.querySelector('.redsquare-menu-games');
    obj.onclick = (e) => {
      this_menu.renderItem(app, mod, "games");
    }


    //
    // appspace modules
    //
    for (let i = 0; i < app.modules.mods.length; i++) {
      let x = app.modules.mods[i].respondTo("appspace");
      if (x) {
        let qs = ".redsquare-menu-" + app.modules.mods[i].returnSlug();
        obj = document.querySelector(qs);
        obj.onclick = (e) => {
          this.renderItem(app, mod, app.modules.mods[i].returnSlug());
        }
      }
    }

  }

  renderItem(app, mod, component) {

    let matched = 0;

    switch (component) {
      case "home":
        mod.home.render(app, mod, ".appspace");
        mod.rsidebar.render(app, mod, ".saito-sidebar-right");
        window.location.hash = component;
        break;
      case "notifications":
        mod.notifications.render(app, mod, ".appspace");
        mod.rsidebar.render(app, mod, ".saito-sidebar-right");
        window.location.hash = component;
        matched = 1;
        break;
      case "settings":
        // re-render sidebar
        mod.settsidebar.render(app, mod, ".saito-sidebar-right");

        // settings can render into appspace
        document.querySelector(".appspace").innerHTML = "";
        let settings_self = app.modules.returnModule("Settings");
        settings_self.respondTo("appspace").render(settings_self.app, settings_self);
        window.location.hash = component;
        matched = 1;
        break;
      case "contacts":
        mod.contacts.render(app, mod, ".appspace");
        mod.rsidebar.render(app, mod, ".saito-sidebar-right");
        window.location.hash = component;
        matched = 1;
        break;
      case "games":
        mod.games.render(app, mod, ".appspace");
        mod.gsidebar.render(app, mod, ".saito-sidebar-right");
        window.location.hash = component;
        matched = 1;
        break;
      default:
        //
        // appspace modules
        //
        for (let i = 0; i < app.modules.mods.length; i++) {
          if (app.modules.mods[i].returnSlug() == component) {
            window.location.hash = component;
            matched = 1;
            document.querySelector(".appspace").innerHTML = "";
            let x = app.modules.mods[i].respondTo("appspace");
            if (x) {
              x.render(app, app.modules.mods[i], ".appspace");
              let y = app.modules.mods[i].respondTo("appspace-sidebar");
              if (y) {
                document.querySelector(".appspace-sidebar").innerHTML = "";
                y.render(app, app.modules.mods[i], ".appspace-sidebar");
              } else {
                mod.rsidebar.render(app, app.modules.mods[i], ".saito-sidebar-right");
              }
            }
          }
        }

    }


    return matched;
  }



}

module.exports = RedSquareMenu;


