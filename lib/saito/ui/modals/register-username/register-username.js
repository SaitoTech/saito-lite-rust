const RegisterUsernameTemplate = require('./register-username.template');
const SaitoOverlay = require('./../../saito-overlay/saito-overlay');

class RegisterUsername {

  constructor(app, mod, callback = () => { }) {
    this.app = app;
    this.mod = mod;
    this.callback = callback;
  }

  render() {

    this.modal_overlay = new SaitoOverlay(app, mod);
    this.modal_overlay.show(RegisterUsernameTemplate());

    this.attachEvents();

  }

  attachEvents() {

    let app = this.app;
    let mod = this.mod;

    document.querySelector('#registry-input').select();
    document.querySelector('#registry-input').setAttribute("placeholder", "");

    document.querySelector('#registry-modal-button').onclick = () => {

      //check identifier taken
      var identifier = document.querySelector('#registry-input').value;
      if (identifier) {

        console.log("Identifier: " + identifier);

        mod.sendPeerDatabaseRequestWithFilter(

          "Registry",

          `SELECT * FROM records WHERE identifier = "${identifier}@saito"`,

          (res) => {

            if (res.rows) {
              if (res.rows.length > 0) {
                salert("Identifier already in use. Please select another");
                return;
              } else {
                let register_mod = app.modules.returnModule("Registry");
                if (register_mod) {
                  try {
                    let register_success = register_mod.tryRegisterIdentifier(identifier);
                    if (register_success) {
                      salert("Registering " + identifier + "@saito");
                      this.modal_overlay.hide();
                      this.callback();
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

module.exports = RegisterUsername

