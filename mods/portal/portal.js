var ModTemplate = require('../../lib/templates/modtemplate');
const DesignHTMLTemplate = require('./lib/email-appspace/design-appspace.template.js');
class Portal extends ModTemplate {

  constructor(app) {
    super(app);

    this.app = app;
    this.name = "Portal";
    this.description = "Rendering as a Single Page Application";
    this.categories = "Development";
    this.current_module = "";
    this.previous_module = "";
    this.themes = {
      dark: {
        '--saito-primary': '#ff8235',
        '--saito-secondary': '#cf2e2e',
        '--saito-tetiary': 'rgb(234, 234, 239)',
        '--saito-red': '#ff8235',
        '--saito-orange': 'rgb(247, 31, 61)',
        ' --saito-skyline-grey': 'rgb(234, 234, 239)'
      },
      light: {
        '--saito-primary': '#cf2e2e',
        '--saito-secondary': '#ff8235',
        '--saito-tetiary': 'rgb(234, 234, 239)',
        '--saito-orange': '#ff8235',
        '--saito-red': 'rgb(247, 31, 61)',
        ' --saito-skyline-grey': 'rgb(234, 234, 239)'
      }
    }

    return this;
  }





  handleUrlParams(urlParams) {
    // set param
    let module = urlParams.get("render");
    console.log('to render', module);
    this.current_module = module;

  }

  initialize(app) {
    if (app.BROWSER != 1) {
      return;
    }

    // set default mod to ui_elements
    if (!this.current_module) {
      this.current_module = "ui_elements"
    }

    super.initialize(app);

  }

  initializeHTML() {

  }

  receiveEvent() {
  }

  attachEvents() {

  }

  toggleDarkMode() {
    console.log('toggling dark mode');
    this.darkMode = !this.darkMode;
    if (this.darkMode === true) {
      for (let i in this.themes.dark) {
        document.querySelector(':root').style.setProperty(i, this.themes.dark[i]);
      }
    } else {
      for (let i in this.themes.light) {
        document.querySelector(':root').style.setProperty(i, this.themes.light[i]);
      }
    }

    // this.rerender(this.app);

  }

  render(app, mod) {
    const self = this;
    if (self.previous_module) {
      self.previous_module.destroy();
    }

    if (mod) {
      if (mod.name) {
        mod.browser_active = 1;
        mod.initialize(app);
        mod.initializeHTML(app);
        if (mod.returnBaseHTML) {
          const ui_template = mod.returnBaseHTML(app);
          if (ui_template) {
            self.setBaseHTML(app, ui_template);
          }

        }
        mod.render(app);
        mod.attachEvents(app);
        self.previous_module = mod;
      }
    } else {
      app.modules.mods.forEach(mod => {
        if (mod.name.toLowerCase() === self.current_module) {
          mod.browser_active = 1;
          mod.initialize(app);
          mod.initializeHTML(app);
          if (mod.returnBaseHTML) {
            const ui_template = mod.returnBaseHTML(app);
            if (ui_template) {
              self.setBaseHTML(app, ui_template);
            }

          }


          mod.render(app);
          mod.attachEvents(app);
          self.previous_module = mod;
        } else {
        }
      })
    }


  }


  // rerender(app) {
  //   let self = this;
  //   console.log('rerendering ', this.current_module);
  //   app.modules.mods.forEach(mod => {
  //     if (mod.name.toLowerCase() === this.current_module) {
  //       mod.destroy(app);
  //       self.render(app);
  //     }
  //   })
  // }




  setBaseHTML(app, html) {
    document.querySelector('body').innerHTML = html;
  }






  respondTo(type) {

    if (type == 'email-appspace') {
      let obj = {};
      obj.render = this.renderEmail;
      return obj;
    }

    return null;
  }

  renderEmail(app, data) {
    let DesignAppspace = require('./lib/email-appspace/design-appspace');
    DesignAppspace.render(app, data);
  }




}


module.exports = Portal;
