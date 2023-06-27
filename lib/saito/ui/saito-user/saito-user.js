const SaitoUserTemplate = require('./saito-user.template');

class SaitoUser {

    constructor(app, mod, container="", publickey="", notice="", fourthelem="") {
        this.app = app;
        this.mod = mod;
      	this.publickey = publickey;
      	this.notice = notice;
      	this.fourthelem = fourthelem;
        this.container = container;
        this.uuid = null;
    }

    updateUserline(userline) {
      let qs = `#saito-user-${this.uuid} .saito-userline`;
      if (document.querySelector(qs)) { document.querySelector(qs).innerHTML = userline; }
    }

    updateAddress(address) {
      let qs = `#saito-user-${this.uuid} .saito-address`;
      if (document.querySelector(qs)) { document.querySelector(qs).innerHTML = address; }
    }

    render() {

      if (!this.uuid) {
        let max = 0;
        Array.from(document.querySelectorAll(".saito-user")).forEach(su => {
          let uuid = parseInt(su?.dataset?.uuid) || 0;
          max = Math.max(max, uuid);
        });
        this.uuid = max + 1;
      }

      //console.log("SaitoUser: " +  this.uuid);
      //console.log("insert in container: " + this.container);
      
      if (!document.getElementById(`saito-user-${this.uuid}`)) {
        Array.from(document.querySelectorAll(this.container)).forEach(container => {
          if (!container.querySelector(`.saito-user-${this.publickey}`)){
            this.app.browser.addElementToElement(SaitoUserTemplate(this), container);
            return;
          }
        });
      } else {
        this.app.browser.replaceElementById(SaitoUserTemplate(this), `saito-user-${this.uuid}`);
      }

    }

    attachEvents() {}

}

module.exports = SaitoUser;

