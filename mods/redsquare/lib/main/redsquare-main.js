const RedSquareMainTemplate = require("./redsquare-main.template");
const RedSquareMenu = require("./../menu");
const TweetBox = require("./../tweet-box");


class RedSquareMain {

  constructor(app) {
    this.app = app;
    this.name = "RedSquareMain";
    this.tweet_item = [];
  }

  render(app, mod) {

    if (document.getElementById("saito-container")) {
      app.browser.addElementToDom(RedSquareMainTemplate(app, mod), document.getElementById("saito-container"));
    }

    app.connection.on("tweet-render-request", (tx) => {
console.log("ATB 1");
        let tweet = new TweetBox(app, mod, tx);
console.log("ATB 2");
        tweet.render(app, mod); 
console.log("ATB 3");
    });

  }

}

module.exports = RedSquareMain;

