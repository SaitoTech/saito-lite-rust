const RegisterUsernameTemplate = require('./register-username.template');
const SaitoOverlay = require('./../../saito-overlay/saito-overlay');
const SaitoLoader = require('./../../saito-loader/saito-loader');
const SaitoLogin = require('./../login/login');
const SaitoBackup = require('./../backup/backup');

class RegisterUsername {

  constructor(app, mod, callback = () => { }) {
    this.app = app;
    this.mod = mod;
    this.callback = callback;
    this.modal_overlay = new SaitoOverlay(this.app, this.mod);
    this.loader = new SaitoLoader(this.app, this.mod, ".saito-overlay-form");
    this.login = new SaitoLogin(this.app, this.mod);
  }

  render() {
    this.modal_overlay.show(RegisterUsernameTemplate());
    this.attachEvents();
  }

  attachEvents() {

    let component_self = this;

    document.querySelector('.saito-overlay-form-input').select();

    document.querySelector('.saito-overlay-form-alt-opt').onclick = (e) => {
      this.modal_overlay.hide();
      this.login.render();
      return;
    };

    document.querySelector('.saito-overlay-form-submit').onclick = () => {

      var identifier = document.querySelector('.saito-overlay-form-input').value;
      if (identifier) {
        if (identifier.indexOf("@") > -1) { identifier = identifier.substring(0, identifier.indexOf("@")); }

	document.querySelector(".saito-overlay-form-text").remove();
	document.querySelector(".saito-overlay-form-input").remove();
	document.querySelector(".saito-overlay-form-submit").remove();

	//
	// mark wallet that we have registered username
	//
	this.app.keychain.addKey(this.app.wallet.returnPublicKey(), { has_registered_username : true });

        this.loader.render();
        component_self.mod.sendPeerDatabaseRequestWithFilter(

          "Registry",

          `SELECT * FROM records WHERE identifier = "${identifier}@saito"`,

          (res) => {
            if (res.rows) {
              if (res.rows.length > 0) {
                salert("Identifier already in use. Please select another");
                return;
              } else {
                let register_mod = component_self.app.modules.returnModule("Registry");
                if (register_mod) {
                  try {
                    let register_success = register_mod.tryRegisterIdentifier(identifier);
                    if (register_success) {
                      salert("Registering " + identifier + "@saito");
                      component_self.modal_overlay.hide();
        	      this.loader.hide();
                      component_self.callback(identifier);
                    } else {
                      salert("Error 411413: Error Registering Username");
                    }
                  } catch (err) {
                    salert("Error: Error Registering Username");
                    console.error(err);
                  }
                }
              }
            }
          }
        );
      }
    }
  }
}

module.exports = RegisterUsername;

