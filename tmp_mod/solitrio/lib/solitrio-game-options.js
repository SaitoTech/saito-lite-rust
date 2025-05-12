const SettingsTemplate = require("./solitrio-game-options.template");

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

    Array.from(document.querySelectorAll("input[name='play_mode']")).forEach(radio => {
      radio.addEventListener("change", (e) => {
        console.log("Update Settings: " , e.currentTarget.value);
        this.mod.saveGamePreference('solitrio-play-mode', e.currentTarget.value);
        this.app.connection.emit("solitrio-update-settings");
      });
    });

  }

}

module.exports = Settings;