const LoginTemplate = require('./login.template');
const SaitoOverlay = require('./../../../lib/saito/ui/saito-overlay/saito-overlay');
const SaitoLoader = require('./../../../lib/saito/ui/saito-loader/saito-loader');

class Login {

  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
    this.success_callback = null;

    this.modal_overlay = new SaitoOverlay(this.app, this.mod);
    this.loader = new SaitoLoader(this.app, this.mod, "#login-template .saito-overlay-form");
  }

  render() {
    this.modal_overlay.show(LoginTemplate());
    this.attachEvents();
  }

  show() { this.render(); }
  hide() { this.remove(); }

  remove() {
    this.modal_overlay.remove();
  }

  attachEvents() {

    document.querySelector('.saito-overlay-login-submit').onclick = (e) => {

      let email = document.querySelector(".saito-overlay-form-email").value;
      let password = document.querySelector(".saito-overlay-form-password").value;

      //document.querySelector(".saito-overlay-form-text").remove();
      document.querySelector(".saito-overlay-form-email").remove();
      document.querySelector(".saito-overlay-form-password").remove();
      document.querySelector(".saito-overlay-form-submitline").remove();

      this.loader.render();

      document.querySelector("#login-template .saito-overlay-form-text").innerHTML = "<center>Fetching Encrypted Wallet from Network...</center>";
    	this.mod.restoreWallet(email, password);
    }
  }

  async success(){
    this.loader.hide();
    if (this.success_callback){
      await this.success_callback();
    }
    
    if (this.app.BROWSER){
      window.location.reload();
    }
    
  }

  failure(){
    try{
      this.render();
      document.querySelector("#login-template .saito-overlay-form-text").innerHTML = "<center>Failed: Incorrect Email or Password?</center>";
      this.attachEvents();
    }catch(err){
      console.error(err);
    }
  }

}

module.exports = Login;

