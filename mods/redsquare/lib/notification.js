const NotificationTemplate = require("./notification.template");

class RedSquareNotification {

    constructor(app, mod, tx) {
      this.tweet = tx;
    }

    render(app, mod, selector = "") {
      app.browser.addElementToSelector(NotificationTemplate(app, mod, this.tweet), selector);
      this.attachEvents(app, mod);
    }

    attachEvents(app, mod) { 
    }
}

module.exports = RedSquareNotification;


