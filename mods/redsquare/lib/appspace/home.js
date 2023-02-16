const AppspaceHomeTemplate = require("./home.template");
const Post = require("./../post");
const Tweet = require("./../tweet");
const SaitoLoader = require("../../../../lib/saito/ui/saito-loader/saito-loader");



class AppspaceHome {

  constructor(app, mod, container = "") {
    this.app = app;
    this.mod = mod;
    this.container = container;
    this.name = "RedSquareAppspaceHome";
    this.thread_id = "";
    this.parent_id = "";
    this.saito_loader = new SaitoLoader(app, mod);

    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (mod.viewing !== "home") { return; }
          let saito_loader = new SaitoLoader(app, mod, '#redsquare-intersection');
          saito_loader.render();
          mod.loadMoreTweets(() => saito_loader.remove());
        }
      });
    }, {
      root: null,
      rootMargin: '0px',
      threshold: 1
    });
  }

  render() {

    //
    // render main feed by default
    //
    this.renderMain();

  }


  renderTweetsWithSig(sig) {

alert("container: " + this.container);

    if (document.querySelector(".redsquare-appspace-body")) {
      this.app.browser.replaceElementBySelector(AppspaceHomeTemplate(), ".redsquare-home");
    } else {
      this.container.innerHTML = "";
      this.app.browser.addElementToSelector(AppspaceHomeTemplate(), this.container);    
    }

    //this.saito_loader.render();

    let sql = `SELECT * FROM tweets WHERE sig = '${sig}' OR parent_id = '${sig}'`;
    this.mod.loadTweetsFromPeerAndReturn(this.mod.peers_for_tweets[0], sql, (txs) => {
      //this.saito_loader.hide();
      for (let z = 0; z < txs.length; z++) {
        let tweet = new Tweet(this.app, this.mod, ".redsquare-appspace-body", txs[z]);
        tweet.render();
      }
    }, false, false);

  }

  renderMoreTweets() {
    for (let i = 0; i < this.mod.tweets.length; i++) {
      if (this.mod.tweets[i].updated_at > this.mod.tweets_last_viewed_ts) {
        this.mod.tweets_last_viewed_ts = this.mod.tweets[i].updated_at;
      }
      this.mod.tweets[i].container = ".redsquare-appspace-body";
      this.mod.tweets[i].renderWithCriticalChild();

    }


    this.attachEvents();
  }


  renderNewTweets() {
    for (let i = 0; i < this.mod.tweets.length; i++) {
      if (this.mod.tweets[i].updated_at > this.mod.tweets_last_viewed_ts) {
        this.mod.tweets_last_viewed_ts = this.mod.tweets[i].updated_at;
      }
      this.mod.tweets[i].container = ".redsquare-appspace-body";
      this.mod.tweets[i].renderWithCriticalChild();

    }

    this.attachEvents();

  }




  renderMain() {

    this.thread_id = "";
    this.parent_id = "";

    if (document.querySelector(".redsquare-home")) {
      this.app.browser.replaceElementBySelector(AppspaceHomeTemplate(), ".redsquare-home");
    } else {
      this.container.innerHTML = "";
      this.app.browser.addElementToSelectorOrDom(AppspaceHomeTemplate(), this.container);
    }

    // render all top-level tweets, possibly with critical children

    for (let i = 0; i < this.mod.tweets.length; i++) {
      // if any tweets remove loader
      if (this.mod.tweets[i].updated_at > this.mod.tweets_last_viewed_ts) {
        this.mod.tweets_last_viewed_ts = this.mod.tweets[i].updated_at;
      }
      this.mod.tweets[i].container = ".redsquare-appspace-body";
      this.mod.tweets[i].renderWithCriticalChild();
    }

    this.attachEvents();

  }

  renderThread(tweet) {

    this.thread_id = tweet.tx.transaction.sig;
    this.parent_id = tweet.tx.transaction.sig;

    if (document.querySelector(".redsquare-appspace-body")) {
      this.app.browser.replaceElementBySelector(AppspaceHomeTemplate(), ".redsquare-home");
      document.querySelector(".redsquare-home").dataset.thread_id = this.thread_id;
    } else {
      this.app.browser.addElementToSelectorOrDom(AppspaceHomeTemplate(), this.container);
      document.querySelector(".redsquare-home").dataset.thread_id = this.thread_id;
    }
    tweet.renderWithParentAndChildren();

    // make tweets full
    document.querySelectorAll('.tweet-text').forEach(item => {
      if (item.classList.contains('preview')) {
        item.classList.replace('preview', 'full')
      }
    })

    document.querySelectorAll(".tweet")[0].scrollIntoView({behavior: "smooth", block: "start"});

    this.attachEvents();

  }

  attachEvents() {

    this.intersectionObserver.observe(document.querySelector('#redsquare-intersection'));

    document.getElementById("redsquare-tweet").onclick = (e) => {
      let post = new Post(this.app, this.mod);
      post.render();
    }

    document.getElementById("redsquare-profile").onclick = (e) => {
      this.app.connection.emit('redsquare-profile-render-request', this.app.wallet.returnPublicKey());
    }

    document.querySelector('.redsquare-new-tweets-banner').onclick = (e) => {
      this.renderNewTweets();
    }


  }

}

module.exports = AppspaceHome;



