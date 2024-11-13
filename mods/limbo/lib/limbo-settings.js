const SettingsTemplate = require("./limbo-settings.template");

class Settings {
  constructor(app, mod, container) {
    this.app = app;
    this.mod = mod;
    this.container = container;
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

    if (!this.app.options.limbo){
      this.app.options.limbo = {}; 
    }

    Array.from(document.querySelectorAll("input[name='limbo-options']")).forEach(radio => {
      radio.addEventListener("change", (e) => {
        if (e.currentTarget.value == "advanced"){
          this.app.options.limbo.advanced = true;
        }else{
          this.app.options.limbo.advanced = false;
        }
        this.app.storage.saveOptions();
      });
    });

  }
}

module.exports = Settings;
