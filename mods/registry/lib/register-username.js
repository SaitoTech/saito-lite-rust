const RegisterUsernameTemplate = require('./register-username.template');
const SaitoOverlay = require('./../../../lib/saito/ui/saito-overlay/saito-overlay');
const SaitoLoader = require('./../../../lib/saito/ui/saito-loader/saito-loader');

class RegisterUsername {

  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
    this.overlay = new SaitoOverlay(this.app, this.mod);
    this.loader = new SaitoLoader(this.app, this.mod, ".saito-overlay-form");
    this.callback = null;    
  }

  render(msg = "") {
    this.overlay.show(RegisterUsernameTemplate(msg));
    this.attachEvents();
  }

  attachEvents() {

    document.querySelector('.saito-overlay-form-input').select();

    document.querySelector('.saito-overlay-form-alt-opt').onclick = (e) => {
      this.overlay.remove();
      this.app.connection.emit("recovery-login-overlay-render-request");
      return;
    };

    document.querySelector('.saito-overlay-form-submit').onclick = (e) => {
      e.preventDefault();
      var identifier = document.querySelector('.saito-overlay-form-input').value;
      if (identifier) {
        if (identifier.indexOf("@") > -1) { 
          identifier = identifier.substring(0, identifier.indexOf("@")); 
        }

        try {
          document.querySelector(".saito-overlay-form-header-title").innerHTML = "Registering name...";
      	  document.querySelector(".saito-overlay-form-text").remove();
      	  document.querySelector(".saito-overlay-form-input").remove();
      	  document.querySelector(".saito-overlay-form-submitline").remove();
      	} catch (err) {console.log(err);}
   
        this.loader.render();

        //
        // No filter, check all possible registries
        //
        let domain = "@saito";

        console.log("REGISTRY: Check if name available");
        this.mod.sendPeerDatabaseRequestWithFilter(

          "Registry",

          `SELECT * FROM records WHERE identifier = "${identifier}${domain}"`,

          async (res) => {
            if (res.rows) {
              if (res.rows.length > 0) {
                salert("Identifier already in use. Please select another");
		            this.render();
                return;
              } else {
                console.log("REGISTRY: name available, try to register");
                try {
                  let register_success = await this.mod.tryRegisterIdentifier(identifier, domain);
                  if (register_success) {
                    console.log("REGISTRY: tx to register successfully sent");
                    //
                    // mark wallet that we have registered username
                    //
                    this.app.keychain.addKey(this.mod.publicKey, { has_registered_username : true });

                    // Change Saito-header / Settings page
                    this.app.connection.emit("update_identifier", this.mod.publicKey);

                    //Fake responsiveness
                    setTimeout(()=>{
                      this.overlay.remove();
                      if (this.callback) {
                        this.callback(identifier);
                      }
                    }, 2000);

                  } else {
                    salert("Error 411413: Error Registering Username");
	                  this.render();
                  }
                } catch (err) {
                  if (err.message == "Alphanumeric Characters only") {
                    salert("Error: Alphanumeric Characters only");
                  } else {
                    salert("Error: Error Registering Username");
                  }
	                this.render();
                  console.error(err);
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

