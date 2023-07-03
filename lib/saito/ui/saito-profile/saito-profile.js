const SaitoProfileTemplate = require("./saito-profile.template");

class SaitoProfile {
  constructor(app, mod, container = "") {
    this.app = app;
    this.mod = mod;
    this.container = container;
    this.publickey = null;
    this.keys = this.app.keychain.returnKeys();

    this.app.connection.on("saito-profile-render-request", (publickey = "") => {
      this.publickey = publickey;
      this.render();
    });
  }

  async render() {
    document.querySelector(this.container).innerHTML = await SaitoProfileTemplate(
      this.app,
      this.mod,
      this
    );

    await this.addProfileMenu();

    this.attachEvents();
  }

  attachEvents() {}

  async addProfileMenu() {
    let this_profile = this;
    let mods = await this.app.modules.respondTo("saito-profile-menu", {
      publickey: this.publickey,
    });

    let index = 0;
    let menu_entries = [];
    for (const mod of mods) {
      let item = await mod.respondTo("saito-profile-menu");

      if (item instanceof Array) {
        item.forEach((j) => {
          if (!j.rank) {
            j.rank = 100;
          }
          menu_entries.push(j);
        });
      }
    }

    let menu_sort = function (a, b) {
      if (a.rank < b.rank) {
        return -1;
      }
      if (a.rank > b.rank) {
        return 1;
      }
      return 0;
    };
    menu_entries = menu_entries.sort(menu_sort);

    for (let i = 0; i < menu_entries.length; i++) {
      let j = menu_entries[i];
      let show_me = true;
      let active_mod = this.app.modules.returnActiveModule();
      if (typeof j.disallowed_mods != "undefined") {
        if (j.disallowed_mods.includes(active_mod.slug)) {
          show_me = false;
        }
      }
      if (typeof j.allowed_mods != "undefined") {
        show_me = false;
        if (j.allowed_mods.includes(active_mod.slug)) {
          show_me = true;
        }
      }
      if (show_me) {
        let id = `saito_profile_menu_item_${index}`;
        this_profile.callbacks[index] = j.callback;
        this_profile.addProfileMenuItem(j, id, index);
        index++;
      }
    }
  }

  addProfileMenuItem(item, id, index) {
    let html = `
          <i class="${item.icon}"></i>
        `;

    document.querySelector(".saito-profile-icons").innerHTML += html;
  }
}

module.exports = SaitoProfile;
