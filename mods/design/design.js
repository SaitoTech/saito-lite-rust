var ModTemplate = require('../../lib/templates/modtemplate');
var DesignAppspace = require('./lib/appspace/main');

class Design extends ModTemplate {

  constructor(app) {
    super(app);

    this.app            = app;
    this.name           = "Design";
    this.description    = "Visual exploration and reference guide to Saito's standard design elements";
    this.categories     = "Dev Utilities";
    this.icon           = "fas fa-pen";

    return this;
  }




  respondTo(type) {

    if (type == 'appspace') {
      return new DesignAppspace(this.app, this);
    }
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
