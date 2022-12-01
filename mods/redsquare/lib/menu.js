const RedSquareMenuTemplate = require("./menu.template");

class RedSquareMenu {

  constructor(app, mod, container = "") {
    this.app = app;
    this.mod = mod;
    this.container = container;
    this.name = "RedSquareMenu";
  }

  render() {

    //
    // replace element or insert into page
    //
    if (document.querySelector(".redsquare-menu")) {
      this.app.browser.replaceElementBySelector(RedSquareMenuTemplate(this.app, this.mod), ".redsquare-menu");
    } else {
      if (this.container) {
        this.app.browser.addElementToSelector(RedSquareMenuTemplate(this.app, this.mod), this.container);
      } else {
        this.app.browser.addElementToDom(RedSquareMenuTemplate(this.app, this.mod));
      }
    }

    //
    // appspace modules
    //
    this.app.modules.getRespondTos("appspace").forEach((mod, i) => {
      if (!document.querySelector(`.redsquare-menu-${mod.returnSlug()}`)) {
        this.app.browser.addElementToSelector(
          `<li class="redsquare-menu-${mod.returnSlug()}">
            <i class="${mods.icon}"></i>
            <span>${mod.returnName()}</span>
          </li>`,
	  ".saito-menu-list"
	);
      }
    });

    this.attachEvents();
  }  



  attachEvents() {

    document.querySelector(".redsquare-menu-home").onclick = (e) => {
      this.app.connection.emit("redsquare-home-render-request");
    }

    document.querySelector(".redsquare-menu-notifications").onclick = (e) => {
      this.app.connection.emit("redsquare-notifications-render-request");
    }

    document.querySelector(".redsquare-menu-games").onclick = (e) => {
      this.app.connection.emit("redsquare-games-render-request");
    }

    document.querySelector(".redsquare-menu-contacts").onclick = (e) => {
      this.app.connection.emit("redsquare-contacts-render-request");
    }


    //
    // appspace modules
    //
    this.app.modules.getRespondTos("appspace").forEach((mod, i) => {
      document.querySelector(`.redsquare-menu-${this.app.modules.mods[i].returnSlug()}`).onclick = (e) => {
        let y = this.app.modules.mods[i].respondTo("appspace");
        y.container = "saito-main";
	y.render();
        document.querySelector('.saito-container').scroll({top:0, left:0, behavior: 'smooth'});
      }
    });

  }

}

module.exports = RedSquareMenu;

