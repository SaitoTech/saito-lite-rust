const SaitoOverlay = require("./../../../lib/saito/ui/saito-overlay/saito-overlay");
const ThemeSwitcherOverlayTemplate = require('./theme-switcher-overlay.template');

class ThemeSwitcherOverlay {

  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
    this.overlay = new SaitoOverlay(app, mod, false, true);
  }

  render() {
    let mod_name = this.mod.getCurrentModName();    
    let current_mod = this.app.modules.returnModule(mod_name);
    let selected_theme = this.app.options.theme[mod_name.toLowerCase()];

    console.log(mod_name);
    console.log(current_mod);
    console.log(current_mod.theme_options);
    console.log(selected_theme);

    this.overlay.show(ThemeSwitcherOverlayTemplate(this.app, this.mod, current_mod.theme_options, selected_theme));
    this.attachEvents();
  }


  attachEvents() {
    this_self = this;
    document.querySelectorAll('.saito-modal-menu-option').forEach(function(elem){
      elem.addEventListener('click', function(e) {
      
        let theme = e.target.getAttribute('data-theme');

        if (theme != null) {
          this_self.app.browser.switchTheme(theme);
          this_self.overlay.hide();
        }
      });

    });
  }

}

module.exports = ThemeSwitcherOverlay;

