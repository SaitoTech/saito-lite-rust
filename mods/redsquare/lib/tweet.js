const saito = require("./../../../lib/saito/saito");
const SaitoUser = require("./../../../lib/saito/ui/saito-user/saito-user");
const TweetTemplate = require("./tweet.template");
const Link = require("./link");
const Image = require("./image");
const Post = require("./post");
const JSON = require("json-bigint");

class Tweet {
  constructor(app, mod, container = "", tx = null) {
    this.app = app;
    this.mod = mod;
    this.container = container;
    this.name = "Tweet";

    this.tx = tx;

    if (!this.tx.optional) {
      this.tx.optional = {};
      this.tx.optional.num_replies = 0;
      this.tx.optional.num_retweets = 0;
      this.tx.optional.num_likes = 0;
    }
    let txmsg = tx.returnMessage();

    this.text = "";
    this.parent_id = "";
    this.thread_id = "";
    this.youtube_id = null;
    this.created_at = this.tx.timestamp;
    this.updated_at = 0;
    this.notice = "";

    //
    // userline will be set to this in template if not specified
    //
    // we specify it to indicate why it is showing up now!
    //
    //  let dt = app.browser.formatDate(tweet.tx.timestamp);
    //  let userline = "posted on " + dt.month + " " + dt.day + ", " + dt.year + " at  " + dt.hours + ":" + dt.minutes;
    //
    this.userline = "";
    //
    //

    this.user = new SaitoUser(
      app,
      mod,
      `.tweet-${this.tx.signature} > .tweet-header`,
      this.tx.from[0].publicKey
    );

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
    this.force_long_tweet = false;
    this.is_long_tweet = false;
    this.is_retweet = false;
    try {
      this.setKeys(txmsg.data);
    } catch (err) {
      console.log("ERROR 1: " + err);
    }
    try {
      this.setKeys(tx.optional);
    } catch (err) {
      console.log("ERROR 2: " + err);
    }

    this.generateTweetProperties(app, mod, 1);

    //
    // create retweet if exists
    //
    if (this.retweet_tx != null) {
      let newtx = new saito.default.transaction();
      newtx.deserialize_from_web(this.app, this.retweet_tx);
      this.retweet = new Tweet(this.app, this.mod, `.tweet-preview-${this.tx.signature}`, newtx);
      this.retweet.is_retweet = true;
      this.retweet.show_controls = 0;
    } else {
      //
      // create image preview
      //
      if (this.images?.length > 0) {
        this.img_preview = new Image(
          this.app,
          this.mod,
          `.tweet-${this.tx.signature} .tweet-body .tweet-main .tweet-preview`,
          this
        );
      } else {
        if (this.link != null) {
          this.link_preview = new Link(
            this.app,
            this.mod,
            `.tweet-${this.tx.signature} .tweet-body .tweet-main .tweet-preview`,
            this
          );
        }
      }
    }
  }

  remove() {
    let eqs = `.tweet-${this.tx.signature}`;
    if (document.querySelector(eqs)) {
      document.querySelector(eqs).remove();
    }
  }

  render(prepend = false) {
    let myqs = `.tweet-${this.tx.signature}`;
    let replace_existing_element = true;
    let replace_nothing = false;
    let has_reply = false;
    let has_reply_disconnected = false;

    //
    // we might be re-rendering when critical child is on screen, so check if the
    // class exists and flag if so
    //
    if (document.querySelector(myqs)) {
      let obj = document.querySelector(myqs);
      if (obj.classList.contains("has-reply")) {
        has_reply = true;
      }
      if (obj.classList.contains("has-reply-disconnected")) {
        has_reply_disconnected = true;
      }
    }

    //
    //
    //
    if (this.updated_at > this.created_at) {
      if (this.num_replies > 0) {
        let dt = this.app.browser.formatDate(this.updated_at);
        this.userline = this.user.notice =
          "new reply on " +
          dt.month +
          " " +
          dt.day +
          ", " +
          dt.year +
          " at  " +
          dt.hours +
          ":" +
          dt.minutes;
      }
    }

    //
    // if prepend = true, remove existing element
    //
    if (prepend == true) {
      let eqs = ".tweet-" + this.tx.signature;
      if (document.querySelector(eqs)) {
        document.querySelector(eqs).remove();
      }
    }

    //
    // retweets displayed in container even if master exists elsewhere on page
    //
    if (this.is_retweet || this.render_solo) {
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

    //
    // retweetsnw without commentary? pass-through and render subtweet
    //
    //
    // this is if i retweet my own tweet
    //
    if (this.text == "" && this.retweet_tx != null) {
      //
      // i am retweeting myself
      //
      this.retweet.notice =
        "retweeted by " + this.app.browser.returnAddressHTML(this.tx.from[0].publicKey);
      this.retweet.container = ".tweet-" + this.retweet.tx.signature;
      let t = this.mod.returnTweet(this.retweet.tx.signature);
      if (t) {
        t.notice = this.retweet.notice;
        t.render(prepend);
      } else {
        this.retweet.render(prepend);
      }
      return;
    }

    //
    // remove if selector does not exist
    // - if we click on a child we rerender but w/o parent just insert in container
    if (this.render_after_selector) {
      if (!document.querySelector(this.render_after_selector)) {
        this.render_after_selector = false;
      }
    }

    if (!this.container || this.container == "") {
      this.container = ".redsquare-appspace-body";
    }

    if (replace_existing_element && document.querySelector(myqs)) {
      this.app.browser.replaceElementBySelector(TweetTemplate(this.app, this.mod, this), myqs);
    } else {
      if (prepend == true) {
        this.app.browser.prependElementToSelector(
          TweetTemplate(this.app, this.mod, this),
          this.container
        );
      } else {
        if (this.render_after_selector) {
          this.app.browser.addElementAfterSelector(
            TweetTemplate(this.app, this.mod, this),
            this.render_after_selector
          );
        } else {
          this.app.browser.addElementToSelector(
            TweetTemplate(this.app, this.mod, this),
            this.container
          );
        }
      }
    }

    //
    // has-reply and has-reply-disconnected
    //
    if (has_reply) {
      let obj = document.querySelector(myqs);
      if (obj) {
        obj.classList.add("has-reply");
      }
    }
    if (has_reply_disconnected) {
      let obj = document.querySelector(myqs);
      if (obj) {
        obj.classList.add("has-reply-disconnected");
      }
    }

    //
    // modify width of any iframe
    //
    if (this.youtube_id != null && this.youtube_id != "null") {
      let tbqs = myqs + " .tweet-body .tweet-main";
      let ytqs = myqs + " .tweet-body .tweet-main .youtube-embed";
      if (document.querySelector(tbqs)) {
        let x = document.querySelector(tbqs).getBoundingClientRect();
        let y = document.querySelector(ytqs);
        if (x) {
          if (y) {
            y.style.width = Math.floor(x.width) + "px";
            y.style.height = Math.floor((x.width / 16) * 9) + "px";
          }
        }
      }
    }

    //
    // render user
    //
    if (this.userline == "") {
      let dt = this.app.browser.formatDate(this.tx.timestamp);
      this.userline =
        "posted on " +
        dt.month +
        " " +
        dt.day +
        ", " +
        dt.year +
        " at  " +
        dt.hours +
        ":" +
        dt.minutes;
      this.user.notice = this.userline;
    }
    this.user.render();

    if (this.retweet != null) {
      this.retweet.render();
    }
    if (this.img_preview != null) {
      this.img_preview.render();
    }
    if (this.link_preview != null) {
      if (this.link_properties != null) {
        if (Object.keys(this.link_properties).length > 0) {
          this.link_preview.render();
        }
      }
    }

    this.attachEvents();
  }

  renderWithCriticalChild(prepend = false) {
    if (this.critical_child) {
      let dt = this.app.browser.formatDate(this.updated_at);
      this.userline = this.user.notice =
        "new reply on " +
        dt.month +
        " " +
        dt.day +
        ", " +
        dt.year +
        " at  " +
        dt.hours +
        ":" +
        dt.minutes;
    }

    this.render(prepend);

    if (this.critical_child) {
      this.critical_child.render_after_selector = ".tweet-" + this.tx.signature;
      this.critical_child.render();

      let myqs = `.tweet-${this.tx.signature}`;
      let obj = document.querySelector(myqs);
      if (obj) {
        if (this.critical_child.parent_id == this.tx.signature) {
          obj.classList.add("has-reply");
        } else {
          obj.classList.add("has-reply-disconnected");
        }
      }
    }

    this.attachEvents();
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
      if (
        this.children[0].tx.from[0].publicKey === this.tx.from[0].publicKey ||
        this.children.length == 1
      ) {
        if (this.children[0].children.length > 0) {
          this.children[0].container = this.container;
          this.children[0].renderWithChildren();
        } else {
          for (let i = 0; i < this.children.length; i++) {
            this.children[i].container = this.container;
            this.children[i].render_after_selector = `.tweet-${this.tx.signature}`;
            this.children[i].render();
          }
        }
      } else {
        for (let i = 0; i < this.children.length; i++) {
          this.children[i].container = this.container;
          this.children[i].render_after_selector = `.tweet-${this.tx.signature}`;
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

    //then render its children
    if (this.children.length > 0) {
      if (
        this.children[0].tx.from[0].publicKey === this.tx.from[0].publicKey ||
        this.children.length == 1
      ) {
        if (this.children[0].children.length > 0) {
          this.children[0].container = this.container;
          this.children[0].render_after_selector = `.tweet-${this.tx.signature}`;
          this.children[0].renderWithChildren();
        } else {
          for (let i = 0; i < this.children.length; i++) {
            this.children[i].container = this.container;
            this.children[i].render_after_selector = `.tweet-${this.tx.signature}`;
            this.children[i].render();
          }
        }
      } else {
        for (let i = 0; i < this.children.length; i++) {
          this.children[i].container = this.container;
          this.children[i].render_after_selector = `.tweet-${this.tx.signature}`;
          this.children[i].render();
        }
      }
    }
    this.attachEvents();
  }

  attachEvents() {
    let mod = this.mod;
    let app = this.app;

    if (this.show_controls == 0) {
      return;
    }

    try {
      //
      // tweet does not exist? exit
      //
      let this_tweet = document.querySelector(`.tweet-${this.tx.signature}`);
      if (!this_tweet) {
        return;
      }

      /////////////////////////////
      // Expand / Contract Tweet //
      /////////////////////////////
      //
      // if you don't want a tweet to auto-contract on display, set this.is_long_tweet
      // to be true before running attachEvents(); this will avoid it getting compressed
      // with full / preview toggle.
      //
      let el = document.querySelector(
        `.tweet-${this.tx.signature} .tweet-body .tweet-main .tweet-text`
      );
      if (!el) {
        return;
      }
      if (!this.force_long_tweet) {
        if (el.clientHeight < el.scrollHeight) {
          el.classList.add("preview");
          this.is_long_tweet = true;
        } else {
          el.classList.add("full");
        }
      } else {
        el.classList.add("full");
      }

      /////////////////
      // view thread //
      /////////////////
      if (!this_tweet.dataset.hasClickEvent) {
        this_tweet.dataset.hasClickEvent = true;
        this_tweet.onclick = (e) => {
          //
          // if we have selected text, then we are trying to copy and paste and
          // the last thing we want is for the UI to update and prevent us from
          // being able to use the site.
          //
          let highlightedText = "";
          if (window.getSelection) {
            highlightedText = window.getSelection().toString();
          } else if (document.selection && document.selection.type != "Control") {
            highlightedText = document.selection.createRange().text;
          }
          if (highlightedText != "") {
            console.log("text highlighted: exiting");
            return;
          }

          let tweet_text = document.querySelector(
            `.tweet-${this.tx.signature} > .tweet-body > .tweet-main > .tweet-text`
          );

          if (this.is_long_tweet) {
            if (!tweet_text.classList.contains("full")) {
              tweet_text.classList.remove("preview");
              tweet_text.classList.add("full");
              this.force_long_tweet = true;
            } else {
              if (e.target.tagName != "IMG") {
                if (this.force_long_tweet) {
                  tweet_text.classList.remove("preview");
                  tweet_text.classList.add("full");
                }
                window.history.pushState(null, "", `/redsquare/?tweet_id=${this.tx.signature}`);
                let sig = this.tx.signature;
                app.connection.emit("redsquare-home-tweet-render-request", this);
                app.connection.emit("redsquare-home-loader-render-request");
                mod.loadChildrenOfTweet(sig, (tweets) => {
                  app.connection.emit("redsquare-home-loader-hide-request");
                  for (let i = 0; i < tweets.length; i++) {
                    app.connection.emit("redsquare-home-tweet-append-render-request", tweets[i]);
                  }
                });
              }
            }
            return;
          }

          //
          // if we are asking to see a tweet, load from parent if exists
          //
          if (e.target.tagName != "IMG") {
            window.history.pushState(null, "", `/redsquare/?tweet_id=${this.tx.signature}`);
            let sig = this.tx.signature;
            app.connection.emit("redsquare-home-tweet-render-request", this);
            app.connection.emit("redsquare-home-loader-render-request");
            mod.loadChildrenOfTweet(sig, (tweets) => {
              app.connection.emit("redsquare-home-loader-hide-request");
              for (let i = 0; i < tweets.length; i++) {
                app.connection.emit("redsquare-home-tweet-append-render-request", tweets[i]);
              }
            });
          }
        };
      }

      //////////////////
      // view preview //
      //////////////////
      document.querySelectorAll(`.tweet-${this.tx.signature} .tweet`).forEach((item) => {
        item.addEventListener("click", (e) => {
          e.stopImmediatePropagation();
          let sig = item.getAttribute("data-id");
          if (e.target.tagName != "IMG" && sig) {
            window.location.href = `/redsquare/?tweet_id=${sig}`;
          }
        });
      });

      ///////////
      // reply //
      ///////////
      document.querySelector(
        `.tweet-${this.tx.signature} .tweet-body .tweet-main .tweet-controls .tweet-tool-comment`
      ).onclick = (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();

        let tweet_sig = this.tx.signature;
        if (tweet_sig != null) {
          let post = new Post(this.app, this.mod, this);
          post.parent_id = tweet_sig;
          post.thread_id = this.thread_id;
          if (this.thread_id == "") {
            post.thread_id = tweet_sig;
          }
          post.source = "Reply";
          post.render();
          this.app.browser.prependElementToSelector(
            `<div id="post-tweet-preview-${tweet_sig}" class="post-tweet-preview" data-id="${tweet_sig}"></div>`,
            ".tweet-overlay"
          );

          let newtx = new saito.default.transaction(
            undefined,
            JSON.parse(JSON.stringify(this.tx.toJson()))
          );
          newtx.signature = this.app.crypto.hash(newtx.signature);
          let new_tweet = new Tweet(this.app, this.mod, `#post-tweet-preview-${tweet_sig}`, newtx);
          new_tweet.show_controls = 0;
          new_tweet.render();
        }
      };

      /////////////
      // retweet //
      /////////////
      document.querySelector(
        `.tweet-${this.tx.transaction.sig} .tweet-body .tweet-main .tweet-controls .tweet-tool-retweet`
      ).onclick = (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();

        let tweet_sig =
          e.currentTarget.parentNode.parentNode.parentNode.parentNode.getAttribute("data-id");
        if (tweet_sig != null) {
          let post = new Post(this.app, this.mod, this);
          //
          // retweets do not have parent_id -- new thread
          //
          //post.parent_id = tweet_sig;
          post.source = "Retweet";
          post.render();
          this.app.browser.prependElementToSelector(
            `<div id="post-tweet-preview-${tweet_sig}" class="post-tweet-preview" data-id="${tweet_sig}"></div>`,
            ".tweet-overlay"
          );

          let newtx = new saito.default.transaction(
            undefined,
            JSON.parse(JSON.stringify(this.tx.toJson()))
          );
          newtx.signature = this.app.crypto.hash(newtx.signature);
          let new_tweet = new Tweet(this.app, this.mod, `#post-tweet-preview-${tweet_sig}`, newtx);
          new_tweet.show_controls = 0;
          new_tweet.render();
        }
      };

      //////////
      // like //
      //////////
      const heartIcon = document.querySelector(
        `.tweet-${this.tx.signature} .tweet-like-button .heart-icon`
      );
      heartIcon.onclick = (e) => {
        if (heartIcon.classList.contains("liked")) {
          heartIcon.classList.remove("liked");
          setTimeout(() => {
            heartIcon.classList.add("liked");
          });
        } else {
          heartIcon.classList.add("liked");
        }

        e.preventDefault();
        e.stopImmediatePropagation();

        let tweet_sig =
          e.currentTarget.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.getAttribute(
            "data-id"
          );
        if (tweet_sig != null) {
          this.mod.sendLikeTransaction(this.app, this.mod, { sig: tweet_sig }, this.tx);

          //
          // increase num likes
          //
          let obj = document.querySelector(
            `.tweet-${tweet_sig} .tweet-body .tweet-main .tweet-controls .tweet-tool-like .tweet-tool-like-count`
          );
          obj.innerHTML = parseInt(obj.innerHTML) + 1;
          if (obj.parentNode.classList.contains("saito-tweet-no-activity")) {
            obj.parentNode.classList.remove("saito-tweet-no-activity");
            obj.parentNode.classList.add("saito-tweet-activity");
          }
        }
      };

      ///////////
      // share //
      ///////////
      document.querySelector(
        `.tweet-${this.tx.signature} .tweet-body .tweet-main .tweet-controls .tweet-tool-share`
      ).onclick = (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();

        let tweet_sig =
          e.currentTarget.parentNode.parentNode.parentNode.parentNode.getAttribute("data-id");
        if (tweet_sig != null) {
          let tweetUrl =
            window.location.origin + window.location.pathname + "?tweet_id=" + tweet_sig;
          navigator.clipboard.writeText(tweetUrl).then(() => {
            siteMessage("Link copied to clipboard.", 2000);
          });
        }
      };

      //////////
      // flag //
      //////////
      document.querySelector(
        `.tweet-${this.tx.signature} .tweet-body .tweet-main .tweet-controls .tweet-tool-flag`
      ).onclick = (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();

        let tweet_sig =
          e.currentTarget.parentNode.parentNode.parentNode.parentNode.getAttribute("data-id");
        if (tweet_sig != null) {
          this.mod.sendFlagTransaction(this.app, this.mod, { sig: tweet_sig }, this.tx);
          let obj = document.querySelector(`.tweet-flag-${tweet_sig}`);
          if (obj) {
            obj.classList.add("saito-tweet-activity");
          }
          obj = document.querySelector(`.tweet-${tweet_sig}`);
          if (obj) {
            obj.style.display = "none";
          }
          salert("Tweet reported to moderators successfully.");
        }
      };
    } catch (err) {
      console.log("ERROR attaching events to tweet: " + err);
    }
  }

  setKeys(obj) {
    for (let key in obj) {
      if (typeof obj[key] !== "undefined") {
        if (
          this[key] === 0 ||
          this[key] === "" ||
          this[key] === null ||
          typeof this[key] === "undefined"
        ) {
          this[key] = obj[key];
        }
      }
    }
  }

  addTweet(tweet, levels_deep = 0) {
    //
    // this means we know the comment is supposed to be somewhere in this thread/parent
    // but its own parent doesn't yet exist, so we are simply going to store it here
    // until we possibly add the parent (where we will check all unknown children) for
    // placement then.
    //
    this.unknown_children.push(tweet);
    this.unknown_children_sigs_hmap[tweet.tx.signature] = 1;
    //
    // make this UNKNOWN tweet our critical child if we do not have any critical children
    //
    if (this.critical_child == null) {
      this.critical_child = tweet;
      if (tweet.created_at > this.updated_at) {
        //
        // April 14, 2023 - do not show critical children unless 2nd level
        //
        //this.updated_at = tweet.created_at;
        let dt = this.app.browser.formatDate(this.updated_at);
        this.user.notice = this.userline =
          "new reply on " +
          dt.month +
          " " +
          dt.day +
          ", " +
          dt.year +
          " at  " +
          dt.hours +
          ":" +
          dt.minutes;
        this.user.render();
      }
    }

    //
    // if this tweet is the parent-tweet of a tweet we have already downloaded
    // and indexed here. this can happen if tweets arrive out-of-order.
    //
    for (let i = 0; i < this.unknown_children.length; i++) {
      if (this.unknown_children[i].parent_id === tweet.tx.signature) {
        if (this.isCriticalChild(this.unknown_children[i])) {
          this.critical_child = this.unknown_children[i];
          //
          // April 14, 2023 - do not show critical children unless 2nd level
          // - since we are adding a child, we do a levels check on OURSELVERS
          //
          if (levels_deep == 0) {
            this.updated_at = this.critical_child.updated_at;
          }

          let dt = app.browser.formatDate(this.updated_at);
          if (this.userline == "") {
            this.user.notice = this.userline =
              "new reply on " +
              dt.month +
              " " +
              dt.day +
              ", " +
              dt.year +
              " at  " +
              dt.hours +
              ":" +
              dt.minutes;
          }
        }
        this.unknown_children[i].parent_tweet = tweet;

        //
        // tweet adds its orphan
        //
        tweet.addTweet(this.unknown_children[i], levels_deep + 1);

        //
        // and delete from unknown children
        //
        this.removeUnknownChild(this.unknown_children[i]);
      }
    }

    //
    // tweet is direct child
    //
    if (tweet.parent_id == this.tx.signature) {
      //
      // already added?
      //
      if (this.children_sigs_hmap[tweet.tx.signature]) {
        return 0;
      }

      //
      // make critical child if needed
      //
      if (
        this.isCriticalChild(tweet) ||
        (tweet.tx.timestamp > this.updated_at && this.critical_child == null)
      ) {
        this.critical_child = tweet;
        //
        // April 14, 2023 - do not show critical children unless 2nd level
        // - since we are adding a child, we do a levels check on OURSELVERS
        //
        if (levels_deep == 0) {
          if (tweet.created_at > this.updated_at) {
            this.updated_at = tweet.created_at;
          }
        }
        let dt = app.browser.formatDate(this.updated_at);
        if (this.userline == "") {
          this.userline =
            "new reply on " +
            dt.month +
            " " +
            dt.day +
            ", " +
            dt.year +
            " at  " +
            dt.hours +
            ":" +
            dt.minutes;
          this.user.notice = this.userline;
        }
      }

      //
      // prioritize tweet-threads
      //
      if (tweet.tx.from[0].publicKey === this.tx.from[0].publicKey) {
        this.children.unshift(tweet);
        this.children_sigs_hmap[tweet.tx.signature] == 1;
        this.removeUnknownChild(tweet);
        return 1;
      } else {
        tweet.parent_tweet = this;
        this.children.push(tweet);
        this.children_sigs_hmap[tweet.tx.signature] == 1;
        this.removeUnknownChild(tweet);
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
        //
        // April 14, 2023 - do not show critical children unless 2nd level
        // - since we are adding a child, we do a levels check on OURSELVERS
        //
        if (levels_deep == 0) {
          if (tweet.created_at > this.updated_at) {
            this.updated_at = tweet.created_at;
          }
        }
        let dt = app.browser.formatDate(this.updated_at);
        if (this.userline == "") {
          this.userline =
            "new reply on " +
            dt.month +
            " " +
            dt.day +
            ", " +
            dt.year +
            " at  " +
            dt.hours +
            ":" +
            dt.minutes;
          this.user.notice = this.userline;
        }
      }

      if (this.children_sigs_hmap[tweet.parent_id]) {
        for (let i = 0; i < this.children.length; i++) {
          if (this.children[i].addTweet(tweet, levels_deep + 1)) {
            this.removeUnknownChild(tweet);
            this.children_sigs_hmap[tweet.tx.signature] = 1;
            //
            // April 14, 2023 - do not show critical children unless 2nd level
            // - since we are adding a child, we do a levels check on OURSELVERS
            //
            if (levels_deep == 0) {
              this.updated_at = tweet.updated_at;
              if (tweet.created_at > this.updated_at) {
                this.updated_at = tweet.created_at;
              }
            }
            let dt = app.browser.formatDate(this.updated_at);
            if (this.userline == "") {
              this.userline =
                "new reply on " +
                dt.month +
                " " +
                dt.day +
                ", " +
                dt.year +
                " at  " +
                dt.hours +
                ":" +
                dt.minutes;
              this.user.notice = this.userline;
            }
            return 1;
          }
        }
      } else {
        //
        // if still here, add to unknown children if top-level as we didn't add to any children
        //
        if (levels_deep == 0) {
          if (this.unknown_children_sigs_hmap[tweet.tx.signature] != 1) {
            this.unknown_children.push(tweet);
            this.unknown_children_sigs_hmap[tweet.tx.signature] = 1;
          }
        }
      }
    }
  }

  /////////////////////
  // query children  //
  /////////////////////
  hasChildTweet(tweet_sig) {
    if (this.tx.signature == tweet_sig) {
      return 1;
    }
    for (let i = 0; i < this.children.length; i++) {
      if (this.children[i].hasChildTweet(tweet_sig)) {
        return 1;
      }
    }
    return 0;
  }

  returnChildTweet(tweet_sig) {
    if (this.tx.signature == tweet_sig) {
      return this;
    }
    for (let i = 0; i < this.children.length; i++) {
      if (this.children[i].hasChildTweet(tweet_sig)) {
        return this.children[i].returnChildTweet(tweet_sig);
      }
    }
    return null;
  }

  removeUnknownChild(tweet) {
    if (this.unknown_children_sigs_hmap[tweet.tx.signature] == 1) {
      for (let i = 0; i < this.unknown_children.length; i++) {
        if (this.unknown_children[i].tx.signature === tweet.tx.signature) {
          this.unknown_children.splice(i, 0);
          delete this.unknown_children_sigs_hmap[tweet.tx.signature];
        }
      }
    }
  }

  async isCriticalChild(tweet) {
    //
    // TODO -- changed comparison to !== March 13, right?
    //
    if (tweet.thread_id !== this.thread_id) {
      return false;
    }
    for (let i = 0; i < tweet.tx.to.length; i++) {
      if (tweet.tx.to[i].publicKey === (await this.app.wallet.getPublicKey())) {
        if (this.critical_child == null) {
          return true;
        }
        if (tweet.tx.timestamp > this.critical_child.tx.transaction.tx) {
          return true;
        }
      }
    }
    return false;
  }

  async generateTweetProperties(app, mod, fetch_open_graph = 0) {
    if (this.text == null) {
      return this;
    }

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
          videoId = this.link.split("/");
          videoId = videoId[videoId.length - 1];
        } else {
          let urlParams = new URLSearchParams(link.search);
          videoId = urlParams.get("v");
        }

        if (videoId != null && videoId != "null") {
          this.youtube_id = videoId;
        }
        return this;
      }

      //
      // normal link
      //
      if (fetch_open_graph == 1) {
        let res = await mod.fetchOpenGraphProperties(app, mod, this.link);
        if (res != "") {
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
      let qs = `.tweet-${this.tx.signature} .tweet-body .tweet-main .tweet-controls .tweet-tool-like .tweet-tool-like-count`;
      let obj = document.querySelector(qs);
      if (obj) {
        if (!this.tx?.optional?.num_likes) {
          return;
        }
        obj.innerHTML = this.tx.optional.num_likes;
      }
    } catch (err) {}
  }

  renderRetweets() {
    // some edge cases where tweet won't have rendered
    try {
      let qs = `.tweet-${this.tx.signature} .tweet-body .tweet-main .tweet-controls .tweet-tool-retweet .tweet-tool-retweet-count`;
      let obj = document.querySelector(qs);
      if (obj) {
        if (!this.tx?.optional?.num_retweets) {
          return;
        }
        obj.innerHTML = this.tx.optional.num_retweets;
      }
    } catch (err) {}
  }

  renderReplies() {
    // some edge cases where tweet won't have rendered
    try {
      let qs = `.tweet-${this.tx.signature} .tweet-body .tweet-main .tweet-controls .tweet-tool-comment .tweet-tool-comment-count`;
      let obj = document.querySelector(qs);
      if (obj) {
        if (!this.tx?.optional?.num_replies) {
          return;
        }
        obj.innerHTML = this.tx.optional.num_replies;
      }
    } catch (err) {}
  }
}

module.exports = Tweet;
