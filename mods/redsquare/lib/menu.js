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
      this.app.browser.addElementToSelectorOrDom(RedSquareMenuTemplate(this.app, this.mod), this.container);
    }

    //
    // appspace modules
    //
    this.app.modules.returnModulesRenderingInto(".saito-main").forEach((mod) => {
      if (!document.querySelector(`.redsquare-menu-${mod.returnSlug()}`)) {
        this.app.browser.addElementToSelector(
          `<li class="redsquare-menu-${mod.returnSlug()}">
            <i class="${mod.icon}"></i>
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

    document.querySelector(".redsquare-menu-contacts").onclick = (e) => {
      this.app.connection.emit("redsquare-contacts-render-request");
    }

    //
    // appspace modules
    //
    this.app.modules.returnModulesRenderingInto(".saito-main").forEach((mod) => {
      document.querySelector(`.redsquare-menu-${mod.returnSlug()}`).onclick = (e) => {
        document.querySelector(".saito-main").innerHTML = "";
        mod.renderInto(".saito-main");
        document.querySelector('.saito-container').scroll({ top: 0, left: 0, behavior: 'smooth' });
        if (mod.canRenderInto(".saito-sidebar.right")) {
          document.querySelector(".saito-sidebar.right").innerHTML = "";
          mod.renderInto(".saito-sidebar.right");
        }
      }
    });

  }


  incrementNotifications(menu_item, notifications = -1) {

    let qs = `.redsquare-menu-${menu_item}`;

    if (document.querySelector(qs)) {

      qs = `.redsquare-menu-${menu_item} > .saito-notification-dot`;
      let obj = document.querySelector(qs);
      if (!obj) {
        this.app.browser.addElementToSelector(`<div class="saito-notification-dot">1</div>`, `.redsquare-menu-${menu_item}`);
      } else {
        let existing_notifications = parseInt(obj.innerHTML);
        if (notifications == 0) {
          obj.style.display = "none";
        } else {
          obj.style.display = "block";
          existing_notifications++;
          obj.innerHTML = existing_notifications;
        }
      }
    }
  }

}

module.exports = RedSquareMenu;

