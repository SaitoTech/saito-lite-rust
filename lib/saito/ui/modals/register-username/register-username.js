const RegisterUsernameTemplate = require("./register-username.template");
const SaitoOverlay = require("./../../saito-overlay/saito-overlay");
const SaitoLoader = require("./../../saito-loader/saito-loader");
const SaitoLogin = require("./../login/login");
const SaitoBackup = require("./../backup/backup");

class RegisterUsername {
  constructor(app, mod, callback = () => {}) {
    this.app = app;
    this.mod = mod;
    this.callback = callback;
    this.modal_overlay = new SaitoOverlay(this.app, this.mod);
    this.loader = new SaitoLoader(this.app, this.mod, ".saito-overlay-form");
    this.login = new SaitoLogin(this.app, this.mod);
  }

  async render() {
    this.modal_overlay.show(RegisterUsernameTemplate());
    this.attachEvents();
  }

  attachEvents() {
    let component_self = this;

    document.querySelector(".saito-overlay-form-input").select();

    document.querySelector(".saito-overlay-form-alt-opt").onclick = (e) => {
      this.modal_overlay.remove();
      this.login.render();
      return;
    };

    document.querySelector(".saito-overlay-form-submit").onclick = async (e) => {
      e.preventDefault();
      var identifier = document.querySelector(".saito-overlay-form-input").value;
      if (identifier) {
        if (identifier.indexOf("@") > -1) {
          identifier = identifier.substring(0, identifier.indexOf("@"));
        }

        try {
          document.querySelector(".saito-overlay-form-text").innerHTML =
            "checking for availability...";
          document.querySelector(".saito-overlay-form-input").remove();
          document.querySelector(".saito-overlay-form-submitline").remove();
        } catch (err) {
          console.log(err);
        }
        this.loader.render();

        await component_self.mod.sendPeerDatabaseRequestWithFilter(
          "Registry",

          `SELECT *
           FROM records
           WHERE identifier = "${identifier}@saito"`,

          async (res) => {
            if (res.rows) {
              if (res.rows.length > 0) {
                salert("Identifier already in use. Please select another");
                await component_self.render();
                return;
              } else {
                let register_mod = component_self.app.modules.returnModule("Registry");
                if (register_mod) {
                  try {
                    let register_success = register_mod.tryRegisterIdentifier(identifier);
                    if (register_success) {
                      // no need for alert
                      component_self.modal_overlay.remove();
                      this.loader.hide();
                      component_self.callback(identifier);
                      //
                      // mark wallet that we have registered username
                      //
                      this.app.keychain.addKey(await this.app.wallet.getPublicKey(), {
                        has_registered_username: true,
                      });
                      this.app.connection.emit(
                        "update_identifier",
                        await this.app.wallet.getPublicKey()
                      );
                    } else {
                      salert("Error 411413: Error Registering Username");
                      await component_self.render();
                    }
                  } catch (err) {
                    if (err.message == "Alphanumeric Characters only") {
                      salert("Error: Alphanumeric Characters only");
                    } else {
                      salert("Error: Error Registering Username");
                    }
                    await component_self.render();
                    console.error(err);
                  }
                }
              }
            }
          }
        );
      }
    };
  }
}

module.exports = RegisterUsername;
