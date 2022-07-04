const RedSquareMenuTemplate = require("./menu.template");

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
      document.querySelector(".email-appspace").innerHTML = "";
      let invites_self = app.modules.returnModule("Invites");
      invites_self.respondTo("email-appspace").render(invites_self.app, invites_self);
    }

    obj = document.querySelector('.redsquare-menu-settings');
    obj.onclick = (e) => {
      document.querySelector(".email-appspace").innerHTML = "";
      let settings_self = app.modules.returnModule("Settings");
      settings_self.respondTo("email-appspace").render(settings_self.app, settings_self);
    }

    obj = document.querySelector('.redsquare-menu-arcade');
    obj.onclick = (e) => {
      document.querySelector(".email-appspace").innerHTML = "";
      let arcade_self = app.modules.returnModule("Arcade");
      arcade_self.respondTo("email-appspace").render(arcade_self.app, arcade_self);
    }

  } 

}

module.exports = RedSquareMenu;


