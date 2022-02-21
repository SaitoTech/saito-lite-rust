const ModalRegisterUsernameTemplate = require('./modal-register-username.template');
const SaitoOverlay = require('./../saito-overlay/saito-overlay');

class ModalRegisterUsername {

    constructor(app, callback = () => {}) {
      this.app = app;
      this.callback = callback;
    }

    render(app, mod) {

      mod.modal_overlay = new SaitoOverlay(app);
  
      if (!document.querySelector(".add-user")) { 
        mod.modal_overlay.show(app, mod, ModalRegisterUsernameTemplate());
      }

    }

    attachEvents(app, mod) {

      document.querySelector('.username-registry-input').select();
      document.querySelector('.username-registry-input').setAttribute("placeholder", "");
      
      /*document.querySelector('.tutorial-skip').onclick = () => { 
        app.options.wallet.anonymous = 1;
        app.storage.saveOptions();
        mod.modal_overlay.hide(); 
        this.callback();
      }*/
      
      document.querySelector('#registry-modal-button').onclick = () => {

console.log("A");

        //check identifier taken
        var identifier = document.querySelector('#registry-input').value;
        if (identifier) {

console.log("B: " + identifier);

          let am = app.modules.returnActiveModule();

	  if (am == null) {
	    console.log("No Active Module");
	    return;
	  }

console.log("C: ");

	  am.sendPeerDatabaseRequestWithFilter(
                
                "Registry" ,
                
                `SELECT * FROM records WHERE identifier = "${identifier}@saito"`,
                
                (res) => {

console.log("returning results!");

                  if (res.rows) {
                    if (res.rows.length > 0) {
                      salert("Identifier already in use. Please select another");
                      return;
                    } else {
                      let register_mod = app.modules.returnModule("Registry");
                      if (register_mod) {
                        try{
                          let register_success = register_mod.tryRegisterIdentifier(identifier);
                          if (register_success) {
                            salert("Registering " + identifier + "@saito");
                            mod.modal_overlay.hide();
                            this.callback();
                          } else {
                            salert("Error 411413: Error Registering Username");
                          }
                        }catch(err){
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

module.exports = ModalRegisterUsername


