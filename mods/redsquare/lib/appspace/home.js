const RedSquareAppspaceHomeTemplate = require("./home.template");
const Tweet = require("./../tweet");


class RedSquareAppspaceHome {

  constructor(app) {
    this.app = app;
    this.name = "RedSquareAppspaceHome";
  }

  render(app, mod) {

    document.querySelector(".appspace").innerHTML = "";
    app.browser.addElementToClass(RedSquareAppspaceHomeTemplate(app, mod), "appspace");

    app.connection.on("tweet-render-request", (tx) => {
        let tweet = new Tweet(app, mod, tx);
        tweet.render(app, mod, ".redsquare-list"); 
    });

    for (let i = 0; i < mod.tweets.length; i++) {
        app.connection.emit('tweet-render-request', mod.tweets[i]);
    }

  }

}

module.exports = RedSquareAppspaceHome;

