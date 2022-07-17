const GameInviteTemplate = require("./game.template");

class GameInvite {

    constructor(app, mod, tx) {
      this.game = tx;
    }

    render(app, mod, selector = "") {
      app.browser.addElementToSelector(GameInviteTemplate(app, mod, this.game), selector);
      this.attachEvents(app, mod);
    }

    attachEvents(app, mod) { 
    }
}

module.exports = GameInvite;


