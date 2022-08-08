const InviteTemplate = require("./invite.template");

class RedSquareInvite {

    constructor(app, mod, tx) {
      this.tweet = tx;
    }

    render(app, mod, selector = "") {
      app.browser.addElementToSelector(InviteTemplate(app, mod, this.tweet), selector);
      this.attachEvents(app, mod);
    }

    attachEvents(app, mod) { 
    }
}

module.exports = RedSquareInvite;


