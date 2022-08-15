const saito = require("./../../../lib/saito/saito");
const TweetTemplate = require("./tweet.template");
const PostTweet = require("./post");
const RetweetTweet = require("./retweet");
const SaitoOverlay = require("./../../../lib/saito/new-ui/saito-overlay/saito-overlay");

class RedSquareTweet {

  constructor(app, mod, tx) {

    //
    // store tx
    //
    this.tx = tx;

    this.sender = tx.transaction.from[0].add;
    this.created_at = tx.transaction.ts;
    this.updated_at = tx.transaction.ts;

    this.parent_id = "";
    this.thread_id = "";
    this.critical_child_post = null;
    this.text = null;
    this.link = null;
    this.link_properties = null;
    this.youtube_id = null;
    this.flagged = null;

    //
    // retweet
    //
    // if there is a retweet, we want to put it into a separate object
    // so it can be rendered separately into the tweet as a subcomponent
    //
    this.retweet = null;
    this.retweet_tx = null;
    this.retweet_html = null;
    this.retweet_link_properties = null;
    this.retweet_link = null;

    //
    // 
    //
    this.num_likes = 0;
    this.num_retweets = 0;

    this.children = [];
    this.unknown_children = [];

    this.setKeys(tx.msg.data);
    this.setKeys(tx.optional);

    if (this.retweet_tx != null) {

      let tx = new saito.default.transaction(JSON.parse(this.retweet_tx));
      this.retweet = new RedSquareTweet(app, mod, tx);

      if (this.retweet_link != null) {
        this.retweet.link = this.retweet_link;
      }
      if (this.retweet_link_properties != null) {
        this.retweet.link_properties = this.retweet_link_properties;
      }

      this.generateTweetProperties(app, mod, 0);
      this.retweet_html = this.retweet.returnHTML(app, mod, 0, 1);
    }
    if (this.parent_id === "") {
      this.parent_id = tx.transaction.sig;
    }
    if (this.thread_id === "") {
      this.thread_id = tx.transaction.sig;
    }
    // prefer server-provided updated-info as it will have context for TX-order
    if (tx.optional?.updated_at) {
      this.updated_at = tx.optional.updated_at;
    }


    //
    // 0 = do not fetch open graph
    //
    this.generateTweetProperties(app, mod, 0);

    console.log('tweet');
    console.log(this);
  }


  returnHTML(app, mod, include_controls = 0, include_header = 0) {
    return TweetTemplate(app, mod, this, include_controls, include_header);
  }

  returnTweet(app, mod, sig) {
    if (this.tx.transaction.sig === sig) { return this; }
    for (let i = 0; i < this.children.length; i++) {
      if (this.children[i].returnTweet(app, mod, sig) != null) {
        return this.children[i].returnTweet(app, mod, sig);
      }
    }
    return null;
  }


  isCriticalChild(app, mod, tweet) {
    for (let i = 0; i < tweet.tx.transaction.to.length; i++) {
      if (tweet.tx.transaction.to[i].add === app.wallet.returnPublicKey()) {
        if (this.critical_child == null) { return true; }
        if (tweet.tx.transaction.ts > this.critical_child.tx.transaction.tx) {
          return true;
        }
      }
    }
    return false;
  }

  render(app, mod, selector = "") {

    let html = TweetTemplate(app, mod, this);
    let tweet_id = "tweet-box-" + this.tx.transaction.sig;
    let tweet_div = "#" + tweet_id;
    let obj = document.getElementById(tweet_div);

    if (obj) {
      app.browser.replaceElementById(html, tweet_id);
    } else {
      app.browser.addElementToSelector(html, selector);
    }

    if (this.critical_child != null && this.flagged != 1) {
      if (obj) {
        obj.classList.add("before-ellipsis");
        obj.nextSibling.classList.add("after-ellipsis");
        app.browser.addElementToDom('<div class="redsquare-ellipsis"></div>', obj);
        this.critical_child.render(app, mod, tweet_div);
      } else {
        app.browser.addElementToSelector('<div class="redsquare-ellipsis"></div>', selector);
        this.critical_child.render(app, mod, selector);
        document.querySelector(selector).querySelector('.redsquare-ellipsis').previousElementSibling.classList.add("before-ellipsis");
        document.querySelector(selector).querySelector('.redsquare-ellipsis').nextElementSibling.classList.add("after-ellipsis");
      }
    }
    this.attachEvents(app, mod);
  }

  renderWithChildren(app, mod, selector = "") {

    let html = TweetTemplate(app, mod, this);
    let tweet_id = "tweet-box-" + this.tx.transaction.sig;
    let tweet_div = "#" + tweet_id;
    let obj = document.getElementById(tweet_div);
    let my_selector = ".redsquare-item-children-" + this.tx.transaction.sig;

    if (obj) {
      app.browser.replaceElementById(html, tweet_id);
    } else {
      app.browser.addElementToSelector(html, selector);
    }

    if (this.children.length > 0) {
      if (this.children[0].tx.transaction.from[0].add === this.tx.transaction.from[0].add) {
        this.children[0].renderWithChildren(app, mod, my_selector);
      } else {
        for (let i = 0; i < this.children.length; i++) {
          this.children[i].render(app, mod, my_selector);
        }
      }
    }

    this.attachEvents(app, mod);
  }

  attachEvents(app, mod) {

    //
    // render tweet with children
    //
    let sel = "#tweet-box-" + this.tx.transaction.sig;
    document.querySelector(sel).onclick = (e) => {

      //e.preventDefault();
      //e.stopImmediatePropagation();

      let el = e.currentTarget;

      let tweet_sig_id = el.getAttribute("data-id");

      document.querySelector(".redsquare-list").innerHTML = "";

      let new_title = "<i class='saito-back-button fas fa-arrow-left'></i> RED SQUARE";
      app.browser.replaceElementById(`<div class="saito-page-header-title" id="saito-page-header-title"><i class='saito-back-button fas fa-arrow-left'></i> RED SQUARE</div>`, "saito-page-header-title");
      document.querySelector(".saito-back-button").onclick = (e) => {
        app.browser.replaceElementById(`<div class="saito-page-header-title" id="saito-page-header-title">Red Square</div>`, "saito-page-header-title");
        mod.renderMainPage(app, mod);
      }

      mod.renderWithChildren(app, mod, tweet_sig_id);

    };


    //
    // reply to tweet
    //
    sel = ".tweet-reply-" + this.tx.transaction.sig;
    document.querySelector(sel).onclick = (e) => {

      e.preventDefault();
      e.stopImmediatePropagation();

      let ptweet = new PostTweet(app, mod);
      ptweet.parent_id = this.tx.transaction.sig;
      ptweet.thread_id = this.thread_id;
      ptweet.render(app, mod);

      let html = TweetTemplate(app, mod, this, 0);
      app.browser.prependElementToSelector(`<div class="post-tweet-preview">${html}</div>`, ".redsquare-tweet-overlay");

      // increase num likes
      sel = ".tweet-tool-comment-count-" + this.tx.transaction.sig;
      let obj = document.querySelector(sel);
      obj.innerHTML = parseInt(obj.innerHTML) + 1;
      if (obj.parentNode.classList.contains("saito-tweet-no-activity")) {
        obj.parentNode.classList.remove("saito-tweet-no-activity");
        obj.parentNode.classList.add("saito-tweet-activity");
      }
    };



    //
    // retweet
    //
    sel = ".tweet-retweet-" + this.tx.transaction.sig;
    document.querySelector(sel).onclick = (e) => {

      e.preventDefault();
      e.stopImmediatePropagation();

      let rtweet = new RetweetTweet(app, mod);
      rtweet.tweet_id = this.tx.transaction.sig;
      rtweet.parent_id = this.parent_id;
      rtweet.thread_id = this.thread_id;
      rtweet.render(app, mod, this);

      let html = TweetTemplate(app, mod, this, 0);
      app.browser.prependElementToSelector(`<div class="post-tweet-preview">${html}</div>`, ".redsquare-tweet-overlay");

      // increase num likes
      sel = ".tweet-tool-retweet-count-" + this.tx.transaction.sig;
      let obj = document.querySelector(sel);
      obj.innerHTML = parseInt(obj.innerHTML) + 1;
      if (obj.parentNode.classList.contains("saito-tweet-no-activity")) {
        obj.parentNode.classList.remove("saito-tweet-no-activity");
        obj.parentNode.classList.add("saito-tweet-activity");
      };
    }


    //
    // like
    //
    sel = ".tweet-like-" + this.tx.transaction.sig;
    document.querySelector(sel).onclick = (e) => {

      e.preventDefault();
      e.stopImmediatePropagation();

      mod.sendLikeTransaction(app, mod, { sig: this.tx.transaction.sig });

      // increase num likes
      sel = ".tweet-tool-like-count-" + this.tx.transaction.sig;
      let obj = document.querySelector(sel);
      obj.innerHTML = parseInt(obj.innerHTML) + 1;
      if (obj.parentNode.classList.contains("saito-tweet-no-activity")) {
        obj.parentNode.classList.remove("saito-tweet-no-activity");
        obj.parentNode.classList.add("saito-tweet-activity");
      };
    };

    //
    // flag
    //
    sel = ".tweet-flag-" + this.tx.transaction.sig;
    document.querySelector(sel).onclick = (e) => {

      e.preventDefault();
      e.stopImmediatePropagation();

      mod.sendLikeTransaction(app, mod, { sig: this.tx.transaction.sig });

      let obj = document.querySelector(sel);
      obj.classList.add("saito-tweet-activity");
      document.querySelector('#tweet-box-'+this.tx.transaction.sig).style.display = 'none';
      salert("Tweet reported to moderators successfully.");
    };

    //
    // share tweet
    //
    sel = ".tweet-share-" + this.tx.transaction.sig;
    document.querySelector(sel).onclick = (e) => {

      e.preventDefault();
      e.stopImmediatePropagation();

      let url = window.location.href + '?type=tweet&id=' + this.tx.transaction.sig;
      navigator.clipboard.writeText(url).then(() => {
        salert("Link copied to clipboard successfully.");
      });
    };
  }


  addTweet(app, mod, tweet) {

    //
    // maybe we have some parentless children?
    //
    // this can happen when a sub-comment has a more recent updated_at timestamp than
    // the parent comment it is replying to, and thus it gets fed to us out-of-order
    // such that this algorithm has trouble reconstructing the chain.
    //
    for (let i = 0; i < this.unknown_children.length; i++) {
      if (this.unknown_children[i].parent_id === tweet.tx.transaction.sig) {
        if (this.isCriticalChild(app, mod, this.unknown_children[i])) {
          this.critical_child = this.unknown_children[i];
          this.updated_at = this.critical_child;
        }
        tweet.children.push(this.unknown_children[i]);
        this.unknown_children.splice(i, 0);
      }
    }


    if (tweet.parent_id == this.tx.transaction.sig) {
      for (let i = 0; i < this.children.length; i++) {
        if (this.children[i].tx.transaction.sig === tweet.tx.transaction.sig) {
          return 1;
        }
      }
      this.updated_at = tweet.updated_at;
      if (tweet.tx.transaction.from[0].add === this.tx.transaction.from[0].add) {
        this.children.unshift(tweet);
        return 1;
      } else {
        if (this.isCriticalChild(app, mod, tweet)) {
          this.critical_child = tweet;
        }
        this.children.push(tweet);
        return 1;
      }
    } else {
      for (let i = 0; i < this.children.length; i++) {
        if (this.isCriticalChild(app, mod, tweet)) {
          this.critical_child = tweet;
        }
        let x = this.children[i].addTweet(app, mod, tweet);
        if (x == 1) {
          this.updated_at = tweet.updated_at;
        }
        return x;
      }

      //
      // still here? add in unknown children
      //
      // this means we know the comment is supposed to be somewhere in this thread/parent
      // but its own parent doesn't yet exist, so we are simply going to store it here 
      // until we possibly add the parent (where we will check all unknown children) for
      // placement then.
      //
      this.unknown_children.push(tweet);

    }

  }

  setKeys(obj) {
    for (let key in obj) {
      if (typeof obj[key] !== 'undefined') {
        if (this[key] === 0 || this[key] === "" || this[key] === null) {
          this[key] = obj[key];
        }
      }
    }
  }

  exportData(app, mod) {
    return { text: this.text };
  }

  async generateTweetProperties(app, mod, fetch_open_graph = 0) {

    if (this.text == null) { return this; }

    let expression = /(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/gi;
    let links = this.text.match(expression);

    if (links != null && links.length > 0) {

      //
      // save the first link
      //
      let link = new URL(links[0]);
      this.link = link.toString();

      //
      // youtube link
      //
      if (this.link.indexOf("youtube.com") != -1) {

        let urlParams = new URLSearchParams(link.search);
        let videoId = urlParams.get('v');

        this.youtube_id = videoId;

        //
        // and cut the link from the tweet
        //
        this.text = this.text.replace(this.link, '');

        return this;

      }

      //
      // normal link
      //
      if (fetch_open_graph == 1) {
        let res = await mod.fetchOpenGraphProperties(app, mod, this.link);
        if (res != '') {

          this.link_properties = res;

          //
          // and cut the link from the tweet
          //
          this.text = this.text.replace(this.link, '');

        }

      }

      return this;

    }

    return this;

  }


}

module.exports = RedSquareTweet;


