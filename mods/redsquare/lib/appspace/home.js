const RedSquareAppspaceHomeTemplate = require("./home.template");
const SaitoOverlay = require("./../../../../lib/saito/new-ui/saito-overlay/saito-overlay");
const PostTweet = require("./../post");
const Tweet = require("./../tweet");


class RedSquareAppspaceHome {

  constructor(app, mod) {
    this.app = app;
    this.name = "RedSquareAppspaceHome";
  }

  async render(app, mod) {

    document.querySelector(".appspace").innerHTML = "";
    app.browser.addElementToClass(RedSquareAppspaceHomeTemplate(app, mod), "appspace");

    app.connection.on("tweet-render-request", (tweet) => {
        tweet.render(app, mod, ".redsquare-list"); 
    });

    for (let i = 0; i < mod.tweets.length; i++) {
console.log("i: " + i);
console.log(JSON.stringify(mod.tweets[i]));
        app.connection.emit('tweet-render-request', mod.tweets[i]);
    }

    this.attachEvents(app, mod);

  }

  attachEvents(app, mod) {

    this.overlay = new SaitoOverlay(app, mod);

    //
    // if PostTweet was a template file, we could write it directly into the overlay
    // since it is a class, we put an element in the overlay and render into that.
    //
    document.getElementById("redsquare-new-tweet").onclick = (e) => {
      this.overlay.show(app, mod, '<div class="redsquare-new-tweet-overlay"></div>');
      let ptweet = new PostTweet(app, mod, ".redsquare-new-tweet-overlay");
      ptweet.render(app, mod, ".redsquare-new-tweet-overlay");
    }

  }

}

module.exports = RedSquareAppspaceHome;

