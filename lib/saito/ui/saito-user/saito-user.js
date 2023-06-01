const SaitoUserTemplate = require('./saito-user.template');

class SaitoUser {

    constructor(app, mod, container="", publickey="", notice="", fourthelem="") {
        this.app = app;
        this.mod = mod;
      	this.publickey = publickey;
      	this.notice = notice;
      	this.fourthelem = fourthelem;
        this.container = container;
    }

    updateUserline(userline) {
      let qs = `.saito-user-${this.publickey} .saito-userline`;
      if (document.querySelector(qs)) { document.querySelector(qs).innerHTML = userline; }
    }

    updateAddress(address) {
      let qs = `.saito-user-${this.publickey} .saito-address`;
      if (document.querySelector(qs)) { document.querySelector(qs).innerHTML = address; }
    }

    render() {
      let qs = this.container + " > .saito-user-"+this.publickey;

      if (!document.querySelector(qs)) {
        if (this.container) {
          this.app.browser.addElementToSelector(SaitoUserTemplate(this), this.container);
        }
      } else {
        this.app.browser.replaceElementBySelector(SaitoUserTemplate(this), qs);
      }

    }

    attachEvents() {}

}

module.exports = SaitoUser;

