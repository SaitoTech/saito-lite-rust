const InviteTemplate = require("./invite.template");

class Invite {
	
  constructor(app, mod, container="", invite) {
    this.app = app;
    this.mod = mod;
    this.container = container;
    this.invite = invite;
  }

  render() {
    //
    // insert content we will render into
    //
    if (document.querySelector(".arcade-invites")) {
      this.app.browser.replaceElementBySelector(InviteTemplate(this.app, this.mod, this.invite), ".arcade-invites");
    } else {
      this.app.browser.addElementToSelector(InviteTemplate(this.app, this.mod, this.invite), this.container);
    }

    this.attachEvents();

  }

  attachEvents() {
  }

};

module.exports = Invite;

