const ThemeBtnTemplate = require('./theme-btn.template');
const ThemeSwitcherOverlay = require('./theme-switcher-overlay');

class ThemeBtn {

  constructor(app, mod, container) {
    this.app = app;
    this.mod = mod;
    this.container = container;
  }

  render() {
    this.app.browser.addElementToSelectorOrDom(ThemeBtnTemplate(this.app, this.mod), this.container);

    this.attachEvents();
  }


  attachEvents(){
    this_btn = this;
    document.querySelector('.saito-header-themes').addEventListener('click', function(e) {
      
      let theme_switcher = new ThemeSwitcherOverlay(this_btn.app, this.mod);
      theme_switcher.render();

    });
  }


}

module.exports = ThemeBtn;

