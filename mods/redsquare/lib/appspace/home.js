const AppspaceHomeTemplate = require("./home.template");
const Post = require("./../post");



class AppspaceHome {

  constructor(app, mod, container = "") {
    this.app = app;
    this.mod = mod;
    this.container = container;
    this.name = "RedSquareAppspaceHome";
    this.thread_id = "";
    this.parent_id = "";
  }

  render() {

    //
    // render main feed by default
    //
    this.renderMain();

  }  



  renderMain() {

    this.thread_id = "";
    this.parent_id = "";

    if (document.querySelector(".redsquare-home")) {
      this.app.browser.replaceElementBySelector(AppspaceHomeTemplate(), ".redsquare-home");
    } else {
      this.app.browser.addElementToSelectorOrDom(AppspaceHomeTemplate(), this.container);
    }

    //
    // render all top-level tweets, possibly with critical children
    //
    for (let i = 0; i < this.mod.tweets.length; i++) {
      if (this.mod.tweets[i].updated_at > this.mod.tweets_last_viewed_ts) {
	this.mod.tweets_last_viewed_ts = this.mod.tweets[i].updated_at;
      }
      this.mod.tweets[i].container = ".redsquare-home";
      this.mod.tweets[i].render();
    }

    this.attachEvents();

  }

  renderThread(tweet) {

    this.thread_id = tweet.tx.transaction.sig;
    this.parent_id = tweet.tx.transaction.sig;

    if (document.querySelector(".redsquare-home")) {
      this.app.browser.replaceElementBySelector(AppspaceHomeTemplate(), ".redsquare-home");
    } else {
      this.app.browser.addElementToSelectorOrDom(AppspaceHomeTemplate(), this.container);
    }

    tweet.renderWithChildren();

    this.attachEvents();

  }

  attachEvents() {

    document.getElementById("redsquare-tweet").onclick = (e) => {
      let post = new Post(this.app, this);
      post.render();
    }

    document.getElementById("redsquare-profile").onclick = (e) => {
      this.app.connection.emit('redquare-profile-render-request', this.app.wallet.returnPublicKey());
    }

  }

}

module.exports = AppspaceHome;



