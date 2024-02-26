const SettingsTemplate = require("./redsquare-settings.template");
const SaitoContacts = require('../../../lib/saito/ui/modals/saito-contacts/saito-contacts');

class Settings {
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

    Array.from(document.querySelectorAll("input[name='redsquare-source']")).forEach(radio => {
      radio.addEventListener("change", (e) => {
        if (e.currentTarget.value == "distributed"){
          this.app.options.redsquare.distributed = true;
        }else{
          this.app.options.redsquare.distributed = false;
        }
        this.app.storage.saveOptions();
      });
    });

    if (document.getElementById("browser_service")){
      document.getElementById("browser_service").addEventListener("change", (e) => {
        if (e.currentTarget.checked){
          this.app.options.redsquare.offer_service = true;
        }else{
          this.app.options.redsquare.offer_service = false;
        }
        this.app.storage.saveOptions();
      });

    }

    if (document.getElementById("muted-accounts")){
      document.getElementById("muted-accounts").onclick = (e) => {
        this.contacts.title = "Muted Accounts";
        this.contacts.multi_button = "Unmute Selected Accounts";
        this.contacts.callback = (keys) => {
          for (let key of keys){
            for (let i = this.mod.mute_list.length; i >= 0; i--){
              if (this.mod.mute_list[i] == key){
                this.mod.mute_list.splice(i, 1);
                break;
              }
            }
          }
          this.mod.saveOptions();
          this.render();
        }

        this.contacts.render(this.mod.mute_list);
      }
    }

    if (document.getElementById("blocked-accounts")){
      document.getElementById("blocked-accounts").onclick = (e) => {
        this.contacts.title = "Blocked Accounts";
        this.contacts.multi_button = "Unblock Selected Accounts";
        this.contacts.callback = (keys) => {
          for (let key of keys){
            for (let i = this.mod.black_list.length; i >= 0; i--){
              if (this.mod.black_list[i] == key){
                this.mod.black_list.splice(i, 1);
                break;
              }
            }
          }
          this.mod.saveOptions();
          this.render();
        }

        this.contacts.render(this.mod.black_list);
      }
    }

  }
}

module.exports = Settings;
