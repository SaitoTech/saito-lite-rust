var ModTemplate = require('../../lib/templates/modtemplate');
const Toggler = require('../../lib/saito/saito-ui/dark_mode_toggler');

class App extends ModTemplate {

  constructor(app) {
    super(app);

    this.app = app;
    this.name = "App";
    this.description = "Rendering as a Single Page Application";
    this.categories = "Development";
    this.current_module = "";
    this.previous_module = "";



    this.darkModeToggler = new Toggler(app);

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
      this.current_module = "chirp";
    }

    super.initialize(app);

  }

  initializeHTML(app) {

    super.initializeHTML(app)

  }

  receiveEvent() {
  }



attachEvents(app){
  super.attachEvents(app)
}


  render(app, mod, additionalURL) {

    const self = this;
    if (self.previous_module) {
      self.previous_module.destroy();
    }

    if (mod) {
      if (mod.name) {
        mod.browser_active = 1;
        mod.initialize(app);
        if (mod.returnBaseHTML) {
          const ui_template = mod.returnBaseHTML(app);
          if (ui_template) {
            self.setBaseHTML(app, ui_template);
          }

        }
        mod.initializeHTML(app, additionalURL);
        mod.render(app);
        mod.attachEvents(app);
        self.previous_module = mod;
      }
    } else {
      if (!additionalURL) {
        additionalURL = this.additionalURL;
      }
      app.modules.mods.forEach(mod => {
        if (mod.name.toLowerCase() === self.current_module) {
          mod.browser_active = 1;
          mod.initialize(app);
          mod.initializeHTML(app, additionalURL);
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
    document.querySelector('.main-content').innerHTML = html;
  }






  respondTo(type) {

    if (type == 'email-appspace') {
      let obj = {};
      obj.render = this.renderEmail;
      return obj;
    }

    return null;
  }





}


module.exports = App;
