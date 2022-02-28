const saito = require('./../../lib/saito/saito');
const ModTemplate = require('../../lib/templates/modtemplate');
const MixinAppspace = require('./lib/email-appspace/mixin-appspace');


class Mixin extends ModTemplate {

  constructor(app) {

    super(app);

    this.name = "Mixin";
    this.description = "Send and Receive Third-Party Cryptocurrency Tokens Fee-Free on Saito";
    this.categories = "Finance Utilities";
    
  }
  
  respondTo(type = "") {

    if (type == 'email-appspace') {
      let obj = {};
      obj.render = function (app, data) {
        MixinAppspace.render(app, data);
      }
      obj.attachEvents = function (app, data) {
        MixinAppspace.attachEvents(app, data);
      }
      return obj;
    }

    return null;
  }

}

module.exports = Mixin;


