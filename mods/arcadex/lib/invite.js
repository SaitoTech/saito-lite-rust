const InviteTemplate = require("./invite.template");

class Invite {
	
  constructor(app, mod, container="") {
    this.app = app;
    this.mod = mod;
    this.container = container;
  }

  render() {
    //
    // insert content we will render into
    //
    if (document.querySelector(".arcade-invites")) {
      this.app.browser.replaceElementBySelector(InviteTemplate(), ".arcade-invites");
    } else {
      this.app.browser.addElementToSelector(InviteTemplate(), this.container);
    }


    this.attachEvents();

  }

  attachEvents() {
  }

};

module.exports = Invite;

