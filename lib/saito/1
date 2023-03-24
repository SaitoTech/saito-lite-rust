const SaitoUserTemplate = require('./saito-user.template');

/*
* Deprecated??? 
*/

class SaitoUser {

    constructor(app, mod, container="", publickey="", notice="", fourthelem="") {
        this.app = app;
        this.mod = mod;
	this.publickey = publickey;
	this.notice = notice;
	this.fourthelem = fourthelem;
        this.container = container;
    }

    render() {

      let qs = ".saito-user-"+this.publickey;

      if (!document.querySelector(qs)) {
        if (this.container) {
          this.app.browser.addElementToSelector(SaitoUserTemplate(this), this.container);
        }
      } else {
        this.app.browser.replaceElementBySelector(SaitoUserTemplate(this), this.container);
      }

    }

    attachEvents() {
      
    }

}

module.exports = SaitoUser;

