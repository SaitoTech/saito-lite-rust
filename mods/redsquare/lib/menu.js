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

  }

}

module.exports = RedSquareMenu;

