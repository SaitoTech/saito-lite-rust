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
      this.setHash('home')
      this.mod.main.render_component = "home"
      let sql = `SELECT * FROM tweets WHERE flagged IS NOT 1 AND moderated IS NOT 1 AND tx_size < 10000000 ORDER BY updated_at DESC LIMIT 0,'${this.mod.results_per_page}'`;
      this.mod.loadTweetsFromPeer(this.mod.peers_for_tweets[0], sql, (txs) => {
        console.log(txs)
        this.app.connection.emit("redsquare-home-render-request");
      }, true);
  
    }

    document.querySelector(".redsquare-menu-notifications").onclick = (e) => {
      this.setHash('notifications')
      this.mod.main.render_component = "notifications"
      this.mod.viewing = "notifications";
      this.app.connection.emit("redsquare-notifications-render-request");

    }

//    document.querySelector(".redsquare-menu-contacts").onclick = (e) => {
//      this.app.connection.emit("redsquare-contacts-render-request");
//    }

    //
    // appspace modules
    //
    this.app.modules.returnModulesRenderingInto(".saito-main").forEach((mod) => {
      document.querySelector(`.redsquare-menu-${mod.returnSlug()}`).onclick = (e) => {
        this.setHash(mod.returnSlug())
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

    console.log('notifications number ', notifications)
    let qs = `.redsquare-menu-${menu_item}`;

    if (document.querySelector(qs)) {
      qs = `.redsquare-menu-${menu_item} > .saito-notification-dot`;
      let obj = document.querySelector(qs);
      if (!obj) {
        if (notifications > 0) {
	  this.app.browser.addElementToSelector(`<div class="saito-notification-dot">${notifications}</div>`, `.redsquare-menu-${menu_item}`);
	} else {
          this.app.browser.addElementToSelector(`<div class="saito-notification-dot"></div>`, `.redsquare-menu-${menu_item}`);
          qs = `.redsquare-menu-${menu_item} > .saito-notification-dot`;
          let obj = document.querySelector(qs);
          obj.style.display = "none";
	}
      } else {
        let existing_notifications = parseInt(obj.innerHTML);
        if (notifications <= 0) {
          obj.style.display = "none";
          obj.innerHTML = 0;
        } else {
          obj.style.display = "block";
          existing_notifications++;
          obj.innerHTML = existing_notifications;
        }
      }
    }
  }

  setHash (hash){
    window.history.pushState("", "", `/redsquare/#${hash}`)
  }
}

module.exports = RedSquareMenu;

