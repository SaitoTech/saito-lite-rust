const SettingsAppspace = require('./lib/appspace/main');
const SettingsAppspaceSidebar = require('./lib/appspace-sidebar/main');
var saito = require('../../lib/saito/saito');
var ModTemplate = require('../../lib/templates/modtemplate');
const ThemeBtn = require("./lib/theme-btn");

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
    this.styles = ['/settings/style.css','/saito/lib/jsonTree/jsonTree.css','/settings/theme-switcher.css'];

    return this;
  }


  initialize(app) {
    super.initialize(app);

    let settings_self = this;
    this.app.connection.on("update_identifier", (tmpkey) => {
      if (document.getElementById("register-identifier-btn")) {
        if (tmpkey.publickey === settings_self.app.wallet.returnPublicKey()) {
          let username = settings_self.app.keychain.returnIdentifierByPublicKey(app.wallet.returnPublicKey());
          document.getElementById("register-identifier-btn").innerHTML = username;
        }
      }
    });
  }


  canRenderInto(qs) {
    if (qs === ".saito-main") { return true; }
    if (qs === ".saito-sidebar.right") { return true; }
    if (qs === ".saito-header-themes") { return true; }
    return false;
  }

  renderInto(qs) {

    if (qs == ".saito-main") {
      if (!this.renderIntos[qs]) {
        this.renderIntos[qs] = [];
        this.renderIntos[qs].push(new SettingsAppspace(this.app, this, qs));
      }
      this.attachStyleSheets();
      this.renderIntos[qs].forEach((comp) => { comp.render(); });
    }
    if (qs == ".saito-sidebar.right") {
      if (!this.renderIntos[qs]) {
        this.renderIntos[qs] = [];
        this.renderIntos[qs].push(new SettingsAppspaceSidebar(this.app, this, qs));
      }
      this.attachStyleSheets();
      this.renderIntos[qs].forEach((comp) => { comp.render(); });
    }

     if (qs == ".saito-header-themes") {
        if (!this.renderIntos[qs]) {
          this.renderIntos[qs] = [];

          let obj = new ThemeBtn(this.app, this, ".saito-header-themes");
          this.renderIntos[qs].push(obj);
          this.attachStyleSheets();
          this.renderIntos[qs].forEach((comp) => { comp.render(); });
        }
      }
  }


}







module.exports = Settings;


