const RedSquareAppspaceHomeTemplate = require("./home.template");
const TweetBox = require("./../tweet-box");


class RedSquareAppspaceHome {

  constructor(app) {
    this.app = app;
    this.name = "RedSquareAppspaceHome";
  }

  render(app, mod) {

    document.querySelector(".appspace").innerHTML = "";
    app.browser.addElementToClass(RedSquareAppspaceHomeTemplate(app, mod), "appspace");

    app.connection.on("tweet-render-request", (tx) => {
        let tweet = new TweetBox(app, mod, tx);
        tweet.render(app, mod); 
    });

  }

}

module.exports = RedSquareAppspaceHome;

