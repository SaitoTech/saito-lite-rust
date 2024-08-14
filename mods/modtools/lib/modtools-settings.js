const SettingsTemplate = require("./modtools-settings.template");
const SaitoContacts = require('../../../lib/saito/ui/modals/saito-contacts/saito-contacts');
const ModtoolsAppPermissions = require("./modtools-app-permissions");

class ModtoolsSettings {
  constructor(app, mod, container) {
    this.app = app;
    this.mod = mod;
    this.container = container;
    this.contacts = new SaitoContacts(app, mod, true);
    this.app_permissions = new ModtoolsAppPermissions(app, mod, "#modtools-apps");
  }

  render() {
    if (document.querySelector(".saito-module-settings")){
      this.app.browser.replaceElementBySelector(SettingsTemplate(this.app, this.mod), ".saito-module-settings");
    }else{
      this.app.browser.addElementToSelector(SettingsTemplate(this.app, this.mod), this.container);  
    }

    if (document.querySelector('#modtools-apps')) {
      this.app_permissions.render();
    }
    
    this.attachEvents();
  }

  attachEvents() {

    let settings_self = this;

    if (document.getElementById("blacklisted-accounts")){
      document.getElementById("blacklisted-accounts").onclick = (e) => {
        this.contacts.title = "Blacklisted Accounts";
        this.contacts.multi_button = "Remove from Blacklist";
        this.contacts.callback = (keys) => {
          for (let key of keys){
            for (let i = this.app.options.modtools.blacklist.length; i >= 0; i--){
              if (typeof this.app.options.modtools.blacklist[i] !='undefined') {
                if (this.app.options.modtools.blacklist[i].publickey == key){
                  this.app.connection.emit("saito-unblacklist", key);
                  this.app.options.modtools.blacklist.splice(i, 1);
                  break;
                }
              }
            }
          }
          this.render();
        }

        let keylist = [];
        for (let i = 0;  i < this.app.options.modtools.blacklist.length; i++){
          keylist.push(this.app.options.modtools.blacklist[i].publickey);
        }

        this.contacts.render(keylist);
      }
    }

    if (document.getElementById("whitelisted-accounts")){
      document.getElementById("whitelisted-accounts").onclick = (e) => {
        this.contacts.title = "Whitelisted Accounts";
        this.contacts.multi_button = "Remove from Whitelist";
        this.contacts.callback = (keys) => {
          for (let key of keys){
            for (let i = this.app.options.modtools.whitelist.length; i >= 0; i--){
              if (typeof this.app.options.modtools.whitelist[i] !='undefined') {
                if (this.app.options.modtools.whitelist[i].publickey == key){
                  this.app.connection.emit("saito-unwhitelist", key);
                  this.app.options.modtools.whitelist.splice(i, 1);
                  break;
                }
              }
            }
          }
          this.render();
        }

        let keylist = [];
        for (let i = 0;  i < this.app.options.modtools.whitelist.length; i++){
          keylist.push(this.app.options.modtools.whitelist[i].publickey);
        }

        console.log("whitelist: ", keylist);
        this.contacts.render(keylist);
      }
    }


    if (document.getElementById("public_mod")) {
      document.getElementById("public_mod").onclick = (e) => {
        this.mod.permissions.mode = "public";
	this.mod.save();
      }
    }

    if (document.getElementById("friends_mod")) {
      document.getElementById("friends_mod").onclick = (e) => {
        this.mod.permissions.mode = "friends";
	this.mod.save();
      }
    }

    if (document.getElementById("custom_mod")) {
      document.getElementById("custom_mod").onclick = (e) => {
        this.mod.permissions.mode = "custom";
	this.mod.save();
      }
    }

  }

}

module.exports = ModtoolsSettings;
