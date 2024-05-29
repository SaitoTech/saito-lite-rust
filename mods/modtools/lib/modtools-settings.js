const SettingsTemplate = require("./modtools-settings.template");
const SaitoContacts = require('../../../lib/saito/ui/modals/saito-contacts/saito-contacts');

class ModtoolsSettings {
  constructor(app, mod, container) {
    this.app = app;
    this.mod = mod;
    this.container = container;
    this.contacts = new SaitoContacts(app, mod, true);
  }

  render() {
    if (document.querySelector(".saito-module-settings")){
      this.app.browser.replaceElementBySelector(SettingsTemplate(this.app, this.mod), ".saito-module-settings");
    }else{
      this.app.browser.addElementToSelector(SettingsTemplate(this.app, this.mod), this.container);  
    }
    
    this.attachEvents();
  }

  attachEvents() {

    let settings_self = this;

    if (document.getElementById("blocked-accounts")){
      document.getElementById("blocked-accounts").onclick = (e) => {
        this.contacts.title = "Blocked Accounts";
        this.contacts.multi_button = "Unblock Selected Accounts";
        this.contacts.callback = (keys) => {
          for (let key of keys){
            for (let i = this.app.options.modtools.blacklist.length; i >= 0; i--){
              if (this.app.options.modtools.blacklist[i] == key){
                this.app.connection.emit("saito-unblacklist", key);
                this.app.options.modtools.blacklist[i].splice(i, 1);
                break;
              }
            }
          }
          this.render();
        }
        this.contacts.render(this.app.options.modtools.blacklist);
      }
    }

    if (document.getElementById("whitelisted-accounts")){
      document.getElementById("whitelisted-accounts").onclick = (e) => {
        this.contacts.title = "Whitelisted Accounts";
        this.contacts.multi_button = "Remove from Whitelist";
        this.contacts.callback = (keys) => {
          for (let key of keys){
            for (let i = this.app.options.modtools.blacklist.length; i >= 0; i--){
              if (this.app.options.modtools.blacklist[i] == key){
                this.app.connection.emit("saito-unwhitelist", key);
                this.app.options.modtools.whitelist[i].splice(i, 1);
                break;
              }
            }
          }
          this.render();
        }
        this.contacts.render(this.app.options.modtools.whitelist);
      }
    }

  
  }

}

module.exports = ModtoolsSettings;
