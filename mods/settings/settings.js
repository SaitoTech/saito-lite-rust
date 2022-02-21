const SettingsAppspace = require('./lib/email-appspace/settings-appspace');
var saito = require('../../lib/saito/saito');
var ModTemplate = require('../../lib/templates/modtemplate');


class Settings extends ModTemplate {

  constructor(app) {
    super(app);

    this.app            = app;
    this.name           = "Settings";
    this.description    = "Convenient Email plugin for managing Saito account settings";
    this.utilities      = "Core Utilities";

    this.link           = "/email?module=settings";

    this.description = "User settings module.";
    this.categories  = "Admin Users";
    
    return this;
  }


  initialize(app) {
    let settings_self = this;
    this.app.connection.on("update_identifier", (tmpkey) => {
console.log("1- 1");
console.log(JSON.stringify(tmpkey));
      if (document.getElementById("register-identifier-btn")) {
console.log("1- 2");
	if (tmpkey.publickey === settings_self.app.wallet.returnPublicKey()) {
console.log("1- 3");
          let username = settings_self.app.keys.returnIdentifierByPublicKey(app.wallet.returnPublicKey());
          document.getElementById("register-identifier-btn").innerHTML = username;
console.log("1- 4");
	}
      }
    });
  }


  respondTo(type) {

    if (type == 'email-appspace') {
      let obj = {};
	  obj.render = function (app, data) {
     	    SettingsAppspace.render(app, data);
          }
	  obj.attachEvents = function (app, data) {
     	    SettingsAppspace.attachEvents(app, data);
	  }
      return obj;
    }

    return null;
  }

}







module.exports = Settings;


