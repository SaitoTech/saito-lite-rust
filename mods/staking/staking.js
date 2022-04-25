const StakingAppspace = require('./lib/email-appspace/staking-appspace');
var saito = require('../../lib/saito/saito');
var ModTemplate = require('../../lib/templates/modtemplate');

class Staking extends ModTemplate {

  constructor(app) {
    super(app);

    this.app            = app;
    this.name           = "Staking";
    this.description    = "Module to assist with deposit and withdrawal of UTXO from the staking table";
    this.categories     = "Core Utilities";
    
    return this;
  }


  respondTo(type) {

    if (type == 'email-appspace') {
      let obj = {};
	  obj.render = function (app, data) {
     	    StakingAppspace.render(app, data);
          }
	  obj.attachEvents = function (app, data) {
     	    StakingAppspace.attachEvents(app, data);
	  }
      return obj;
    }

    return null;
  }

}

module.exports = Staking;

