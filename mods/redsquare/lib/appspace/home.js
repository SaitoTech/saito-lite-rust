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
    this.saitoLoader = new SaitoLoader(app, mod);

    this.observed = false


    let options = {
      root: null,
      rootMargin: '0px',
      threshold: 1
    }
    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {

          let saitoLoader = this.saitoLoader;
          saitoLoader.render(app, mod, "redsquare-intersection", false);
          this.prevTweetLength = mod.tweets.length;
          let prevTweetLength = this.prevTweetLength;

          const startingLimit = (mod.pageNumber - 1) * mod.resultsPerPage
          let sql = `SELECT * FROM tweets WHERE (flagged IS NOT 1 OR moderated IS NOT 1) AND tx_size < 1000000 ORDER BY updated_at DESC LIMIT '${startingLimit}','${mod.resultsPerPage}'`;
          mod.fetchTweets(app, mod, sql, function (app, mod) {
            mod.renderMainPage(app, mod);
            if (mod.tweets.length > prevTweetLength) {
              mod.pageNumber++;
            }


            saitoLoader.remove();
          });
        }

      })


    }, options)
  }

  async render(app, mod) {
    document.querySelector(".appspace").innerHTML = "";

    if (!document.querySelector('#redsquare-appspace-home')) {
      app.browser.addElementToClass(RedSquareAppspaceHomeTemplate(app, mod), "appspace");
    }


    app.connection.on("tweet-render-request", (tweet) => {
      tweet.render(app, mod, ".redsquare-list");
    });

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
    }

    document.getElementById("redsquare-new-tweets-banner").onclick = (e) => {
      mod.renderMainPage(app, mod);
      document.getElementById("redsquare-new-tweets-banner").style.display = 'none';
    }

  }

}

module.exports = RedSquareAppspaceHome;

