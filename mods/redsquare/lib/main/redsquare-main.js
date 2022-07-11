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
      app.browser.addElementToDom(RedSquareMainTemplate(app, mod), "saito-container");
    }

    

    app.connection.on("tweet-render-request", (tweet) => {
        console.log('inside emit');
        console.log(tweet);
        let item = new TweetBox(app, mod, tweet);
        item.render(app, mod); 
    });

  }

}

module.exports = RedSquareMain;

