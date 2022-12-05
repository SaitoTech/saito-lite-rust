const saito = require("./../../lib/saito/saito");
const redsquareHome = require("./index");
const InviteTemplate = require('../../lib/templates/invitetemplate');
const ModTemplate = require('../../lib/templates/modtemplate');
const SaitoHeader = require('../../lib/saito/new-ui/saito-header/saito-header');
const SaitoMobileBar = require('../../lib/saito/new-ui/saito-mobile-bar/saito-mobile-bar')
const RedSquareMain = require('./lib/main');
const Tweet = require('./lib/tweet');
const JSON = require("json-bigint");
const fetch = require('node-fetch');
const HTMLParser = require('node-html-parser');
const prettify = require('html-prettify');
const SaitoLoader = require("../../lib/saito/new-ui/saito-loader/saito-loader");
const PostTweet = require("./lib/post");
const { convertCompilerOptionsFromJson } = require("typescript");
//const { displace } = require("jimp/types");

class RedSquare extends ModTemplate {

  constructor(app) {

    super(app);
    this.appname = "Red Square";
    this.name = "RedSquare";
    this.slug = "redsquare";
    this.description = "Open Source Twitter-clone for the Saito Network";
    this.categories = "Social Entertainment";
    this.saito_loader = new SaitoLoader(app, this);
    this.redsquare = {}; // where settings go, saved to options file

    this.sqlcache_enabled = 1;

    this.txmap = {}; // associative array sigs => txs
    this.tweets = [];
    this.newTweets = []; // tmp holder for new tweets before renering
    this.ntfs = []; // notifications, the notifications panel is attached under the full name by subcomponent
    this.ntfs_num = 0;
    this.max_ntfs_num = 50
    this.ntfs_counter = {}
    // "main" or sig if viewing page-specific
    this.viewing = "feed";


    this.last_viewed_notifications_ts = 0;
    this.unviewed_notifications = 0;

    this.results_per_page = 10;
    this.page_number = 1;

    this.styles = [
      '/saito/saito.css',
      '/redsquare/css/redsquare-main.css',
    ];
    this.ui_initialized = false;

    this.allowed_upload_types = ['image/png', 'image/jpg', 'image/jpeg'];
    this.icon_fa = "fas fa-square-full";

    this.social = {
      twitter_card: "summary",
      twitter_site: "@SaitoOfficial",
      twitter_creator: "@SaitoOfficial",
      twitter_title: "🟥 Saito Red Square",
      twitter_url: "https://saito.io/redsquare/",
      twitter_description: "Saito RedSquare - Web3 Social.",
      twitter_image: "https://saito.tech/wp-content/uploads/2022/04/saito_card_horizontal.png",
      og_title: "🟥 Saito Red Square",
      og_url: "https://saito.io/redsquare",
      og_type: "website",
      og_description: "Peer to peer social and more",
      og_site_name: "🟥 Saito Red Square",
      og_image: "https://saito.tech/wp-content/uploads/2022/04/saito_card_horizontal.png",
      og_image_url: "https://saito.tech/wp-content/uploads/2022/04/saito_card_horizontal.png",
      og_image_secure_url: "https://saito.tech/wp-content/uploads/2022/04/saito_card_horizontal.png"
    }
    console.log(this.social.twitter_card);

    return this;

  }


  initialize(app) {
    this.loadRedSquare();
    super.initialize(app);

    if (app.BROWSER === 1) {

      let tweet_id = app.browser.returnURLParameter('tweet_id');
      let user_id = app.browser.returnURLParameter('user_id');

      if (tweet_id != "") {
        this.viewing = tweet_id;
        this.mode = "tweet";
      }

      if (user_id != "") {
        this.viewing = user_id;
        this.mode = "user";
      }


      if (this.browser_active == 1) {
        //Leave a cookie trail to return to Redsquare when you enter a game
        if (app.options.homeModule !== this.returnSlug()) {
          console.log("Update homepage to " + this.returnSlug());
          app.options.homeModule = this.returnSlug();
          app.storage.saveOptions();
        }

        //
        // this is a hack to refresh the game invite sidebar if we are returning to the page after
        // it has been dormant for a while
        //
        document.addEventListener("visibilitychange", () => {
          if (!document.hidden) {
            app.connection.emit("game-invite-list-update");
          }
        });

      }

      let redsquare_self = this;

      if (this.app.BROWSER == 1 && this.browser_active == 1) {

        let tweet_timeout = 20000 + (Math.random() * 5000);
        let stats_timeout = 20000 + (Math.random() * 10000);

        setInterval(function () {
          if (redsquare_self.viewing == "feed") {
            redsquare_self.fetchNewTweets(app, redsquare_self);
          }
        }, tweet_timeout);

        setInterval(function () {
          if (redsquare_self.viewing == "feed") {
            redsquare_self.fetchStatsUpdate(app, redsquare_self);
          }
        }, stats_timeout);
      }
    }
  }

  //
  // Easy Navigation from Arcade (with old saito/ui) to RedSquare
  //
  respondTo(type) {
    if (type == 'header-dropdown') {
      return {
        name: this.appname ? this.appname : this.name,
        icon_fa: this.icon_fa,
        browser_active: this.browser_active,
        slug: this.returnSlug()
      };
    }
    if (type === 'user-menu') {
      return {
        text: "View Profile",
        icon: "fa-regular fa-user",
        callback: function (app, publickey) {
          app.connection.emit('redquare-show-user-feed', publickey);
        }
      }
    }

    if (type === 'user_menu') {
      return {
        text: "View Profile",
        icon: "fa-regular fa-user",
        callback: function (app, public_key) {
          app.connection.emit('redquare-show-user-feed', public_key);
        }
      }
    }

    return super.respondTo(type);

  }

  tweetImage(image, render_after_submit = 0) {
    try {
      let post = new PostTweet(this.app, this);
      post.render_after_submit = render_after_submit;
      post.render(this.app, this);
      post.resizeImg(image, 0.75, 0.75);
    } catch (err) {
    }
  }


  addNotification(app, mod, tx) {
    if (tx.transaction.from[0].add === app.wallet.returnPublicKey()) {
      return;
    }
    if (tx.transaction.ts > this.last_viewed_notifications_ts) {
      this.unviewed_notifications++;
      this.app.connection.emit("redsquare-menu-notification-request", { menu: "notifications", num: this.unviewed_notifications });
    }
    if (this.ntfs.length == 0) {
      this.ntfs.push(tx);
      return;
    }
    for (let i = 0; i < this.ntfs.length; i++) {
      if (this.ntfs[i].transaction.ts < tx.transaction.ts) {
        this.ntfs.splice(i, 0, tx);
        return;
      }
    }
    this.ntfs.push(tx);
  }


  returnTweet(app, mod, sig) {
    for (let i = 0; i < this.tweets.length; i++) {
      let r = this.tweets[i].returnTweet(app, mod, sig);
      if (r != null) { return r; }
    }
    return null;
  }

  //
  // this is called if we have a tweet but suspect that the content in
  // the tweet is out-of-date. it can happen if we have an empty retweet
  // and need to get the comments and share info for the original if possible
  //
  fetchAndUpdateTweetOptionalContent(tweet) {

    let sql = `SELECT * FROM tweets WHERE sig = "${tweet.tx.transaction.sig}"`;
    let mod = this;
    let app = this.app;
    this.fetchTweets(app, mod, sql, function (app, mod) {
      console.log("we have fetched and updated the tweet.");
    });

  }


  addTweet(app, mod, tweet, prepend = 0) {

    //
    // if the tweet is an empty retweet, search for this tweet if it already exists
    // and mark it up with the notice we have provided. or add the subtweet directly
    // and indicate that we have retweeted. this only applies to tweets that lack
    // commentary, in which case we want to highlight the original message.
    //
    if (tweet.text == "" && tweet.retweet_tx != "") {
      let t = tweet.retweet;
      if (t != null) {
        t.notice = "retweeted by " + app.browser.returnAddressHTML(tweet.sender);
        t.retweeters.push(tweet.sender);
        this.addTweet(app, mod, t);
        this.fetchAndUpdateTweetOptionalContent(t);
      }
      return;
    }


    //
    // post-level
    //
    if (tweet.parent_id === "" || (tweet.parent_id === tweet.thread_id && tweet.parent_id === tweet.tx.transaction.sig)) {
      let new_tweet = 1;
      for (let i = 0; i < this.tweets.length; i++) {
        if (this.tweets[i].tx.transaction.sig === tweet.tx.transaction.sig) {
          new_tweet = 0;
        }
      }
      if (new_tweet == 1) {
        let insertion_index = 0;
        for (let i = 0; i < this.tweets.length; i++) {
          if (this.tweets[i].updated_at > tweet.updated_at) {
            insertion_index++;
            break;
          } else {
            insertion_index++;
          }
        }

        if (prepend == 0) {
          this.tweets.splice(insertion_index, 0, tweet);
        } else {
          this.tweets.splice(0, 0, tweet);
        }
        this.txmap[tweet.tx.transaction.sig] = 1;
      } else {

        for (let i = 0; i < this.tweets.length; i++) {
          if (this.tweets[i].tx.transaction.sig === tweet.tx.transaction.sig) {

            this.tweets[i].num_replies = tweet.num_replies;
            this.tweets[i].num_retweets = tweet.num_retweets;
            this.tweets[i].num_likes = tweet.num_likes;
            this.tweets[i].renderOptional();
          }
        }


      }
      //
      // comment-level
      //
    } else {
      for (let i = 0; i < this.tweets.length; i++) {
        if (this.tweets[i].tx.transaction.sig === tweet.thread_id) {
          if (this.tweets[i].addTweet(app, mod, tweet) == 1) {
            // we've added, stop adding
            this.txmap[tweet.tx.transaction.sig] = 1;
            break;
          }
        }
      }
    }
  }

  addTweetAndBroadcastRenderRequest(app, mod, tweet, updateTweet = false) {

    //
    // post-level
    //
    if (tweet.parent_id === "" || (tweet.parent_id === tweet.thread_id && tweet.parent_id === tweet.tx.transaction.sig)) {

      let new_tweet = 1;
      for (let i = 0; i < this.tweets.length; i++) {
        if (this.tweets[i].tx.transaction.sig === tweet.tx.transaction.sig) {
          new_tweet = 0;
        }
      }
      if (new_tweet == 1) {
        let insertion_index = 0;
        for (let i = 0; i < this.tweets.length; i++) {
          if ((this.tweets[i].updated_at < tweet.updated_at))
            this.tweets.splice(i, 0, tweet);
          break;
        }
        // newTweet value is inverted as the render function defaults to
        // appending tweets to the list, we want to prepend new ones.
        mod.app.connection.emit('tweet-render-request', tweet, !updateTweet);
      }
      //
      // comment-level
      //
    } else {

      for (let i = 0; i < this.tweets.length; i++) {
        if (this.tweets[i].tx.transaction.sig === tweet.thread_id) {
          if (this.tweets[i].addTweet(app, mod, tweet) == 1) {
            // we've added, stop adding
            mod.app.connection.emit('tweet-render-request', tweet);
            break;
          }
        }
      }

    }
  }

  addTweetAndBroadcastRenderFamilyRequest(app, mod, tweet, updateTweet = false) {

    let tmp = [];

    // remove tweets from thread and add to tmp
    for (let i = 0; i < this.tweets.length; i++) {
      if (this.tweets[i].thread_id == tweet.thread_id) {
        tmp.push(this.tweets[i]);
        this.tweets.splice(i, 1);
      }
    };

    tmp.push(tweet);

    if (tmp.length > 0) {
      // update updated times to now.
      let ts = new Date().getTime();
      tmp.forEach(twt => {
        twt.updated_at = ts;
      });

      //order thread for display
      thread = [];

      //move tweets from tmp to thread in order
      let h = tmp.length;
      while (h > 0) {
        var action = 0;
        //find the root
        for (let i = 0; i < tmp.length; i++) {
          if (tmp[i].tx.transaction.sig == tmp[i].parent_id) {
            thread.push(tmp[i]);
            tmp.splice(i, 1);
            h = tmp.length;
            action++
            break;
          }
          //add all the branches
          for (let j = 0; j < thread.length; j++) {
            if (thread[j].parent_id == tmp[i].parent_id) {
              if (thread[j].created_at < tmp[i].created_at) {
                thread.splice(j, 0, tmp[i]);
                tmp.splice(i, 1);
                h = tmp.length;
                action++;
                break;
              }
            }
          }
        }
        if (action == 0) {
          h = -1;
          break;
        }
      }

      thread.forEach(twt => {
        console.log(twt.created_at + " - " + twt.updated_at + " - " + twt.parent_id)
      })

      thread.reverse();

      //add to this.tweets
      this.tweets = thread.concat(this.tweets);

      //call for a general render
      mod.app.connection.emit('tweet-render-feed-request');
      //mod.app.connection.emit('tweet-render-request', tweet, !updateTweet);

    } else {
      mod.app.connection.emit('tweet-render-request', tweet, !updateTweet);
    }

  }

  prependTweetFromTransaction(app, mod, tx, tracktweet = false) {
    let tweet = new Tweet(app, this, tx);
    if (tracktweet) {
      this.trackTweet(app, mod, tweet)
    }
    this.addTweet(app, this, tweet, 1);
    this.txmap[tx.transaction.sig] = 1;

    if (this.viewing == "feed") {
      // this.renderMainPage(app, mod);
      app.connection.emit('tweet-render-request', tweet, false);
    } else {
      app.connection.emit('tweet-render-request', tweet, false);
    }
  }
  addTweetFromTransaction(app, mod, tx, tracktweet = false) {
    let tweet = new Tweet(app, this, tx);



    this.addTweet(app, this, tweet);
    this.txmap[tx.transaction.sig] = 1;
  }


  reorganizeTweets(app, mod, promote_images = true) {
    if (promote_images) {
      this.orderTweetsMovePictureIntoView(app, mod);
    } else {
      this.orderTweetsByTime(app, mod);
    }
    return;
  }

  orderTweetsByTime(app, mod) {
    this.tweets.sort(function compare(a, b) {
      if (a.returnWeightedTime() > b.returnWeightedTime) {
        return -1;
      } else {
        return 1;
      }
      return 0;
    });
  }

  orderTweetsMovePictureIntoView(app, mod) {
    //reorder tweets with an image up the list by increaing amounts till one with an image shows in the top three
    if (this.tweets.length > 2) {
      let inc = 36000;
      while (inc < 172800000) {
        this.tweets.sort(function compare(a, b) {
          if (a.returnWeightedTime() + (a.has_image * inc) > b.returnWeightedTime()) {
            return -1;
          } else {
            return 1;
          }
          return 0;
        });
        if (this.tweets[0].has_image || this.tweets[1].has_image || this.tweets[2].has_image) {
          return;
        }
        inc = Math.floor(inc * 1.33);
      }
    }
  }




  initializeHTML(app) {
    this.saito_loader.render(app, this, '', true);
  }

  render(app, mod) {

    if (this.ui_initialized == false) {
      this.main = new RedSquareMain(this.app, this);
      this.header = new SaitoHeader(this.app, this);
      this.mobileBar = new SaitoMobileBar(this.app, this);
      this.addComponent(this.main);
      this.addComponent(this.header);
      this.addComponent(this.mobileBar);
      this.ui_initialized = true;
    }

    super.render(app, this);
    if (mod) {
      mod.saito_loader.remove(app, mod);
    }

  }


  renderMainPage(app, mod, promote_images = false) {
    this.reorganizeTweets(app, mod, promote_images);
    console.log(mod.viewing, "viewing");
    document.querySelector(".redsquare-list").innerHTML = "";
    for (let i = 0; i < this.tweets.length; i++) {
      this.tweets[i].render(app, mod, ".redsquare-list");
    }
    // app.browser.addIdentifiersToDom();
  }

  renderMainFeed(app, mod) {
    //console.log("redsquare innerHTML");
    document.querySelector(".redsquare-list").innerHTML = "";
    for (let i = 0; i < this.tweets.length; i++) {
      this.tweets[i].render(app, mod, ".redsquare-list");
    }
    // app.browser.addIdentifiersToDom();
  }


  //
  // render with children, but loads if not parent (used for retweets)
  //
  renderParentWithChildren(app, mod, sig) {
    //this.viewing = sig;
    //this.reorganizeTweets(app, mod);
    //console.log("redsquare innerHTML");
    document.querySelector(".redsquare-list").innerHTML = "";
    let tweet_shown = 0;
    for (let i = 0; i < this.tweets.length; i++) {
      if (this.tweets[i].tx.transaction.sig === sig) {
        tweet_shown = 1;
        this.tweets[i].renderWithChildren(app, mod, ".redsquare-list");
        return;
      }
    }

    //
    // if we get here, we don't have this locally, try remote request
    //
    let sql = `SELECT * FROM tweets WHERE sig = '${sig}'`;
    mod.fetchTweets(app, mod, sql, function (app, mod) {
      mod.renderParentWithChildren(app, mod, sig);
    });

  }



  //
  // renders tweet with parents
  //
  renderWithParents(app, mod, sig, num = -1) {
    //this.viewing = sig;
    //console.log("redsquare innerHTML");
    // document.querySelector(".redsquare-list").innerHTML = "";

    let tweet_shown = 0;
    let t = this.returnTweet(app, mod, sig);
    document.querySelector('.redsquare-list-open').style.bottom = 0;
    if (t != null) {
      t.renderWithParents(app, mod, ".redsquare-list-open", num);
    } else {
      t.renderWithParents(app, mod, ".redsquare-list-open", 0);
    }
    // document.querySelector('.saito-container').scroll({ top: 0, left: 0, behavior: 'smooth' });
  }


  //
  // renders children
  //
  renderWithChildren(app, mod, sig) {
    this.viewing = sig;
    let tweetUrl = window.location.origin + window.location.pathname + `?${this.mode}_id=` + sig;
    window.history.pushState({}, document.title, tweetUrl);
    this.reorganizeTweets(app, mod);
    // document.querySelector('.saito-container').scroll({ top: 0, left: 0, behavior: 'smooth' });
    //console.log("redsquare innerHTML");
    // document.querySelector(".redsquare-list").innerHTML = "";

    let tweet_shown = 0;
    document.querySelector('.redsquare-list-open').style.bottom = 0;
    for (let i = 0; i < this.tweets.length; i++) {
      if (this.tweets[i].tx.transaction.sig === sig) {
        tweet_shown = 1;
        this.tweets[i].renderWithChildren(app, mod, ".redsquare-list-open");
        return;
      }
    }
    if (tweet_shown == 0) {
      for (let i = 0; i < this.tweets.length; i++) {
        if (this.tweets[i].returnTweet(app, mod, sig) != null) {
          let t = this.tweets[i].returnTweet(app, mod, sig);
          tweet_shown = 1;
          t.renderWithChildren(app, mod, ".redsquare-list-open");
          return;
        }
      }
    }

    //
    // if we get here, we don't have this locally, try remote request
    //
    let sql = `SELECT * FROM tweets WHERE sig = '${sig}' OR parent_id = '${sig}'`;
    mod.fetchTweets(app, mod, sql, function (app, mod) {
      mod.renderWithChildren(app, mod, sig);
    });
  }
  //
  // render user page
  //

  renderUserPage(app, mod, key) {
    this.viewing = key;
    let tweetUrl = window.location.origin + window.location.pathname + `?${this.mode}_id=` + key;
    window.history.pushState({}, document.title, tweetUrl);

    app.browser.replaceElementById(`<div class="saito-page-header-title" id="saito-page-header-title"><i class='saito-back-button fas fa-angle-left'></i> ${app.keys.returnUsername(key)}</div>`, "saito-page-header-title");
    document.querySelector(".saito-back-button").onclick = (e) => {
      app.browser.replaceElementById(`<div class="saito-page-header-title" id="saito-page-header-title">Red Square</div>`, "saito-page-header-title");
      let redsquareUrl = window.location.origin + window.location.pathname;
      window.history.pushState({}, document.title, redsquareUrl);
      mod.viewing = "feed";
      mod.mode = "feed";
      mod.loadTweets(app, mod, true);
    }

    this.reorganizeTweets(app, mod, false);
    //console.log("redsquare innerHTML");
    document.querySelector(".redsquare-list").innerHTML = "";
    for (let i = 0; i < this.tweets.length; i++) {
      if (this.tweets[i].sender == key) {
        this.tweets[i].render(app, mod, ".redsquare-list");
      }
    }
    app.browser.addIdentifiersToDom();
  }


  //
  // server can accept requests for link properties and return them
  // dynamically if needed. we may want to use this in the course of
  // tweet creation.
  //
  async handlePeerRequest(app, message, peer, mycallback = null) {

    //
    // this code doubles onConfirmation
    //
    if (message.request === "redsquare linkobj fetch") {
      let redsquare_self = app.modules.returnModule("RedSquare");
      let link = message.data.link;
      // let link_properties = await this.fetchOpenGraphProperties(app, mod, link);

      // mycallback(res);
      return;

    }

    super.handlePeerRequest(app, message, peer, mycallback);

  }


  async fetchOpenGraphProperties(app, mod, link) {

    if (this.app.BROWSER == 0) {

      // required og properties for link preview
      let og_tags = {
        'og:exists': false,
        'og:title': '',
        'og:description': '',
        'og:url': '',
        'og:image': '',
        'og:site_name': ''
      };

      // fetch source code for link inside tweet
      // (sites which uses firewall like Cloudflare shows Cloudflare loading
      //  page when fetching page source)
      //
      try {
        return fetch(link)
          .then(res => res.text())
          .then(data => {

            // prettify html - unminify html if minified
            let html = prettify(data);

            // parse string html to DOM html
            let dom = HTMLParser.parse(html);

            // fetch meta element for og tags
            let meta_tags = dom.getElementsByTagName('meta');

            // loop each meta tag and fetch required og properties
            for (let i = 0; i < meta_tags.length; i++) {
              let property = meta_tags[i].getAttribute('property');
              let content = meta_tags[i].getAttribute('content');
              // get required og properties only, discard others
              if (property in og_tags) {
                og_tags[property] = content;
                og_tags['og:exists'] = true;
              }
            }

            return og_tags;
          });
      } catch (err) {
        return {};
      }
    } else {
      return {};
    }
  }




  async onPeerHandshakeComplete(app, peer) {

    //
    // avoid load in other apps
    //
    if (!this.browser_active) { return; }

    this.loadTweets(app, this);

  }

  loadNotificationTransactions(app, mod, increment = 1, post_load_callback) {

    mod.app.storage.loadTransactions("RedSquare", (50 * increment), (txs) => {
      mod.ntfs_num = txs.length;
      let first_index = (increment - 1) * 50
      mod.max_ntfs_num = 50 * increment;

      console.log(mod.max_ntfs_num, mod.ntfs_num, txs, "notifications");

      let tx_to_add = txs.splice(first_index)

      for (let i = 0; i < tx_to_add.length; i++) {
        //console.log(i + ": " + JSON.stringify(txs[i].optional));
        tx_to_add[i].decryptMessage(app);
        let txmsg = tx_to_add[i].returnMessage();
        if (txmsg.request == "create tweet") {
          let tweet = new Tweet(mod.app, mod, tx_to_add[i]);
          mod.addTweet(mod.app, mod, tweet);
          mod.txmap[tweet.tx.transaction.sig] = 1;
        }
        mod.addNotification(mod.app, mod, tx_to_add[i]);
      }



      if (post_load_callback) {
        post_load_callback(app, mod)
      }



    });
  }

  loadTweets(app, mod) {
    if (mod.app.BROWSER == 1) {

      if (mod.viewing == "feed") {
        mod.saito_loader.render(app, mod, 'redsquare-home-header', false);
      } else {
        mod.saito_loader.remove();
      }

      if (document.querySelector(".redsquare-list")) {
        if (mod.viewing == "feed") {
          let sql = `SELECT * FROM tweets WHERE flagged IS NOT 1 AND moderated IS NOT 1 AND tx_size < 10000000 ORDER BY updated_at DESC LIMIT 0,'${this.results_per_page}'`;
          this.fetchTweets(app, mod, sql, function (app, mod) {
            console.log("Main - TWEETS FETCH FROM PEER: " + mod.tweets.length);
            mod.renderMainPage(app, mod);
            mod.fetchSavedTweets(app, mod, function () {
              mod.renderMainPage(app, mod);
            });
          });
        } else {
          //let sql = `SELECT * FROM tweets WHERE sig = '${mod.viewing}' OR parent_id = '${mod.viewing}'`;
          if (this.mode == "thread" || this.mode == "tweet") {
            let sql = `SELECT * FROM tweets WHERE flagged IS NOT 1 AND moderated IS NOT 1 AND sig = '${mod.viewing}' OR parent_id = '${mod.viewing}' OR thread_id = '${mod.viewing}'`;
            mod.fetchTweets(app, mod, sql, function (app, mod) { mod.renderWithChildren(app, mod, mod.viewing); });
            mod.fetchSavedTweets(app, mod, function () {
              mod.renderMainPage(app, mod);
            });
          }
          if (this.mode == "user") {
            let sql = `SELECT * FROM tweets WHERE flagged IS NOT 1 AND moderated IS NOT 1 AND tx_size < 10000000 ORDER BY updated_at DESC LIMIT 0,'${this.results_per_page}'`;
            this.fetchTweets(app, mod, sql, function (app, mod) {
              console.log("Main - TWEETS FETCH FROM PEER: " + mod.tweets.length);
            });
            sql = `SELECT * FROM tweets WHERE flagged IS NOT 1 AND moderated IS NOT 1 AND publickey = '${mod.viewing}';`;
            this.fetchTweets(app, mod, sql, function (app, mod) { mod.renderUserPage(app, mod, mod.viewing); });
          }
        }
      }
    }
  }


  async onConfirmation(blk, tx, conf, app) {

    if (app.BROWSER === 1) {
      /*
      console.log("run updates");
      if (blk != null) {
        //random time in milliseconds)
        let tweet_timeout = 10000 + (Math.random() * 5000);
        let stats_timeout = 10000 + (Math.random() * 10000);

        setTimeout(function () {
          if (this.viewing == "feed") {
            this.fetchNewTweets(app, mod_self);
            console.log('feed update');
          }
        }, tweet_timeout);

        setTimeout(function () {
          if (this.viewing == "feed") {
            this.fetchStatsUpdate(app, mod_self);
            console.log('status update');
          }
        }, stats_timeout);
      }
      */
    }

    let txmsg = tx.returnMessage();
    try {
      if (conf == 0) {
        if (txmsg.request === "create tweet") {
          this.receiveTweetTransaction(blk, tx, conf, app);
          this.sqlcache = [];
        }
        if (txmsg.request === "like tweet") {
          this.receiveLikeTransaction(blk, tx, conf, app);
          this.sqlcache = [];
        }
        if (txmsg.request === "flag tweet") {
          this.receiveFlagTransaction(blk, tx, conf, app);
          this.sqlcache = [];
        }
      }
    } catch (err) {
      console.log("ERROR in " + this.name + " onConfirmation: " + err);
    }
  }

  trackTweet(app, mod, tweet) {
    this.trackedTweet = tweet
  }




  ///////////////////////////////////////
  // fetching curated tweets from peer //
  ///////////////////////////////////////
  fetchSavedTweets(app, mod, mycallback = null) {
    mod.app.storage.loadTransactions("RedSquare", 50, (txs) => {
      mod.ntfs_num = txs.length;
      console.log(mod.max_ntfs_num, mod.ntfs_num, txs, "notifications");

      for (let i = 0; i < txs.length; i++) {
        txs[i].decryptMessage(app);
        let txmsg = txs[i].returnMessage();
        if (txmsg.request == "create tweet") {
          let tweet = new Tweet(mod.app, mod, txs[i]);
          mod.addTweet(mod.app, mod, tweet);
          mod.txmap[tweet.tx.transaction.sig] = 1;
        }

        mod.addNotification(mod.app, mod, txs[i]);
      }

      if (mycallback != null) { mycallback(); }
    })
  };

  fetchTweets(app, mod, sql, post_fetch_tweets_callback = null, to_track_tweet = false, is_server_request = false) {
    app.modules.returnModule("RedSquare").sendPeerDatabaseRequestWithFilter(
      "RedSquare",
      sql,
      async (res) => {
        if (res.rows) {
          if (!mod.trackedTweet) {
            mod.trackedTweet = res.rows[0];
          }
          //mod.trackedTweet = res.rows[0];

          res.rows.forEach(row => {
            if (row.created_at > mod.trackedTweet.created_at) {
              mod.trackedTweet = row;
            }
            let new_tweet = 1;
            if (new_tweet) {
              let tx = new saito.default.transaction(JSON.parse(row.tx));
              if (!tx.optional) { tx.optional = {}; }
              tx.optional.parent_id = tx.msg.parent_id;
              tx.optional.thread_id = tx.msg.thread_id;
              tx.optional.num_replies = row.num_replies;
              tx.optional.num_retweets = row.num_retweets;
              tx.optional.num_likes = row.num_likes;
              tx.optional.flagged = row.flagged;
              tx.optional.link_properties = {};
              try {
                let x = JSON.parse(row.link_properties);
                tx.optional.link_properties = x;
              } catch (err) { }
              let txmsg = tx.returnMessage();
              this.addTweetFromTransaction(app, mod, tx);
            }
          });

          if (post_fetch_tweets_callback != null) {
            post_fetch_tweets_callback(app, mod);
          }

        }

        if (is_server_request == false) {
          mod.saito_loader.remove(app, mod);
        }
      }
    );
  }

  fetchMoreTweets(app, mod, post_fetch_tweets_callback) {

    const startingLimit = (this.page_number - 1) * this.results_per_page
    let sql = `SELECT * FROM tweets WHERE (flagged IS NOT 1 OR moderated IS NOT 1) AND parent_id = thread_id AND tx_size < 1000000 ORDER BY updated_at DESC LIMIT '${startingLimit}','${this.results_per_page}'`;

    app.modules.returnModule("RedSquare").sendPeerDatabaseRequestWithFilter(
      "RedSquare",
      sql,
      async (res) => {
        const tweets = [];
        if (res.rows) {
          res.rows.forEach(row => {
            let new_tweet = 1;
            if (new_tweet) {
              let tx = new saito.default.transaction(JSON.parse(row.tx));
              if (!tx.optional) { tx.optional = {}; }
              tx.optional.parent_id = tx.msg.parent_id;
              tx.optional.thread_id = tx.msg.thread_id;
              tx.optional.num_replies = row.num_replies;
              tx.optional.num_retweets = row.num_retweets;
              tx.optional.num_likes = row.num_likes;
              tx.optional.flagged = row.flagged;
              tx.optional.link_properties = {};
              try {
                let x = JSON.parse(row.link_properties);
                tx.optional.link_properties = x;
                let tweet = new Tweet(app, mod, tx);
                tweets.push(tweet);
              } catch (err) { }
            }
          });
          for (let i = 0; i < tweets.length; i++) {
            mod.addTweetAndBroadcastRenderRequest(app, mod, tweets[i]);
          }
          post_fetch_tweets_callback(app, mod);
          mod.page_number++;
        }
      }
    );
  }

  fetchNewTweets(app, mod) {
    console.log("Fetching New Posts");
    if (!mod.trackedTweet) { return; }
    let sql = `SELECT * FROM tweets WHERE (flagged IS NOT 1 OR moderated IS NOT 1) AND tx_size < 1000000 AND created_at > '${mod.trackedTweet.created_at}' ORDER BY updated_at DESC LIMIT 0,'${this.results_per_page}'`;
    app.modules.returnModule("RedSquare").sendPeerDatabaseRequestWithFilter(
      "RedSquare",
      sql,
      async (res) => {
        const tweets = [];
        if (res.rows) {
          console.log(res.rows, "result");
          if (res.rows[0]) {
            mod.trackedTweet = res.rows[0];
            res.rows.forEach(row => {
              let new_tweet = true;
              let tweet_id = "tweet-box-" + row.sig;
              if (document.getElementById(tweet_id)) {
                new_tweet = false;
              }
              if (new_tweet) {
                let tx = new saito.default.transaction(JSON.parse(row.tx));
                if (!tx.optional) { tx.optional = {}; }
                tx.optional.parent_id = tx.msg.parent_id;
                tx.optional.thread_id = tx.msg.thread_id;
                tx.optional.num_replies = row.num_replies;
                tx.optional.num_retweets = row.num_retweets;
                tx.optional.num_likes = row.num_likes;
                tx.optional.flagged = row.flagged;
                tx.optional.link_properties = {};
                try {
                  let x = JSON.parse(row.link_properties);
                  tx.optional.link_properties = x;
                  tweets.push(new Tweet(app, mod, tx));
                } catch (err) { }
              }
            });
            mod.newTweets = mod.newTweets.concat(tweets);
            document.querySelector("#redsquare-new-tweets-banner").style.display = "block";
          }
        }
      }
    );
  }

  fetchStatsUpdate(app, mod) {
    let obj = document.querySelector(".redsquare-list");

    if (obj) {
      let id_list = '("';
      obj.querySelectorAll(".redsquare-item").forEach(item => {
        id_list += item.dataset.id + '", "';
      });
      id_list = id_list.slice(0, -3) + ");";
      //console.log(id_list);

      if (id_list.length > 10) {
        let sql = "select num_likes, num_retweets, num_replies, id, sig from tweets where num_likes + num_retweets + num_replies > 0 and sig in " + id_list;
        app.modules.returnModule("RedSquare").sendPeerDatabaseRequestWithFilter(
          "RedSquare",
          sql,
          async (res) => {
            const tweets = [];
            if (res.rows) {
              res.rows.forEach(row => {

                let optional = {};
                optional.num_likes = row.num_likes;
                optional.num_replies = row.num_replies;
                optional.num_retweets = row.num_retweets;
                app.storage.updateTransactionOptional(row.sig, app.wallet.returnPublicKey(), optional);

                let tweet_id = "tweet-box-" + row.sig;
                let obj = document.getElementById(tweet_id);
                if (obj) {
                  if (obj.querySelector('.redsquare-tweet-tools')) {
                    //console.log("redsquare innerHTML");
                    if (row.num_likes > parseInt(obj.querySelector(".tweet-tool-like-count-" + row.sig).innerHTML)) {
                      obj.querySelector(".tweet-tool-like-count-" + row.sig).innerHTML = row.num_likes;
                    }
                    if (row.num_replies > parseInt(obj.querySelector(".tweet-tool-comment-count-" + row.sig).innerHTML)) {
                      obj.querySelector(".tweet-tool-comment-count-" + row.sig).innerHTML = row.num_replies;
                    }
                    if (row.num_retweets > parseInt(obj.querySelector(".tweet-tool-retweet-count-" + row.sig).innerHTML)) {
                      obj.querySelector(".tweet-tool-retweet-count-" + row.sig).innerHTML = row.num_retweets;
                    }
                  }
                }
              });
            }
          }
        );

      }
    }
  }






  sendLikeTransaction(app, mod, data, tx = null) {

    let redsquare_self = this;

    let obj = {
      module: redsquare_self.name,
      request: "like tweet",
      data: {},
    };
    for (let key in data) {
      obj.data[key] = data[key];
    }

    let newtx = redsquare_self.app.wallet.createUnsignedTransaction();
    for (let i = 0; i < tx.transaction.to.length; i++) {
      if (tx.transaction.to[i].add !== app.wallet.returnPublicKey()) {
        newtx.transaction.to.push(new saito.default.slip(tx.transaction.to[i].add, 0.0));
      }
    }

    newtx.msg = obj;
    newtx = redsquare_self.app.wallet.signTransaction(newtx);
    redsquare_self.app.network.propagateTransaction(newtx);

    return newtx;

  }

  async receiveLikeTransaction(blk, tx, conf, app) {

    //
    // browsers
    //
    if (app.BROWSER == 1) {

      //
      // save my likes
      //
      if (tx.isTo(app.wallet.returnPublicKey())) {
        this.app.storage.saveTransaction(tx);

        //
        // save optional likes
        //
        let txmsg = tx.returnMessage();
        if (this.txmap[txmsg.data.sig]) {
          let tweet = this.returnTweet(app, this, txmsg.data.sig);
          if (tweet == null) { return; }
          let tx = tweet.tx;
          if (!tx.optional) { tx.optional = {}; }
          if (!tx.optional.num_likes) { tx.optional.num_likes = 0; }
          tx.optional.num_likes++;
          this.app.storage.updateTransactionOptional(txmsg.data.sig, app.wallet.returnPublicKey(), tx.optional);
          tweet.renderLikes();
        } else {
          this.app.storage.incrementTransactionOptionalValue(txmsg.data.sig, "num_likes");
        }

      }


      //
      // add notification for unviewed
      //
      //console.log("ADD THIS: " + tx.transaction.ts + " > " + this.last_viewed_notifications_ts);
      if (tx.transaction.ts > this.last_viewed_notifications_ts) {
        this.addNotification(app, this, tx);
      } else {
        this.ntfs.push(tx);
      }

      return;
    }

    //
    // servers
    //
    let txmsg = tx.returnMessage();
    let sql = `UPDATE tweets SET num_likes = num_likes + 1 WHERE sig = $sig`;
    let params = {
      $sig: txmsg.data.sig,
    };
    app.storage.executeDatabase(sql, params, "redsquare");

    return;

  }


  sendTweetTransaction(app, mod, data, keys = []) {

    let redsquare_self = this;

    let obj = {
      module: redsquare_self.name,
      request: "create tweet",
      data: {},
    };
    for (let key in data) {
      obj.data[key] = data[key];
    }

    let newtx = redsquare_self.app.wallet.createUnsignedTransaction();
    newtx.msg = obj;
    for (let i = 0; i < keys.length; i++) {
      if (keys[i] !== app.wallet.returnPublicKey()) {
        newtx.transaction.to.push(new saito.default.slip(keys[i]));
      }
    }
    newtx = redsquare_self.app.wallet.signTransaction(newtx);
    redsquare_self.app.network.propagateTransaction(newtx);

    return newtx;

  }

  async receiveTweetTransaction(blk, tx, conf, app) {

    let tweet = new Tweet(app, this, tx);

    //
    // browsers
    //
    if (app.BROWSER == 1) {

      //
      // save tweets addressed to me
      //
      if (tx.isTo(app.wallet.returnPublicKey())) {
        this.app.storage.saveTransaction(tx);
        let txmsg = tx.returnMessage();

        //
        // if replies
        //
        if (txmsg.data?.parent_id) {
          if (this.txmap[txmsg.data.parent_id]) {
            let tweet = this.returnTweet(app, this, txmsg.data.sig);
            if (tweet == null) { return; }
            let tx = this.txmap[parent_id];
            if (tx.isTo(app.wallet.returnPublicKey())) {
              if (!tx.optional) { tx.optional = {}; }
              if (!tx.optional.num_replies) { tx.optional.num_replies = 0; }
              tx.optional.num_replies++;


              this.app.storage.updateTransactionOptional(txmsg.data.parent_id, app.wallet.returnPublicKey(), tx.optional);
              tweet.renderReplies();
            }
          } else {
            this.app.storage.incrementTransactionOptionalValue(txmsg.data.sig, "num_replies");
          }
        }


        //
        // if retweets
        //
        if (txmsg.data?.retweet_tx) {
          if (txmsg.data?.retweet_tx) {

            let rtxobj = JSON.parse(txmsg.data.retweet_tx);
            let rtxsig = rtxobj.sig;

            if (this.txmap[rtxsig]) {
              let tweet2 = this.returnTweet(app, this, rtxsig);
              if (tweet2 == null) { return; }
              let tx = tweet2.tx;
              if (!tx.optional) { tx.optional = {}; }
              if (!tx.optional.num_retweets) { tx.optional.num_retweets = 0; }
              tx.optional.num_retweets++;
              this.app.storage.updateTransactionOptional(rtxsig, app.wallet.returnPublicKey(), tx.optional);
              tweet2.renderRetweets();
            } else {
              this.app.storage.incrementTransactionOptionalValue(rtxsig, "num_retweets");
            }
          }
        }
      }

      //
      // add notification for unviewed
      //
      //console.log("ADD THIS: " + tx.transaction.ts + " > " + this.last_viewed_notifications_ts);
      if (tx.transaction.ts > this.last_viewed_notifications_ts) {
        this.addNotification(app, this, tx);
      } else {
        this.ntfs.push(tx);
      }

      this.newTweets.push(tweet);
      if (tx.transaction.from[0].add != app.wallet.returnPublicKey()) {
        document.querySelector("#redsquare-new-tweets-banner").style.display = "block";
      }
      return;
    }



    //
    // servers
    //
    // fetch supporting link properties
    //
    tweet = await tweet.generateTweetProperties(app, this, 1);

    let created_at = tx.transaction.ts;
    let updated_at = tx.transaction.ts;

    //
    // insert the basic information
    //
    let sql = `INSERT INTO tweets (
                tx,
                sig,
            	created_at,
            	updated_at,
            	parent_id,
            	thread_id,
                publickey,
                link,
            	link_properties,
            	num_replies,
            	num_retweets,
            	num_likes,
                has_images,
                tx_size
              ) VALUES (
                $txjson,
                $sig,
            	$created_at,
            	$updated_at,
            	$parent_id,
            	$thread_id,
                $publickey,
            	$link,
            	$link_properties,
            	0,
            	0,
            	0,
                $has_images,
                $tx_size
              )`;

    let has_images = 0;
    if (typeof (tweet.images) != "undefined") { has_images = 1; }
    let txjson = JSON.stringify(tx.transaction);
    let tx_size = txjson.length;

    let params = {
      $txjson: txjson,
      $sig: tx.transaction.sig,
      $created_at: created_at,
      $updated_at: updated_at,
      $parent_id: tweet.parent_id,
      $thread_id: tweet.thread_id,
      $publickey: tx.transaction.from[0].add,
      $link: tweet.link,
      $link_properties: JSON.stringify(tweet.link_properties),
      $has_images: has_images,
      $tx_size: tx_size
    };

    app.storage.executeDatabase(sql, params, "redsquare");

    let ts = new Date().getTime();
    let sql2 = "UPDATE tweets SET updated_at = $timestamp WHERE sig = $sig";
    let params2 = {
      $timestamp: ts,
      $sig: tweet.thread_id,
    }
    app.storage.executeDatabase(sql2, params2, "redsquare");


    if (tweet.retweet_tx != null) {
      let ts = new Date().getTime();
      let sql3 = "UPDATE tweets SET num_retweets = num_retweets + 1 WHERE sig = $sig";
      let params3 = {
        $sig: tweet.thread_id,
      }
      app.storage.executeDatabase(sql3, params3, "redsquare");
    }


    if (tweet.parent_id !== tweet.tx.transaction.sig && tweet.parent_id !== "") {
      let ts = new Date().getTime();
      let sql4 = "UPDATE tweets SET num_replies = num_replies + 1 WHERE sig = $sig";
      let params4 = {
        $sig: tweet.parent_id,
      }
      app.storage.executeDatabase(sql4, params4, "redsquare");
    }

    this.sqlcache = [];

    return;

  }

  sendFlagTransaction(app, mod, data) {

    let redsquare_self = this;

    let obj = {
      module: redsquare_self.name,
      request: "flag tweet",
      data: {},
    };
    for (let key in data) {
      obj.data[key] = data[key];
    }

    let newtx = redsquare_self.app.wallet.createUnsignedTransaction();
    newtx.msg = obj;
    newtx = redsquare_self.app.wallet.signTransaction(newtx);
    redsquare_self.app.network.propagateTransaction(newtx);

    return newtx;

  }

  async receiveFlagTransaction(blk, tx, conf, app) {

    //
    // browsers
    //
    if (app.BROWSER == 1) {
      return;
    }

    //
    // servers
    //
    let txmsg = tx.returnMessage();
    let sql = `UPDATE tweets SET flagged = 1 WHERE sig = $sig`;
    let params = {
      $sig: txmsg.data.sig,
    };
    app.storage.executeDatabase(sql, params, "redsquare");

    this.sqlcache = [];

    return;

  }

  loadRedSquare() {

    if (this.app.options.redsquare) {
      this.redsquare = this.app.options.redsquare;
      if (this.redsquare.last_viewed_notifications_ts) {
        this.last_viewed_notifications_ts = this.redsquare.last_viewed_notifications_ts;
      }
      return;
    }

    this.redsquare = {};
    this.redsquare.last_checked_notifications_timestamp = new Date().getTime();
    this.redsquare.last_viewed_notifications_ts = 0;
    this.redsquare.last_liked_tweets = [];
  }

  saveRedSquare() {
    this.redsquare.last_viewed_notifications_ts = this.last_viewed_notifications_ts;
    this.app.options.redsquare = this.redsquare;
    this.app.storage.saveOptions();
  }


  webServer(app, expressapp, express) {
    //super.webServer(app, expressapp, express);
    let webdir = `${__dirname}/../../mods/${this.dirname}/web`;
    let fs = app?.storage?.returnFileSystem();

    let redsquare_self = this;

    expressapp.get('/' + encodeURI(this.returnSlug()), async function (req, res) {
      let reqBaseURL = req.protocol + "://" + req.headers.host + "/";

      try {

        if (Object.keys(req.query).length > 0) {
          let query_params = req.query;

          if (typeof query_params.tweet_id != "undefined" || typeof query_params.thread_id != "undefined") {
            let sig = query_params.tweet_id || query_params.thread_id;
            let sql = `SELECT * FROM tweets WHERE sig = '${sig}'`;

            let rows = await app.storage.queryDatabase(sql, {}, "redsquare");

            for (let i = 0; i < rows.length; i++) {
              let tx = new saito.default.transaction(JSON.parse(rows[i].tx));
              let txmsg = tx.returnMessage();
              let text = tx.msg.data.text;
              let publickey = tx.transaction.from[0].add;
              let user = app.keys.returnIdentifierByPublicKey(publickey, true);
              //let user = await app.keys.fetchIdentifierPromise(publickey);

              redsquare_self.social.twitter_description = text;
              redsquare_self.social.og_description = text;
              redsquare_self.social.og_url = reqBaseURL + encodeURI(redsquare_self.returnSlug());

              // if (typeof tx.msg.data.images != "undefined") {
              //   let image = tx.msg.data?.images[0];
              // } else {
              //   let publickey = tx.transaction.from[0].add;
              //   let image = app.keys.returnIdenticon(publickey);
              // }

              let image = redsquare_self.social.og_url = reqBaseURL + encodeURI(redsquare_self.returnSlug()) + '?og_img_sig=' + sig;
              redsquare_self.social.og_title = user + " posted on Saito 🟥";
              redsquare_self.social.twitter_title = user + " posted on Saito 🟥"
              redsquare_self.social.og_image = image;
              redsquare_self.social.og_image_url = image;
              redsquare_self.social.og_image_secure_url = image;
              redsquare_self.social.twitter_image = image;

            }
          } // if query param has tweet id


          console.log('query params');
          console.log(query_params);

          if (typeof query_params.og_img_sig != "undefined") {


            let sig = query_params.og_img_sig;
            let sql = `SELECT * FROM tweets WHERE sig = '${sig}'`;

            let rows = await app.storage.queryDatabase(sql, {}, "redsquare");

            for (let i = 0; i < rows.length; i++) {
              let tx = new saito.default.transaction(JSON.parse(rows[i].tx));
              let txmsg = tx.returnMessage();

              if (typeof tx.msg.data.images != "undefined") {
                let img_uri = tx.msg.data?.images[0];



                let img_type = img_uri.substring(img_uri.indexOf(":") + 1, img_uri.indexOf(";"));

                let base64Data = img_uri.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
                let img = Buffer.from(base64Data, 'base64');


              } else {

                let publickey = tx.transaction.from[0].add;
                let img_uri = app.keys.returnIdenticonasPNG(publickey);
                let base64Data = img_uri.replace(/^data:image\/png;base64,/, '');
                let img = Buffer.from(base64Data, 'base64');
                let img_type = img_uri.substring(img_uri.indexOf(":") + 1, img_uri.indexOf(";"));
              }


              // console.log('base64 data');
              // console.log(base64Data);

              // console.log('img');
              // console.log(img);

              // console.log('img format');
              // console.log(img_type);

              if (img_type == 'image/svg+xml') {
                img_type = 'image/svg';
              }

              res.writeHead(200, {
                'Content-Type': img_type,
                'Content-Length': img.length
              });
              res.end(img);
              return;
            }
          }
        }
      } catch (err) {
        console.log("Loading OG data failed with error: " + err);
      }

      res.setHeader("Content-type", "text/html");
      res.charset = "UTF-8";
      res.write(redsquareHome(app, redsquare_self));
      res.end();
      return;

    });

    expressapp.use('/' + encodeURI(this.returnSlug()), express.static(webdir));
  }

}

module.exports = RedSquare;

