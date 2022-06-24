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

    let obj = document.querySelector('.redsquare-menu-invites');
    obj.onclick = (e) => {
      document.querySelector(".email-appspace").innerHTML = "";
      app.modules.returnModule("Invites").respondTo("email-appspace").render(app, this);
    }

  } 

}

module.exports = RedSquareMenu;


