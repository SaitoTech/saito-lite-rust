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

    Array.from(document.querySelectorAll("input[name='redsquare-curation']")).forEach(radio => {
      radio.addEventListener("change", (e) => {
        this.mod.curationLevel = e.currentTarget.value;
        this.mod.saveOptions();
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
  }
}

module.exports = Settings;
