var saito = require("../../lib/saito/saito");
var ModTemplate = require("../../lib/templates/modtemplate");
const SettingsAppspace = require("./lib/appspace/main");

//Is this deprecated???
const SettingsAppspaceSidebar = require("./lib/appspace-sidebar/main");
const SettingsThemeSwitcherOverlay = require("./lib/theme-switcher-overlay");
const localforage = require("localforage");

class Settings extends ModTemplate {
  constructor(app) {
    super(app);
    this.app = app;
    this.name = "Settings";
    this.appname = "Settings";
    this.slug = "settings";
    this.description = "Convenient Email plugin for managing Saito account settings";
    this.utilities = "Core Utilities";
    this.link = "/email?module=settings";
    this.icon = "fas fa-cog";
    this.description = "User settings module.";
    this.categories = "Admin Users";
    this.styles = [
      "/settings/style.css",
      "/saito/lib/jsonTree/jsonTree.css",
      "/settings/css/theme-switcher.css",
    ];
    this.main = null;

    return this;
  }

  async initialize(app) {
    await super.initialize(app);

    //
    // If you have the settings page open and you trigger a name registration event
    // it will deactivate the button so you cannot reregister
    //
    this.app.connection.on("update_identifier", (publickey) => {
      if (publickey === this.publicKey) {
        if (document.getElementById("register-identifier-btn")) {
          let username = app.keychain.returnIdentifierByPublicKey(this.publicKey);
          document.getElementById("register-identifier-btn").innerHTML = username;
          document.getElementById("register-identifier-btn").onclick = null;
        }
      }
    });

    this.main = new SettingsAppspace(this.app, this);
  }

  canRenderInto(qs) {
    //if (qs === ".saito-main") { return true; }
    if (qs === ".saito-sidebar.right") {
      return true;
    }
    if (qs === ".saito-header-themes") {
      return true;
    }
    return false;
  }

  renderInto(qs) {
    if (qs == ".saito-sidebar.right") {
      if (!this.renderIntos[qs]) {
        this.renderIntos[qs] = [];
        this.renderIntos[qs].push(new SettingsAppspaceSidebar(this.app, this, qs));
      }
      this.attachStyleSheets();
      this.renderIntos[qs].forEach((comp) => {
        comp.render();
      });
    }

    if (qs == ".saito-overlay") {
      if (!this.renderIntos[qs]) {
        this.renderIntos[qs] = [];
        this.renderIntos[qs].push(new SettingsThemeSwitcherOverlay(this.app, this, ""));
      }
      this.attachStyleSheets();
      this.renderIntos[qs].forEach((comp) => {
        comp.render();
      });
    }
  }

  respondTo(type = "") {
    if (type === "saito-header") {
      return [
        {
          text: "Scan",
          icon: "fas fa-expand",
          rank: 110,
          callback: function (app, id) {
            app.connection.emit("scanner-start-scanner", {});
          },
        },
        {
          text: "Theme",
          icon: "fa-solid fa-moon",
          rank: 120,
          callback: function (app, id) {
            let settings_self = app.modules.returnModule("Settings");
            settings_self.renderInto(".saito-overlay");
          },
        },
        {
          text: "Nuke",
          icon: "fa-solid fa-radiation",
          rank: 130,
          callback: async function (app, id) {
            let confirmation = await sconfirm("This will reset/nuke your account, do you wish to proceed?");

            if (confirmation){
              app.wallet.resetWallet();
            }
          },
        },
      ];
    }
    return null;
  }
}

module.exports = Settings;
