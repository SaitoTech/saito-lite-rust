const RedSquareItemTemplate = require("./redsquare-item.template");

class RedSquareItem {

    constructor(app, mod, tweet) {
      this.tweet_item = tweet;
    }

    render(app, mod, container = "") {
      app.browser.addElementToDom(RedSquareItemTemplate(app, mod, this.tweet_item), 'redsquare-list');
      this.attachEvents();
    }

    attachEvents() { 
    }
}

module.exports = RedSquareItem;


