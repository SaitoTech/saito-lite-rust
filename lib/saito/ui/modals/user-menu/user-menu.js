const SaitoOverlay = require("../../saito-overlay/saito-overlay");
const userMenuTemplate = require("./user-menu.template");

class UserMenu {
  constructor(app, publicKey) {
    this.app = app;
    this.user_publickey = publicKey;
    this.overlay = new SaitoOverlay(app, null, true, true);
    this.callbacks = {};
  }

  async render() {
    let thisobj = this;
    if (!document.querySelector("#saito-user-menu")) {
      this.overlay.show(userMenuTemplate(this.app, this.user_publickey));

      let mods = this.app.modules.mods;

      let index = 0;
      for (const mod of mods) {
        let item = mod.respondTo("user-menu", { publicKey: this.user_publickey });
        console.log(item);
        if (item instanceof Array) {
          item.forEach((j) => {
            let id = `user_menu_item_${index}`;
            thisobj.callbacks[id] = j.callback;
            thisobj.addMenuItem(j, id);
            index++;
          });
        } else if (item != null) {
          let id = `user_menu_item_${index}`;
          thisobj.callbacks[id] = item.callback;
          thisobj.addMenuItem(item, id);
        }
        index++;
      }

      if ((await this.app.wallet.returnPreferredCryptoTicker()) !== "SAITO") {
        let id = `user_menu_item_${index}`;
        let ticker = await this.app.wallet.returnPreferredCryptoTicker();
        thisobj.callbacks[id] = function (app, publicKey) {
          alert("Send 3rd Party Crypto");
        };
        thisobj.addMenuItem({ icon: "fas fa-money-check-dollar", text: `Send ${ticker}` }, id);
        index++;
      } else {
        let id = `user_menu_item_${index}`;
        thisobj.callbacks[id] = function (app, publicKey) {
          alert("Send Saito Crypto");
        };
        thisobj.addMenuItem({ icon: "fas fa-money-check-dollar", text: "Send SAITO" }, id);
        index++;
      }
    }

    this.attachEvents();
  }

  attachEvents() {
    let thisobj = this;
    let pk = this.user_publickey;
    document.querySelectorAll(".saito-modal-menu-option").forEach((menu) => {
      let id = menu.getAttribute("id");
      let callback = thisobj.callbacks[id];
      menu.addEventListener("click", () => {
        callback(this.app, pk);
        thisobj.overlay.remove();
      });
    });
  }

  addMenuItem(item, id) {
    document.querySelector(".saito-modal-content").innerHTML += `
          <div id="${id}" class="saito-modal-menu-option"><i class="${item.icon}"></i><div>${item.text}</div></div>
        `;
  }
}

module.exports = UserMenu;
