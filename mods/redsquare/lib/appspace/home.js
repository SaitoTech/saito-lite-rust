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

    mod.renderMainPage(app, mod);


    this.attachEvents(app, mod);

  }

  attachEvents(app, mod) {

    this.overlay = new SaitoOverlay(app, mod);

    //
    // if PostTweet was a template file, we could write it directly into the overlay
    // since it is a class, we put an element in the overlay and render into that.
    //
    document.getElementById("redsquare-new-tweet").onclick = (e) => {
      let ptweet = new PostTweet(app, mod);
      ptweet.render(app, mod);
    }

    document.getElementById("redsquare-new-tweets-banner").onclick = (e) => {
      mod.renderMainPage(app, mod);
      document.getElementById("redsquare-new-tweets-banner").style.display = 'none';
    }

  }

}

module.exports = RedSquareAppspaceHome;

