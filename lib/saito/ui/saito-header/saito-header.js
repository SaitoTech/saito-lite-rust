const SaitoHeaderTemplate = require("./saito-header.template");
const SaitoOverlay = require("./../../ui/saito-overlay/saito-overlay");
const UIModTemplate = require("./../../../templates/uimodtemplate");
const SelectCrypto = require("../../ui/modals/select-crypto/select-crypto.js");
const MyUserMenu = require("../../ui/modals/my-user-menu/my-user-menu.js");

//
// UIModTemplate
//
// The header derives from UIModTemplate -- this allows the component
// to be added to the list of modules that are actively running on Saito
// thus allowing them to receive transactions and update their UI just
// like any other modules.
//
class SaitoHeader extends UIModTemplate {
  constructor(app, mod) {
    super(app, mod);

    //
    // UI components as modules allows them to respond
    // to events individually...
    //
    this.name = "SaitoHeader UIComponent";
    this.app = app;
    this.mod = mod;

    //
    // if left open, we are probably checking our balance
    // so keep track of whether we are open and keep a
    // timer for periodic checks.
    //
    this.is_open = false;
    this.time_last = new Date().getTime();
    this.time_open = 0;
    this.balance_queries = 0;
    this.query_active = false;

    this.timer = setInterval(() => {
      if (this.is_open == false) {
        this.time_open = 0;
        this.time_last = new Date().getTime();
      } else {
        if (this.balance_queries < 100) {
          this.time_open += new Date().getTime() - this.time_last;
          this.time_last = new Date().getTime();
          if (this.time_open > 15000) {
            this.balance_queries++;
            this.renderCrypto().then((r) => {});
          }
        }
      }
    }, 10000);

    //
    // now initialize, since UI components are created
    // after all other modules have initialized, we need
    // to run any missed functions here in the constructor
    // in this case, initialize, as that is what processes
    // receiveEvent, etc.
    //
    this.initialize(this.app)
  }

  async initialize(app) {
    await super.initialize(app);
    this.myUserMenu = new MyUserMenu(app, this.publicKey);
    this.callbacks = {};
    console.log('initializing header ', this)

    app.connection.on("update_identifier", async (publickey) => {
      if (publickey === this.publicKey) {
        await this.render();
      }
    });

    app.connection.on("update_balance", async (wallet) => {
      await this.renderCrypto();
    });

    app.connection.on("set_preferred_crypto", async (data) => {
      await this.renderCrypto();
    });
  }

  async render() {
    let this_header = this;
    let app = this.app;
    let mod = this.mod;

    if (mod == null || !document) {
      return;
    }

    //
    // add to DOM if needed
    //
    if (!document.getElementById("saito-header")) {
      app.browser.addElementToDom(await SaitoHeaderTemplate(app, mod));
    } else {
      app.browser.replaceElementById(await SaitoHeaderTemplate(app, mod), "saito-header");
    }

    let mods = await app.modules.respondTo("saito-header");

    let index = 0;
    let menu_entries = [];
    for (const mod1 of mods) {
      let item = await mod1.respondTo("saito-header");
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
        let id = `saito_header_menu_item_${index}`;
        console.log(this_header,this_header.callbacks, 'header')
        this_header.callbacks[id] = j.callback;
        this_header.addMenuItem(j, id);
        index++;
      }
    }

    this.app.browser.generateQRCode(this.publicKey);

    //
    // render cryptos
    //
    await this.renderCrypto();

    await this.app.modules.renderInto(".saito-header");
    await this.app.modules.renderInto(".saito-header-themes");

    this.renderUsername();
    await this.addFloatingMenu();
    this.attachEvents();
  }

  async addFloatingMenu() {
    let this_header = this;
    let mods = await this.app.modules.respondTo("saito-floating-menu");

    let index = 0;
    let menu_entries = [];
    for (const mod of mods) {
      let item = await mod.respondTo("saito-floating-menu");

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
        let id = `saito_floating_menu_item_${index}`;
        this_header.callbacks[index] = j.callback;
        this_header.addFloatingMenuItem(j, id, index);
        index++;
      }
    }
  }

  addFloatingMenuItem(item, id, index) {
    let html = `
      <div id="${id}" data-id="${index}" class="saito-floating-menu-item">
        <i class="${item.icon}"></i>
      </div>
    `;

    document.querySelector(".saito-floating-item-container").innerHTML += html;
  }

  addMenuItem(item, id) {
    let html = `     
      <li id="${id}" data-id="${item.text}" class="saito-header-appspace-option">
        <i class="${item.icon}"></i>
        <span>${item.text}</span>
      </li>
    `;

    if (typeof item.type != "undefined") {
      document.querySelector("." + item.type + "  .saito-menu > ul").innerHTML += html;
    } else {
      document.querySelector(
        ".saito-header-menu-section.appspace-menu > .saito-menu > ul"
      ).innerHTML += html;
    }
  }

  attachEvents() {
    let app = this.app;
    let mod = this.mod;
    let this_header = this;

    document.querySelectorAll(".saito-header-appspace-option").forEach((menu) => {
      let id = menu.getAttribute("id");
      let data_id = menu.getAttribute("data-id");
      let callback = this_header.callbacks[id];

      menu.addEventListener("click", (e) => {
        this.closeMenu();
        e.preventDefault();
        callback(app, data_id);
      });
    });

    if (document.querySelector("#saito-header-menu-toggle")) {
      document.querySelector("#saito-header-menu-toggle").addEventListener("click", () => {
        this.toggleMenu();
      });
    }

    //
    // default buttons
    //
    let username = app.keychain.returnIdentifierByPublicKey(this.publicKey, true);
    if (username != "" && username != this.publicKey) {
      document.querySelector(".header-username").innerHTML = username;
    }

    document.querySelector("#wallet-btn-withdraw").onclick = (e) => {
      let ticker = e.currentTarget.getAttribute("data-ticker");
      let balance = e.currentTarget.getAttribute("data-balance");
      let sender = e.currentTarget.getAttribute("data-sender");

      let obj = {};
      obj.address = "";
      obj.balance = balance;
      obj.ticker = ticker;
      app.connection.emit("saito-crypto-withdraw-render-request", obj);
    };
    document.querySelector("#wallet-btn-history").onclick = (e) => {
      let obj = {};
      obj.ticker = document.querySelector("#wallet-btn-history").getAttribute("data-ticker");
      app.connection.emit("saito-crypto-history-render-request", obj);
    };
    try {
      document.querySelector(".saito-header-chat").onclick = async (e) => {
        this.toggleMenu();
        let chatmod = this.app.modules.returnModule("Chat");
        if (chatmod) {
          let cmo = await chatmod.respondTo("chat-manager-overlay");
          await cmo.render();
        } else {
          window.location = "/chat";
        }
      };
    } catch (err) {}

    document.querySelector(".pubkey-containter").onclick = async (e) => {
      let public_key = document.getElementById("profile-public-key").innerHTML;
      await navigator.clipboard.writeText(public_key);
      let icon_element = document.querySelector(".pubkey-containter i");
      icon_element.classList.toggle("fa-copy");
      icon_element.classList.toggle("fa-check");

      setTimeout(() => {
        icon_element.classList.toggle("fa-copy");
        icon_element.classList.toggle("fa-check");
      }, 800);
    };

    document.querySelectorAll("#wallet-select-crypto").forEach((element, i) => {
      element.onchange = async (value) => {
        if (element.value === "add-new") {
          let current_default = await app.wallet.returnPreferredCrypto();
          let select_box = document.querySelector(".saito-select-crypto");
          select_box.value = current_default.name;
          let appstore_mod = app.modules.returnModule("AppStore");
          if (appstore_mod) {
            let options = { search: "", category: "Cryptocurrency", featured: 1 };
            await appstore_mod.openAppstoreOverlay(options);
          } else {
            salert("Cannot install other cryptocurrencies without the appstore!");
          }
          return;
        }

        await app.wallet.setPreferredCrypto(element.value, 1);
      };
    });

    document.querySelector(".saito-header-logo").onclick = (e) => {
      window.location.href = "/" + mod.returnSlug();
    };

    if (document.querySelector(".more-options") != null) {
      document.querySelector(".more-options").onclick = (e) => {
        // document.querySelectorAll('.more-options span').forEach(function(item, key){
        //   item.classList.toggle("show");
        // });
        // document.querySelector('.slidein-panel').classList.toggle("show");

        app.connection.emit("settings-overlay-render-request");
      };
    }

    if (document.querySelector("#saito-floating-plus-btn") != null) {
      document.getElementById("saito-floating-plus-btn").addEventListener("click", (e) => {
        document.querySelector(".saito-floating-item-container").classList.toggle("show");
        document.querySelector(".saito-floating-plus-btn").classList.toggle("activated");
      });
    }

    if (document.querySelector(".saito-floating-menu-item") != null) {
      document.querySelectorAll(".saito-floating-menu-item").forEach((menu) => {
        let id = menu.getAttribute("id");
        let data_id = menu.getAttribute("data-id");
        let callback = this_header.callbacks[data_id];

        menu.addEventListener("click", (e) => {
          e.preventDefault();
          callback(this_header.app, data_id);
          document.querySelector(".saito-floating-item-container").classList.toggle("show");
          document.querySelector(".saito-floating-plus-btn").classList.toggle("activated");
        });
      });
    }
  }

  async updateBalanceForAddress() {}

  async renderCrypto() {
    try {
      let available_cryptos = this.app.wallet.returnInstalledCryptos();
      let preferred_crypto = await this.app.wallet.returnPreferredCrypto();
      let add = preferred_crypto.returnAddress();

      if (typeof preferred_crypto.destination != "undefined") {
        if (
          document.querySelector("#profile-public-key").innerHTML != preferred_crypto.destination
        ) {
          document.querySelector("#profile-public-key").innerHTML = preferred_crypto.destination;
          document.querySelector("#qrcode").innerHTML = "";
          this.app.browser.generateQRCode(preferred_crypto.destination);
        }
      } else {
        if (document.querySelector("#profile-public-key").innerHTML != this.publicKey) {
          document.querySelector("#profile-public-key").innerHTML = this.publicKey;
          document.querySelector("#qrcode").innerHTML = "";
          this.app.browser.generateQRCode(this.publicKey);
        }
      }

      if (typeof document.querySelector("#wallet-btn-history") != "undefined") {
        document
          .querySelector("#wallet-btn-history")
          .setAttribute("data-asset-id", preferred_crypto.asset_id);
        document
          .querySelector("#wallet-btn-history")
          .setAttribute("data-ticker", preferred_crypto.ticker);
      }

      document.querySelector(".wallet-select-crypto").innerHTML = "";

      //
      // add crypto options
      //
      let html = "";
      for (let i = 0; i < available_cryptos.length; i++) {
        let crypto_mod = available_cryptos[i];
        html = `<option ${crypto_mod.name == preferred_crypto.name ? "selected" : ``} 
        id="crypto-option-${crypto_mod.name}" value="${crypto_mod.ticker}">${
          crypto_mod.ticker
        }</option>`;
        this.app.browser.addElementToElement(html, document.querySelector(".wallet-select-crypto"));
      }

      //console.log("loading crypto balance?");
      for (let i = 0; i < available_cryptos.length; i++) {
        //console.log("loading crypto balance: " + available_cryptos[i].ticker);
        await this.loadCryptoBalance(available_cryptos[i], preferred_crypto);
      }

      //
      // trigger select modal
      //
      let modal_select_crypto = new SelectCrypto(this.app, this.mod, preferred_crypto);
      let activation_check = preferred_crypto.isActivated();

      if (activation_check == false) {
        preferred_crypto.activate();
        if (preferred_crypto.renderModalSelectCrypto(this.app, this.mod, preferred_crypto)) {
          modal_select_crypto.render(this.app, this.mod, preferred_crypto);
          modal_select_crypto.attachEvents(this.app, this.mod, preferred_crypto);
        }
      }
    } catch (err) {
      console.log("Error rendering crypto header: " + err);
    }
  }

  closeMenu(e) {
    if (
      document.querySelector(".saito-header-hamburger-contents").classList.contains("show-menu")
    ) {
      this.toggleMenu();
    }
  }

  toggleMenu(e) {
    if (
      document.querySelector(".saito-header-hamburger-contents").classList.contains("show-menu")
    ) {
      document.querySelector(".saito-header-hamburger-contents").classList.remove("show-menu");
      this.is_open = false;
    } else {
      document.querySelector(".saito-header-hamburger-contents").classList.add("show-menu");
      this.is_open = true;
    }
  }

  async loadCryptoBalance(cryptoMod, preferred_crypto) {
    try {
      if (cryptoMod.returnIsActivated()) {
        //console.log("asking module to format balance: " + preferred_crypto.ticker);
        let balance = await cryptoMod.formatBalance();
        //console.log("balance is: " + balance);

        if (cryptoMod == preferred_crypto) {
          //console.log("and update!");
          document.querySelector(`.balance-amount`).innerHTML = balance;
        }

        let deposit = document.querySelector("#wallet-btn-deposit");
        let withdraw = document.querySelector("#wallet-btn-withdraw");

        this.setAttributes(deposit, {
          "data-assetid": cryptoMod.asset_id,
          "data-ticker": cryptoMod.ticker,
          "data-balance": balance,
          "data-address": cryptoMod.returnAddress(),
        });

        this.setAttributes(withdraw, {
          "data-assetid": cryptoMod.asset_id,
          "data-ticker": cryptoMod.ticker,
          "data-balance": balance,
          "data-sender": cryptoMod.returnAddress(),
        });
      }
    } catch (err) {
      console.log(err);
    }
  }

  setAttributes(el, attrs) {
    if (el) {
      for (let key in attrs) {
        el.setAttribute(key, attrs[key]);
      }
    }
  }

  renderUsername() {
    let header_self = this;

    let key = this.app.keychain.returnKey(this.publicKey);
    let username = key?.identifier ? key.identifier : "";

    if (username == "" || username == this.publicKey) {
      if (this.app.browser.isMobileBrowser()) {
        username = "Anonymous";
      } else {
        username = "Anonymous Account";
      }
      if (key?.has_registered_username) {
        username = "registering...";
      }
    }

    let el = document.getElementById("header-username");
    if (!el) {
      return;
    }

    //Update name
    el.innerHTML = sanitize(username);

    //Differential behavior
    if (username === "Anonymous Account" || username === "Anonymous") {
      el.onclick = (e) => {
        header_self.app.connection.emit("register-username-or-login", {
          success_callback: () => {
            header_self.app.connection.emit("recovery-backup-overlay-render-request");
          },
        });
      };
    } else if (username == "Registering...") {
      el.onclick = null;
    } else {
      if (key?.email) {
        //Launch profile
        el.onclick = (e) => {
          header_self.myUserMenu.render();
        };
      } else {
        //Prompt email registration
        el.onclick = (e) => {
          header_self.app.connection.emit("recovery-backup-overlay-render-request");
        };
      }
    }
  }
}

module.exports = SaitoHeader;
