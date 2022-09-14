const RedSquareMenuTemplate = require("./menu.template");
const RedSquareWideSidebar = require("./sidebar/sidebar");
const RedSquareGamesSidebar = require("./sidebar/games-sidebar");
const RedSquareSettingsSidebar = require("./sidebar/settings-sidebar");



class RedSquareMenu {

  constructor(app, mod) {
    this.name = "RedSquareMenu";
    this.numberOfNotifications = 0;

    app.connection.on('redsquare-menu-notification-request', (obj) => {
      let menu_item = obj.menu;
      let notifications = obj.num;
console.log(menu_item + " -- " + notifications);
      this.displayNotification(app, menu_item, notifications)
    })

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
                  <span> ${app.modules.mods[i].returnName()}</span>
             
                </li>
        `;
        if (!document.querySelector(`.redsquare-menu-${app.modules.mods[i].returnSlug()}`)) {
          app.browser.addElementToSelector(html, ".saito-menu-list");
        }

      }
    }
    this.attachEvents(app, mod);
  }




  attachEvents(app, mod) {
    this_menu = this;
    const left_sidebar = document.querySelector('.saito-sidebar.left');
    const icon = document.querySelector('.saito-sidebar.left .hamburger #icon');
    const removeLeftSidebar = () => {
      left_sidebar.classList.remove('mobile');
      icon.className = "fas fa-bars";
    }

    let obj;

    obj = document.querySelector('.redsquare-menu-home');
    if (obj) {
      obj.onclick = (e) => {
        removeLeftSidebar()
        window.history.replaceState({}, "Saito RedSquare", "/redsquare/");
        this_menu.renderItem(app, mod, "home");
      }
    }
    obj = document.querySelector('.redsquare-menu-notifications');
    if (obj) {
      obj.onclick = (e) => {
        removeLeftSidebar()
        this_menu.renderItem(app, mod, "notifications");
      }
    }
    obj = document.querySelector('.redsquare-menu-settings');
    if (obj) {
      obj.onclick = (e) => {
        removeLeftSidebar()
        this_menu.renderItem(app, mod, "settings");
      }
    }
    obj = document.querySelector('.redsquare-menu-contacts');
    if (obj) {
      obj.onclick = (e) => {
        removeLeftSidebar()
        this_menu.renderItem(app, mod, "contacts");
      }
    }
    obj = document.querySelector('.redsquare-menu-games');
    if (obj) {
      obj.onclick = (e) => {
        removeLeftSidebar()
        this_menu.renderItem(app, mod, "games");
      }
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
          removeLeftSidebar()
          this.renderItem(app, mod, app.modules.mods[i].returnSlug());
        }
      }
    }
  }

  renderItem(app, mod, component, params = null) {
    let url = component
    if (params) {
      url = `${component}?${params}`;
    }

    let matched = 0;
    switch (component) {
      case "home":
        mod.home.render(app, mod, ".appspace");
        window.location.hash = url;
        mod.rsidebar.render(app, mod, ".saito-sidebar-right");
        break;
      case "notifications":
        mod.notifications.render(app, mod, ".appspace");
        window.location.hash = url;
        mod.rsidebar.render(app, mod, ".saito-sidebar-right");
        matched = 1;
        break;
      case "settings":
        // re-render sidebar
        mod.settsidebar.render(app, mod, ".saito-sidebar-right");

        // settings can render into appspace
        document.querySelector(".appspace").innerHTML = "";
        let settings_self = app.modules.returnModule("Settings");
        window.location.hash = url;
        settings_self.respondTo("appspace").render(settings_self.app, settings_self);
        matched = 1;
        break;
      case "contacts":
        mod.contacts.render(app, mod, ".appspace");
        window.location.hash = url;
        mod.rsidebar.render(app, mod, ".saito-sidebar-right");
        matched = 1;
        break;
      case "games":
        mod.games.render(app, mod, ".appspace");
        window.location.hash = url;
        mod.gsidebar.render(app, mod, ".saito-sidebar-right");
        matched = 1;
        break;
      default:
        //
        // appspace modules
        //
        for (let i = 0; i < app.modules.mods.length; i++) {
          if (app.modules.mods[i].returnSlug() == component) {
            window.location.hash = url;
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


  displayNotification(app, menu_item, notifications = Math.floor(Math.random() * 20)) {
    let obj = `.redsquare-menu-${menu_item}`
    if (document.querySelector(obj)) {
      if (!document.querySelector(`${obj} .saito-notification-dot`)) {
        app.browser.addElementToSelector(`<p class="saito-notification-dot">${notifications}</p>`, obj);
      }else {
        obj = `.redsquare-menu-${menu_item} .saito-notification-dot`
        app.browser.replaceElementBySelector(`<p class="saito-notification-dot">${notifications}</p>`, obj)
      }
    }
  }


}

module.exports = RedSquareMenu;


