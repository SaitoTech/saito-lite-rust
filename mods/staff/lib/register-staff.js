const RegisterStaffTemplate = require("./register-staff.template");

class RegisterMain {

  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
  }

  render(app, mod) {

    if (!document.getElementById("staff-register-grid")) {
      app.browser.addElementToDom(RegisterStaffTemplate(app, mod), "staff_register");
    
      this.attachEvents(app, mod);
    }

    document.querySelector('#publicKey').innerHTML = mod.app.wallet.returnPublicKey();
    document.getElementById("isRegistered").checked = mod.isThisRegistered;

    if (mod.isThisRegistered) {
        document.getElementById("add_staff").style.display = "none";
        document.getElementById("remove_staff").style.display = "block";
    } else {
        document.getElementById("add_staff").style.display = "block";
        document.getElementById("remove_staff").style.display = "none";
    }
  }


  attachEvents(app, mod) {
    document.querySelector('#add_staff').addEventListener("click", () => {
      this.sendRegisterTX(this.publickey, this.app.wallet.returnPublicKey(), "register");
    });
    document.querySelector('#remove_staff').addEventListener("click", () => {
      this.sendRegisterTX(this.publickey, this.app.wallet.returnPublicKey(), "deregister");
    });
  }

}

module.exports = RegisterMain;

