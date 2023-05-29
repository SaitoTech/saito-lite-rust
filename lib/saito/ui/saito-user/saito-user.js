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

      console.log(qs);
      if (!document.querySelector(qs)) {
        if (this.container) {
          this.app.browser.addElementToSelector(SaitoUserTemplate(this), this.container);
        }
      } else {
        console.log("Replace");
        this.app.browser.replaceElementBySelector(SaitoUserTemplate(this), qs);
      }

    }

    attachEvents() {
      
    }

}

module.exports = SaitoUser;

