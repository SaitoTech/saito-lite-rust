var ModTemplate = require('../../lib/templates/modtemplate');
const DesignHTMLTemplate = require('./lib/email-appspace/design-appspace.template.js');
class Design extends ModTemplate {

  constructor(app) {
    super(app);

    this.app = app;
    this.name = "Design";
    this.description = "Visual exploration and reference guide to Saito's standard design elements";
    this.categories = "Dev Utilities";
    this.current_module = "";
    return this;
  }





  handleUrlParams(urlParams) {
    // console.log('url params ', urlParams);
    let module = urlParams.get("render");
    console.log('to render', module);
    this.current_module = module;


  }

  initialize(app) {
    super.initialize(app);
    console.log('initializing design');
    app.modules.mods.forEach(mod => {
        console.log(mod.name,this.current_module)
      if (mod.name.toLowerCase() === this.current_module) {
        mod.browser_active = 1;
        mod.initialize(app);

        if(mod.returnBaseHTML){
          const ui_template = mod.returnBaseHTML(app);
          if(ui_template){
            this.setBaseHTML(app, ui_template);
          }
         
        }
       
  
       
        mod.initializeHTML(app);
        mod.render(app);
        mod.attachEvents();
      } else {
        console.log('mod name not found');
      }
    })
  }

  initializeHTML() {
    console.log('initializing design');
  }

  receiveEvent() {

  }

  attachEvents() {

  }

  render() {
    console.log('rendering ', this.current_module);
  }

  setBaseHTML(app, html){
      app.browser.addElementToDom(html);
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


module.exports = Design;
