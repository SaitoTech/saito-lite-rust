const saito = require('./../../../lib/saito/saito');
const TweetTemplate = require("./tweet.template");
const Link = require("./link");
const Image = require("./image");
const Post = require("./post");
const JSON = require('json-bigint');

class Tweet {

  constructor(app, mod, container = "", tx = null) {

    this.app = app;
    this.mod = mod;
    this.container = container;
    this.name = "Tweet";

    this.tx = tx;
    let txmsg = tx.returnMessage();

    this.parent_id = "";
    this.thread_id = "";
    this.updated_at = 0;
    this.notice = "";

    this.children = [];
    this.children_sigs_hmap = {};
    this.unknown_children = [];
    this.unknown_children_sigs_hmap = {};
    this.critical_child = null;
    this.render_after_selector = "";

    this.retweet = null;
    this.retweeters = [];
    this.retweet_tx = null;
    this.retweet_tx_sig = null;
    this.links = [];
    this.link = null;
    this.link_properties = null;
    this.show_controls = 1;
    this.is_long_tweet = false;
    this.is_retweet = false;
    this.setKeys(tx.msg.data);
    this.setKeys(tx.optional);

    this.generateTweetProperties(app, mod, 1);

    //
    // create retweet if exists
    //
    if (this.retweet_tx != null) {
      let newtx = new saito.default.transaction(JSON.parse(this.retweet_tx));
      this.retweet = new Tweet(this.app, this.mod, `.tweet-preview-${this.tx.transaction.sig}`, newtx);
      this.retweet.is_retweet = true;
      this.retweet.show_controls = 0;
    } else {
      //
      // create image preview if exists
      //
      if (this.images?.length > 0) {
        this.img_preview = new Image(this.app, this.mod, `.tweet-${this.tx.transaction.sig} .tweet-body .tweet-main .tweet-preview`, this);
      } else {
        //
        // create link preview if exists
        //
        if (this.link != null) {
          this.link_preview = new Link(this.app, this.mod, `.tweet-${this.tx.transaction.sig} .tweet-body .tweet-main .tweet-preview`, this);
        }
      }
    }
  }


  render(prepend = false) {

    let myqs = `.tweet-${this.tx.transaction.sig}`;
    let replace_existing_element = true;

    //
    // retweets displayed in container even if master exists elsewhere on page
    //
    if (this.is_retweet) {
      myqs = this.container;
      replace_existing_element = true;
    } else {

      //
      // this isn't retweet, but if the original exists, we want to ignore
      // it unless it is parent-level (top thread).
      //
      if (document.querySelector(myqs)) {
        let obj = document.querySelector(myqs);
        let parent = obj.parentElement;
        if (parent.classList.contains("tweet-main")) {
          replace_existing_element = false;
        }
      }
    }

    if (replace_existing_element && document.querySelector(myqs)) {
      this.app.browser.replaceElementBySelector(TweetTemplate(this.app, this.mod, this), myqs);
    } else {
      if (prepend == true) {
        this.app.browser.prependElementToSelector(TweetTemplate(this.app, this.mod, this), this.container);
      } else {
        if (this.render_after_selector) {
          this.app.browser.addElementAfterSelector(TweetTemplate(this.app, this.mod, this), this.render_after_selector);
        } else {
          this.app.browser.addElementToSelector(TweetTemplate(this.app, this.mod, this), this.container);
        }
      }
    }

    if (this.retweet != null) {
      this.retweet.render();
    }
    if (this.img_preview != null) {
      this.img_preview.render();
    }
    if (this.link_preview != null) {
      this.link_preview.render();
    }

    this.attachEvents();

  }

  renderWithCriticalChild(prepend = false) {

    this.render(prepend);
    this.attachEvents();

    if (this.critical_child) {

      this.critical_child.render_after_selector = ".tweet-" + this.tx.transaction.sig;
      this.critical_child.render();

      let myqs = `.tweet-${this.tx.transaction.sig}`;
      let obj = document.querySelector(myqs);
      if (obj) {
        if (this.critical_child.parent_id == this.tx.transaction.sig) {
          obj.classList.add("has-reply");
        } else {
          obj.classList.add("has-reply-disconnected");
        }
      }

    }

  }



  renderWithChildren() {

    //
    // first render the tweet
    //
    this.render();

    //
    // then render its children
    //
    if (this.children.length > 0) {
      if (this.children[0].tx.transaction.from[0].add === this.tx.transaction.from[0].add || this.children.length == 1) {
        if (this.children[0].children.length > 0) {
          this.children[0].container = this.container;
          this.children[0].renderWithChildren();
        } else {
          for (let i = 0; i < this.children.length; i++) {
            this.children[i].container = this.container;
            this.children[i].render_after_selector = `.tweet-${this.tx.transaction.sig}`;
            this.children[i].render();
          }
        }
      } else {
        for (let i = 0; i < this.children.length; i++) {
          this.children[i].container = this.container;
          this.children[i].render_after_selector = `.tweet-${this.tx.transaction.sig}`;
          this.children[i].render();
        }
      }
    }

    this.attachEvents();
  }


  renderWithParentAsCritical() {

    let parent = this.mod.returnTweet(this.parent_id);

    if (parent) {
      parent.critical_child = this;
      parent.renderWithCriticalChild(true);
    } else {
      this.render();
    }
  }


  renderWithParentAndChildren() {

    //
    // first render parent if it exists
    //
    let parent = this.mod.returnTweet(this.parent_id);

    if (parent) {
      parent.critical_child = this;
      parent.render();
      this.render_after_selector = `.tweet-${this.parent_id}`;
      this.render();
    } else {
      this.render();
    }


    //
    //then render its children
    if (this.children.length > 0) {
      if (this.children[0].tx.transaction.from[0].add === this.tx.transaction.from[0].add || this.children.length == 1) {
        if (this.children[0].children.length > 0) {
          this.children[0].container = this.container;
          this.children[0].render_after_selector = `.tweet-${this.tx.transaction.sig}`;
          this.children[0].renderWithChildren();
        } else {
          for (let i = 0; i < this.children.length; i++) {
            this.children[i].container = this.container;
            this.children[i].render_after_selector = `.tweet-${this.tx.transaction.sig}`;
            this.children[i].render();
          }
        }
      } else {
        for (let i = 0; i < this.children.length; i++) {
          this.children[i].container = this.container;
          this.children[i].render_after_selector = `.tweet-${this.tx.transaction.sig}`;
          this.children[i].render();
        }
      }
    }

    this.attachEvents();
  }


  attachEvents() {

    if (this.show_controls == 0) { return; }

    try {

      /////////////////////////////
      // Expand / Contract Tweet //
      /////////////////////////////
      let el = document.querySelector(`.tweet-${this.tx.transaction.sig} .tweet-body .tweet-main .tweet-text`);
      // skip tweets that aren't on the page -- like comments
      if (!el) { return; }
      let cobj = document.querySelector(this.container);     
      let is_full = false;

      if (is_full) {
          el.classList.add('full');
      } else { 
        if (el.clientHeight < el.scrollHeight) {
          el.classList.add("preview");
          this.is_long_tweet = true;
        }
      }


      /////////////////
      // view thread //
      /////////////////
      let this_tweet = document.querySelector(`.tweet-${this.tx.transaction.sig}`);
      if (!this_tweet.dataset.hasClickEvent) {
        this_tweet.dataset.hasClickEvent = true;
        this_tweet.addEventListener('click', (e) => {

          let tweet_text = document.querySelector(`.tweet-${this.tx.transaction.sig} .tweet-text`);
          if (this.is_long_tweet) {
            if (!tweet_text.classList.contains('full')) {
              tweet_text.classList.remove('preview');
              tweet_text.classList.add('full');
            } else {
              if (e.target.tagName != "IMG") {
                window.history.pushState(null, "", `/redsquare/?tweet_id=${this.tx.transaction.sig}`)
                this.app.connection.emit("redsquare-thread-render-request", (this));
              }
            }
            return;
          }

          //
          // if we are asking to see a tweet, load from parent if exists
          //
          if (e.target.tagName != "IMG") {  window.history.pushState(null, "", `/redsquare/?tweet_id=${this.tx.transaction.sig}`)

            this.app.connection.emit("redsquare-thread-render-request", (this));
          }
        })
      }



      ///////////
      // reply //
      ///////////
      document.querySelector(`.tweet-${this.tx.transaction.sig} .tweet-body .tweet-main .tweet-controls .tweet-tool-comment`).onclick = (e) => {

        e.preventDefault();
        e.stopImmediatePropagation();

        let tweet_sig = e.currentTarget.parentNode.parentNode.parentNode.parentNode.getAttribute("data-id");
        if (tweet_sig != null) {

          let post = new Post(this.app, this.mod, this);
          post.parent_id = tweet_sig;
          post.source = 'Reply';
          post.render();
          this.app.browser.prependElementToSelector(`<div id="post-tweet-preview-${tweet_sig}" class="post-tweet-preview" data-id="${tweet_sig}"></div>`, ".tweet-overlay");

          let newtx = new saito.default.transaction(JSON.parse(JSON.stringify(this.tx.transaction)));
          newtx.transaction.sig = this.app.crypto.hash(newtx.transaction.sig);
          let new_tweet = new Tweet(this.app, this.mod, `#post-tweet-preview-${tweet_sig}`, newtx);
          new_tweet.show_controls = 0;
          new_tweet.render();

        }
      };


      /////////////
      // retweet //
      /////////////
      document.querySelector(`.tweet-${this.tx.transaction.sig} .tweet-body .tweet-main .tweet-controls .tweet-tool-retweet`).onclick = (e) => {

        e.preventDefault();
        e.stopImmediatePropagation();

        let tweet_sig = e.currentTarget.parentNode.parentNode.parentNode.parentNode.getAttribute("data-id");
        if (tweet_sig != null) {

          let post = new Post(this.app, this.mod, this);
          //
          // retweets do not have parent_id -- new thread
          //
          //post.parent_id = tweet_sig;
          post.source = 'Retweet';
          post.render();
          this.app.browser.prependElementToSelector(`<div id="post-tweet-preview-${tweet_sig}" class="post-tweet-preview" data-id="${tweet_sig}"></div>`, ".tweet-overlay");

          let newtx = new saito.default.transaction(JSON.parse(JSON.stringify(this.tx.transaction)));
          newtx.transaction.sig = this.app.crypto.hash(newtx.transaction.sig);
          let new_tweet = new Tweet(this.app, this.mod, `#post-tweet-preview-${tweet_sig}`, newtx);
          new_tweet.show_controls = 0;
          new_tweet.render();

        }
      };


      //////////
      // like //
      //////////
      document.querySelector(`.tweet-${this.tx.transaction.sig} .tweet-body .tweet-main .tweet-controls .tweet-tool-like`).onclick = (e) => {




      };

      
     const heartIcon = document.querySelector(`.tweet-${this.tx.transaction.sig} .tweet-like-button .heart-icon`);


     heartIcon.onclick =  (e) => {
      if (heartIcon.classList.contains("liked")) {
        heartIcon.classList.remove("liked");
        setTimeout(()=> {
          heartIcon.classList.add("liked");
        })

      }else {
        heartIcon.classList.add("liked");
      }

      
      e.preventDefault();
      e.stopImmediatePropagation();

      let tweet_sig = e.currentTarget.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.getAttribute("data-id");
      if (tweet_sig != null) {

        this.mod.sendLikeTransaction(this.app, this.mod, { sig: tweet_sig }, this.tx);

        //
        // increase num likes
        //
        let obj = document.querySelector(`.tweet-${tweet_sig} .tweet-body .tweet-main .tweet-controls .tweet-tool-like .tweet-tool-like-count`);
        obj.innerHTML = parseInt(obj.innerHTML) + 1;
        if (obj.parentNode.classList.contains("saito-tweet-no-activity")) {
          obj.parentNode.classList.remove("saito-tweet-no-activity");
          obj.parentNode.classList.add("saito-tweet-activity");
        };
      }
    }


      ///////////
      // share //
      ///////////
      document.querySelector(`.tweet-${this.tx.transaction.sig} .tweet-body .tweet-main .tweet-controls .tweet-tool-share`).onclick = (e) => {

        e.preventDefault();
        e.stopImmediatePropagation();

        let tweet_sig = e.currentTarget.parentNode.parentNode.parentNode.parentNode.getAttribute("data-id");
        if (tweet_sig != null) {

          let tweetUrl = window.location.origin + window.location.pathname + '?tweet_id=' + tweet_sig;
          navigator.clipboard.writeText(tweetUrl).then(() => {
            siteMessage("Link copied to clipboard.", 2000);
          });

        }
      };

      //////////
      // flag //
      //////////
      document.querySelector(`.tweet-${this.tx.transaction.sig} .tweet-body .tweet-main .tweet-controls .tweet-tool-flag`).onclick = (e) => {

        e.preventDefault();
        e.stopImmediatePropagation();

        let tweet_sig = e.currentTarget.parentNode.parentNode.parentNode.parentNode.getAttribute("data-id");
        if (tweet_sig != null) {

          this.mod.sendFlagTransaction(this.app, this.mod, { sig: tweet_sig }, this.tx);
          let obj = document.querySelector(`.tweet-flag-${tweet_sig}`);
          if (obj) { obj.classList.add("saito-tweet-activity"); }
          obj = document.querySelector(`.tweet-${tweet_sig}`);
          if (obj) { obj.style.display = 'none'; }
          salert("Tweet reported to moderators successfully.");

        }
      };

    } catch (err) {
      console.log("ERROR attaching events to tweet: " + err);
    }

  }


  setKeys(obj) {

    for (let key in obj) {
      if (typeof obj[key] !== 'undefined') {
        if (this[key] === 0 || this[key] === "" || this[key] === null || typeof this[key] === "undefined") {
          this[key] = obj[key];
        }
      }
    }
  }



  addTweet(tweet, levels_deep = 0) {

    //
    // still here? add in unknown children
    //
    // this means we know the comment is supposed to be somewhere in this thread/parent
    // but its own parent doesn't yet exist, so we are simply going to store it here
    // until we possibly add the parent (where we will check all unknown children) for
    // placement then.
    //
    this.unknown_children.push(tweet);
    this.unknown_children_sigs_hmap[tweet.tx.transaction.sig] = 1;
    //
    // if this tweet is the parent-tweet of a tweet we have already downloaded
    // and indexed here. this can happen if tweets arrive out-of-order.
    //
    for (let i = 0; i < this.unknown_children.length; i++) {
      if (this.unknown_children[i].parent_id === tweet.tx.transaction.sig) {
        if (this.isCriticalChild(this.unknown_children[i])) {
          this.critical_child = this.unknown_children[i];
          this.updated_at = this.critical_child.updated_at;
        }
        this.unknown_children[i].parent_tweet = tweet;

        //
        // tweet adds its orphan
        //
        tweet.addTweet(this.unknown_children[i], (levels_deep + 1));

        //
        // and delete from unknown children
        //
        if (this.unknown_children_sigs_hmap[this.unknown_children[i].tx.transaction.sig]) {
          delete this.unknown_children_sigs_hmap[this.unknown_children[i].tx.transaction.sig];
        }
        this.unknown_children.splice(i, 0);
      }
    }

    //
    // tweet is direct child
    //
    if (tweet.parent_id == this.tx.transaction.sig) {

      //
      // already added?
      //
      if (this.children_sigs_hmap[tweet.tx.transaction.sig]) {
        return 0;
      }

      //
      // make critical child if needed
      //
      if (this.isCriticalChild(tweet) || tweet.tx.transaction.ts > this.updated_at && this.critical_child == null) {
        this.critical_child = tweet;
        this.updated_at = tweet.updated_at;
      }

      //
      // prioritize tweet-threads
      //
      if (tweet.tx.transaction.from[0].add === this.tx.transaction.from[0].add) {
        this.children.unshift(tweet);
        this.children_sigs_hmap[tweet.tx.transaction.sig] == 1;
        return 1;
      } else {
        tweet.parent_tweet = this;
        this.children.push(tweet);
        this.children_sigs_hmap[tweet.tx.transaction.sig] == 1;
        return 1;
      }

      //
      // tweet belongs to a child
      //
    } else {

      //
      // maybe it is a critical child
      //
      if (this.isCriticalChild(tweet)) {
        this.critical_child = tweet;
      }

      if (this.children_sigs_hmap[tweet.parent_id]) {

        for (let i = 0; i < this.children.length; i++) {
          if (this.children[i].addTweet(tweet, (levels_deep + 1))) {
            this.children_sigs_hmap[tweet.tx.transaction.sig] = 1;
            this.updated_at = tweet.updated_at;
            return 1;
          }
        }

      } else {

        //
        // if still here, add to unknown children if top-level as we didn't add to any children
        //
        if (levels_deep == 0) {
          this.unknown_children.push(tweet);
          this.unknown_children_sigs_hmap[tweet.tx.transaction.sig] = 1;
        }

      }
    }
  }


  /////////////////////
  // query children  //
  /////////////////////
  hasChildTweet(tweet_sig) {
    if (this.tx.transaction.sig == tweet_sig) { return 1; }
    for (let i = 0; i < this.children.length; i++) {
      if (this.children[i].hasChildTweet(tweet_sig)) { return 1; }
    }
    return 0;
  }
  returnChildTweet(tweet_sig) {
    if (this.tx.transaction.sig == tweet_sig) { return this; }
    for (let i = 0; i < this.children.length; i++) {
      if (this.children[i].hasChildTweet(tweet_sig)) {
        let x = this.returnChildTweet(tweet_sig);
        if (!x) { return x; }
      }
    }
    return null;
  }


  isCriticalChild(tweet) {
    if (tweet.thread_id === this.thread_id) { return false; }
    for (let i = 0; i < tweet.tx.transaction.to.length; i++) {
      if (tweet.tx.transaction.to[i].add === this.app.wallet.returnPublicKey()) {
        if (this.critical_child == null) { return true; }
        if (tweet.tx.transaction.ts > this.critical_child.tx.transaction.tx) {
          return true;
        }
      }
    }
    return false;
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
      if (this.link.indexOf("youtube.com") != -1 || this.link.indexOf("youtu.be") != -1) {
        let videoId = "";

        if (this.link.indexOf("youtu.be") != -1) {
          videoId = (this.link.split("/"));
          videoId = videoId[videoId.length - 1];
        } else {
          let urlParams = new URLSearchParams(link.search);
          videoId = urlParams.get('v');
        }

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


  renderLikes() {
    // some edge cases where tweet won't have rendered
    try {
      let qs = `.tweet-${this.tx.transaction.sig} .tweet-body .tweet-main .tweet-controls .tweet-tool-like .tweet-tool-like-count`;
      let obj = document.querySelector(qs);
      if (obj) {
        if (!this.tx?.optional?.num_likes) { return; }
        obj.innerHTML = this.tx.optional.num_likes;
      }
    } catch (err) { }
  }
  renderRetweets() {
    // some edge cases where tweet won't have rendered
    try {
      let qs = `.tweet-${this.tx.transaction.sig} .tweet-body .tweet-main .tweet-controls .tweet-tool-retweet .tweet-tool-retweet-count`;
      let obj = document.querySelector(qs);
      if (obj) {
        if (!this.tx?.optional?.num_retweets) { return; }
        obj.innerHTML = this.tx.optional.num_retweets;
      }
    } catch (err) { }
  }
  renderReplies() {
    // some edge cases where tweet won't have rendered
    try {
      let qs = `.tweet-${this.tx.transaction.sig} .tweet-body .tweet-main .tweet-controls .tweet-tool-comment .tweet-tool-comment-count`;
      let obj = document.querySelector(qs);
      if (obj) {
        if (!this.tx?.optional?.num_replies) { return; }
        obj.innerHTML = this.tx.optional.num_replies;
      }
    } catch (err) { }
  }


}

module.exports = Tweet;

