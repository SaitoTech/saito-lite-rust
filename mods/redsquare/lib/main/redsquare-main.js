const RedSquareMainTemplate = require("./redsquare-main.template");
const RedSquareMenu = require("./../menu");
const RedSquareItem = require("./../redsquare-item");


class RedSquareMain {

  constructor(app) {
    this.app = app;
    this.name = "RedSquareMain";
    this.tweet_item = [];
  }

  render(app, mod) {

    if (document.getElementById("saito-container")) {
      app.browser.addElementToDom(RedSquareMainTemplate(app, mod), "saito-container");

      this.attachEvents(app, mod);
    }

    app.connection.on("tweet-render-request", (tweet) => {
        let item = new RedSquareItem(app, mod, tweet);
        item.render(app, mod); 
    });

  }

  attachEvents(app, mod) {

    let tweetBtn = document.querySelector('#redsquare-input-container button');
    tweetBtn.onclick = (e) => {
      e.preventDefault();

      let content = document.querySelector('#redsquare-input-container textarea').value;     
      mod.sendTweetTransaction(content);  
    }

  }


}

module.exports = RedSquareMain;

