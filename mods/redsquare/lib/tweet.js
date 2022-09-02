const saito = require("./../../../lib/saito/saito");
const TweetTemplate = require("./tweet.template");
const PostTweet = require("./post");
const RetweetTweet = require("./retweet");
const SaitoOverlay = require("./../../../lib/saito/new-ui/saito-overlay/saito-overlay");
const SaitoLoader = require("./../../../lib/saito/new-ui/saito-loader/saito-loader");
const ModalAddPublicKey = require("./../../../lib/saito/new-ui/modals/confirm-add-publickey/confirm-add-publickey");

class RedSquareTweet {

  constructor(app, mod, tx) {

    //
    // store tx
    //
    this.tx = tx;

    this.sender = tx.transaction.from[0].add;
    this.created_at = tx.transaction.ts;
    this.updated_at = tx.transaction.ts;

    this.parent_tweet = null;
    this.parent_id = "";
    this.thread_id = "";
    this.critical_child = null;
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
    this.num_retweets = 0;
    this.num_likes = 0;

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
    if (tx.optional?.updated_at) {
      this.updated_at = tx.optional.updated_at;
    }
    if (tx.optional?.num_likes) {
      this.updated_at = tx.optional.num_likes;
    }
    if (tx.optional?.num_retweets) {
      this.num_retweets = tx.optional.num_retweets;
    }

    //
    // 0 = do not fetch open graph
    //
    this.generateTweetProperties(app, mod, 0);

    this.saito_loader = new SaitoLoader(app, this);
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

  returnKeys() {
    let keys = [];
    for (let i = 0; i < this.tx.transaction.to.length; i++) {
      if (!keys.include(this.tx.transaction.to[i].add)) {
        keys.push(this.tx.transaction.to[i].add);
      }
    }
    let w = this.app.browser.extractKeys(this.text);

    for (let i = 0; i < w.length; i++) {
      if (w[i].length > 0) {
        if (w[i][0] === '@') {
          let add = this.app.keys.returnPublicKeyByIdentifier(w[i].substring(1));
          if (!keys.include(add)) {
            keys.push(add);
          }
        }
      }
    }
    return keys();
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

  render(app, mod, selector = "", appendToSelector = true) {

    let tweet_id = "tweet-box-" + this.tx.transaction.sig;

    //
    // do not double-render
    //
    if (document.getElementById(tweet_id)) { return; }

    let html = TweetTemplate(app, mod, this);
    let tweet_div = "#" + tweet_id;
    let obj = document.getElementById(tweet_div);

    if (obj) {
      app.browser.replaceElementById(html, tweet_id);
    } else {
      if (appendToSelector) {
        app.browser.addElementToSelector(html, selector);
      } else {
        app.browser.prependElementToSelector(html, selector)
      }
    }

    if (this.critical_child != null && this.flagged != 1) {
      if (obj) {
        obj.classList.add("before-ellipsis");
        obj.nextSibling.classList.add("after-ellipsis");
        app.browser.addElementToDom('<div class="redsquare-ellipsis"></div>', obj);
        this.critical_child.render(app, mod, tweet_div);
      } else {
        if (appendToSelector) {
          app.browser.addElementToSelector('<div class="redsquare-ellipsis"></div>', selector);
        } else {
          app.browser.prependElementToSelector('<div class="redsquare-ellipsis"></div>', selector);
        }
        this.critical_child.render(app, mod, selector);
        document.querySelector(selector).querySelector('.redsquare-ellipsis').previousElementSibling.classList.add("before-ellipsis");
        document.querySelector(selector).querySelector('.redsquare-ellipsis').nextElementSibling.classList.add("after-ellipsis");
      }
    }
    this.attachEvents(app, mod);
    app.browser.addModalIdentifierAddPublickey(app, mod);
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
      if (this.children[0].tx.transaction.from[0].add === this.tx.transaction.from[0].add || this.children.length == 1) {
        this.children[0].renderWithChildren(app, mod, my_selector);
      } else {
        for (let i = 0; i < this.children.length; i++) {
          this.children[i].render(app, mod, my_selector);
        }
      }
    }

    app.browser.addIdentifiersToDom();
    this.attachEvents(app, mod);
  }

  renderWithParents(app, mod, selector = "", num = -1) {

    let html = TweetTemplate(app, mod, this);

    //
    // render endlessly upwards
    //
    if (num == -1) {
      if (this.parent_tweet == null && this.parent_id != this.tx.transaction.sig) {
	let x = mod.returnTweet(app, mod, this.parent_id);
        if (x != null) { this.parent_tweet = x; }
      }
      if (this.parent_tweet != null) {
        this.parent_tweet.critical_child = this;
        this.parent_tweet.renderWithParents(app, mod, selector, num);
        return;
      }
    } else {
      if (num > 0) {
        if (this.parent_tweet == null && this.parent_id != this.tx.transaction.sig) {
	  let x = mod.returnTweet(app, mod, this.parent_id);
          if (x != null) { this.parent_tweet = x; }
        }
        if (this.parent_tweet != null) {
          this.parent_tweet.critical_child = this;
          this.parent_tweet.renderWithParents(app, mod, selector, num-1);
          return;
        }
      }
    }

    let tweet_id = "tweet-box-" + this.tx.transaction.sig;
    let tweet_div = "#" + tweet_id;
    let obj = document.getElementById(tweet_div);
    let my_selector = ".redsquare-item-children-" + this.tx.transaction.sig;

    if (obj) {
      app.browser.replaceElementById(html, tweet_id);
    } else {
      app.browser.addElementToSelector(html, selector);
    }

    //
    // descend back
    //
    if (this.critical_child != null) {
      if (obj) {
        obj.classList.add("before-ellipsis");
        obj.nextSibling.classList.add("after-ellipsis");
        app.browser.addElementToDom('<div class="redsquare-ellipsis"></div>', obj);
        this.critical_child.render(app, mod, tweet_div);
      } else {
        app.browser.addElementToSelector('<div class="redsquare-ellipsis"></div>', selector);
        this.critical_child.render(app, mod, my_selector);
        try {
          document.querySelector(selector).querySelector('.redsquare-ellipsis').previousElementSibling.classList.add("before-ellipsis");
          document.querySelector(selector).querySelector('.redsquare-ellipsis').nextElementSibling.classList.add("after-ellipsis");
        } catch (err) {
	}
      }
    }
    this.attachEvents(app, mod);
    app.browser.addModalIdentifierAddPublickey(app, mod);
  }

  attachEvents(app, mod) {

    let tweet_self = this;

    //
    // render tweet with children
    //
    let sel = ("#tweet-" + this.tx.transaction.sig);
      document.querySelector(sel).onclick = (e) => {

      // e.preventDefault();
      // e.stopImmediatePropagation();

      this.saito_loader.render(app, mod, 'redsquare-home-header', false);
      let el = e.currentTarget;
      let tweet_sig_id = el.getAttribute("data-id");

      document.querySelector(".redsquare-list").innerHTML = "";
      let new_title = "<i class='saito-back-button fas fa-arrow-left'></i> RED SQUARE";
      app.browser.replaceElementById(`<div class="saito-page-header-title" id="saito-page-header-title"><i class='saito-back-button fas fa-arrow-left'></i> RED SQUARE</div>`, "saito-page-header-title");
      document.querySelector(".saito-back-button").onclick = (e) => {
        app.browser.replaceElementById(`<div class="saito-page-header-title" id="saito-page-header-title">Red Square</div>`, "saito-page-header-title");
        mod.renderMainPage(app, mod);
        let redsquareUrl = window.location.origin + window.location.pathname;
        window.history.pushState({}, document.title, redsquareUrl);
      }

      let sql = `SELECT * FROM tweets WHERE sig = '${tweet_sig_id}'`;
      mod.fetchTweets(app, mod, sql, function (app, mod) { 
        let t = mod.returnTweet(app, mod, tweet_sig_id);
        	if (t == null) { 
        	  console.log("TWEET IS NULL OR NOT STORED");
        	  return; 
        	}
        	if (t.children.length > 0) {
                  mod.renderWithChildren(app, mod, tweet_sig_id); 
                } else {
                  mod.renderWithParents(app, mod, tweet_sig_id, 1); 
        	}
      });

      let tweetUrl = window.location.origin + window.location.pathname + '?tweet_id=' + this.tx.transaction.sig;
      window.history.pushState({}, document.title, tweetUrl);

      this.saito_loader.remove(); 
    };

    //
    // reply to tweet
    //
    sel = ".tweet-reply-" + this.tx.transaction.sig;
    document.querySelector(sel).onclick = (e) => {

      e.preventDefault();
      e.stopImmediatePropagation();

      let ptweet = new PostTweet(app, mod, tweet_self);
      ptweet.parent_id = this.tx.transaction.sig;
      ptweet.thread_id = this.thread_id;
      ptweet.render(app, mod);

      let html = TweetTemplate(app, mod, this, 0);
      app.browser.prependElementToSelector(`<div class="post-tweet-preview" data-id="${tweet_self.tx.transaction.sig}">${html}</div>`, ".redsquare-tweet-overlay");
      app.browser.addIdentifiersToDom();
    };


    //
    // click on interior retweet to view it
    //
    // sel = `#redsquare-item-contents-${this.tx.transaction.sig} > .tweet-body > .link-preview > .redsquare-item > .redsquare-item-contents > .tweet-body`;
    // let x = document.querySelector(sel);
    // if (x) {
    //   x.onclick = (e) => {
    //     let tweet_id = e.currentTarget.getAttribute("data-id");
    //     // parent --> forces load of top-level element
    //     mod.renderParentWithChildren(app, mod, tweet_id);
    //   }
    // }


    //
    // retweet
    //
    sel = ".tweet-retweet-" + this.tx.transaction.sig;
    document.querySelector(sel).onclick = (e) => {

      e.preventDefault();
      e.stopImmediatePropagation();

      let rtweet = new RetweetTweet(app, mod, tweet_self);
      rtweet.tweet_id = this.tx.transaction.sig;
      rtweet.parent_id = this.parent_id;
      rtweet.thread_id = this.thread_id;
      rtweet.render(app, mod, tweet_self);

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

      mod.sendFlagTransaction(app, mod, { sig: this.tx.transaction.sig });

      let obj = document.querySelector(sel);
      obj.classList.add("saito-tweet-activity");
      document.querySelector('#tweet-box-' + this.tx.transaction.sig).style.display = 'none';
      salert("Tweet reported to moderators successfully.");
    };

    //
    // share tweet
    //
    sel = ".tweet-share-" + this.tx.transaction.sig;
    document.querySelector(sel).onclick = (e) => {

      e.preventDefault();
      e.stopImmediatePropagation();

      let tweetUrl = window.location.origin + window.location.pathname + '?tweet_id=' + this.tx.transaction.sig;
      navigator.clipboard.writeText(tweetUrl).then(() => {
        siteMessageNew("Link copied to clipboard.", 2000);
      });
    };


    document.addEventListener('click', function (e) {

      if (e.target && e.target.classList.contains('tweet-img')) {

	// don't stop propagation for all clicks or we stop
	// inputs from functioning if added to the DOM / DIV
        e.preventDefault();
        e.stopImmediatePropagation();

        let imgdata_uri = e.target.style.backgroundImage.slice(4, -1).replace(/"/g, "");
        let img_overlay = new SaitoOverlay(app, mod);
        img_overlay.show(app, mod, "<div id='tweet-overlay-img-cont'></div>");

        let oImg = document.createElement("img");
        oImg.setAttribute('src', imgdata_uri);
        document.querySelector('#tweet-overlay-img-cont').appendChild(oImg);

        let img_width = oImg.width;
        let img_height = oImg.height;
        let aspRatio = img_width / img_height;

        let winHeight = window.innerHeight;
        let winWidth = window.innerWidth;

        // if (aspRatio > 1) {
        //   oImg.style.width = '80vw';
        //   oImg.style.height = 'auto';

        //   if (oImg.height > winHeight) {
        //     oImg.style.width = (oImg.width * 0.75) + 'px';
        //   }
        // } else {
        //   oImg.style.height = '80vh';
        //   oImg.style.width = 'auto';
        
        //   if (oImg.width > winWidth) {
        //     oImg.height = (oImg.height * 0.75) + 'px';
        //   }
        // }

      }

      if (e.target.classList.contains('tweet-link')) {
        let url = e.target.getAttribute('href');
        window.open(url, '_blank').focus();

        e.preventDefault();
        e.stopImmediatePropagation();
      }
    });


  }

  //
  // returns 1 if tweet is added
  //
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
	this.unknown_children[i].parent_tweet = this;
        tweet.children.push(this.unknown_children[i]);
        this.unknown_children.splice(i, 0);
      }
    }


    if (tweet.parent_id == this.tx.transaction.sig) {
      for (let i = 0; i < this.children.length; i++) {
        if (this.children[i].tx.transaction.sig === tweet.tx.transaction.sig) {
          return 0;
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
	tweet.parent_tweet = this;
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

        return this;

      }

      //
      // normal link
      //
      if (fetch_open_graph == 1) {
        let res = await mod.fetchOpenGraphProperties(app, mod, this.link);
        if (res != '') {
          this.link_properties = res;
        }
      }

      return this;

    }

    return this;

  }


}

module.exports = RedSquareTweet;


