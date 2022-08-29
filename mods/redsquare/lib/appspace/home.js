const RedSquareAppspaceHomeTemplate = require("./home.template");
const SaitoOverlay = require("./../../../../lib/saito/new-ui/saito-overlay/saito-overlay");
const PostTweet = require("./../post");
const Tweet = require("./../tweet");
const SaitoLoader = require("../../../../lib/saito/new-ui/saito-loader/saito-loader");



class RedSquareAppspaceHome {

  constructor(app, mod) {
    this.app = app;
    this.name = "RedSquareAppspaceHome";
    this.prevTweetLength = null;
    this.saito_loader = new SaitoLoader(app, mod);

    this.observed = false

    // not currently used, kept for flexibility for future
    app.connection.on('tweets-render-request', (tweets, appendToSelector = true) => {
      tweets.forEach(tweet => {
        tweet.render(app, mod, '.redsquare-list', appendToSelector)
      })
    })

    app.connection.on("tweet-render-request", (tweet) => {
console.log("ADDING TRR: " + tweet.tx.transaction.sig);
      tweet.render(app, mod, ".redsquare-list");
    });

    let options = {
      root: null,
      rootMargin: '0px',
      threshold: 1
    }
    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          console.log('is intersecting')
          let saito_loader = this.saito_loader;
          saito_loader.render(app, mod, "redsquare-intersection", false);
          mod.fetchMoreTweets(app, mod, (app, mod) => saito_loader.remove());
        }

      })


    }, options)
  }

  async render(app, mod) {
    document.querySelector(".appspace").innerHTML = "";

    if (!document.querySelector('#redsquare-appspace-home')) {
      app.browser.addElementToClass(RedSquareAppspaceHomeTemplate(app, mod), "appspace");
    }

    mod.renderMainPage(app, mod);

    this.intersectionObserver.observe(document.querySelector('#redsquare-intersection'));

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

      app.browser.addIdentifiersToDom();
    }

    // document.getElementById("redsquare-new-tweets-banner").onclick = (e) => {
    //   mod.renderMainPage(app, mod);
    //   document.getElementById("redsquare-new-tweets-banner").style.display = 'none';
    // }

  }

}

module.exports = RedSquareAppspaceHome;

