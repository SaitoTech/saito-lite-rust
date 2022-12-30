const SaitoOverlay = require("./../../../lib/saito/ui/saito-overlay/saito-overlay");
const ThemeSwitcherOverlayTemplate = require('./theme-switcher-overlay.template');



class ThemeSwitcherOverlay {

  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
    this.overlay = new SaitoOverlay(app, mod, false, true);
  }

  render() {

    console.log("inside theme switcher overlay");

    this_self = this;
    this.overlay.show(ThemeSwitcherOverlayTemplate(this.app, this.mod));

    this.attachEvents();
  }


  attachEvents() {
    this_self = this;
    document.querySelectorAll('.saito-modal-menu-option').forEach(function(elem){
      elem.addEventListener('click', function(e) {
      
        let theme = e.target.getAttribute('data-theme');
        
        if (theme != null) {
          console.log(theme);
          this_self.app.browser.switchTheme(theme);
        }
      });

    });
  }

}

module.exports = ThemeSwitcherOverlay;

