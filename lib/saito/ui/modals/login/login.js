const LoginTemplate = require('./login.template');
const SaitoOverlay = require('./../../saito-overlay/saito-overlay');
const SaitoLoader = require('./../../saito-loader/saito-loader');

class Login {

  constructor(app, mod, success_callback = () => {}, failure_callback = () => {}) {
    this.app = app;
    this.mod = mod;
    this.success_callback = success_callback;
    this.failure_callback = failure_callback;
    this.modal_overlay = new SaitoOverlay(this.app, this.mod);
    this.loader = new SaitoLoader(this.app, this.mod, ".saito-overlay-form");
  }

  render() {
    this.modal_overlay.show(LoginTemplate());
    this.attachEvents();
  }

  attachEvents() {

    let component_self = this;

    document.querySelector('.saito-overlay-login-submit').onclick = (e) => {

      let email = document.querySelector(".saito-overlay-form-email").value;
      let password = document.querySelector(".saito-overlay-form-password").value;

      //document.querySelector(".saito-overlay-form-text").remove();
      document.querySelector(".saito-overlay-form-email").remove();
      document.querySelector(".saito-overlay-form-password").remove();
      document.querySelector(".saito-overlay-form-submitline").remove();

      this.loader.render();

      let recovery_mod = component_self.app.modules.returnModule("Recovery");
      if (recovery_mod) {

        document.querySelector(".saito-overlay-form-text").innerHTML = "<center>Fetching Encrypted Wallet from Network...</center>";

	let obj = { pass : password , email : email , success_callback : function() {
	  component_self.loader.hide();
	  component_self.modal_overlay.hide();
	  component_self.success_callback(email, password);
	} , failure_callback : function() {
          document.querySelector(".saito-overlay-form-text").innerHTML = "<center>Failed: Incorrect Email or Password?</center>";
	  component_self.render();
	  component_self.attachEvents();
	}};

	// this triggers restore
	component_self.app.connection.emit("recovery-restore-overlay-render-request", (obj));

      } else {
	alert("Wallet Recovery Module not installed - please backup manually");
      }

    }
  }

}

module.exports = Login;

