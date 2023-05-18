const saito = require("./../../lib/saito/saito");
const RedSquareIndex = require("./lib/index");
const ModTemplate = require("../../lib/templates/modtemplate");
const SaitoHeader = require("../../lib/saito/ui/saito-header/saito-header");
const SaitoMain = require("./lib/main");
const SaitoMenu = require("./lib/menu");
const RedSquareSidebar = require("./lib/sidebar");
const Tweet = require("./lib/tweet");
const fetch = require("node-fetch");
const HTMLParser = require("node-html-parser");
const prettify = require("html-prettify");
const redsquareHome = require("./index");
const Post = require("./lib/post");
const Transaction = require("../../lib/saito/transaction");
const Factory = require("../../lib/saito/factory").default;

/*
 * lib/main.js:    this.app.connection.on("redsquare-home-render-request", () => {			// renders main tweets
 * lib/main.js:    this.app.connection.on("redsquare-home-loader-render-request", () => {		// renders loader (home)
 * lib/main.js:    this.app.connection.on("redsquare-home-loader-hide-request", () => {			// hides loader (home)
 * lib/main.js:    this.app.connection.on("redsquare-home-thread-render-request", (tweets) => {		// renders thread (tweets = array)
 * lib/main.js:    this.app.connection.on("redsquare-home-tweet-render-request", (tweet) => {		// renders tweet
 * lib/main.js:    this.app.connection.on("redsquare-home-tweet-append-render-request", (tweet) => {	// appends tweet to home
 * lib/main.js:    this.app.connection.on("redsquare-home-tweet-prepend-render-request", (tweet) => {	// prepends tweet to home
 * lib/main.js:    this.app.connection.on("redsquare-tweet-added-render-request", (tweet) => {		// runs when tweet is added in redsquare
 * lib/main.js:    this.app.connection.on("redsquare-profile-render-request", () => {			// renders profile
 * lib/main.js:    //this.app.connection.on("redsquare-contacts-render-request", () => {		// renders contacts
 * lib/main.js:    this.app.connection.on("redsquare-notifications-render-request", () => {		// renders notifications
 * lib/main.js:    this.app.connection.on("redsquare-component-render-request", (obj) => {		// renders other modules into .saito-main
 */

class RedSquare extends ModTemplate {
  constructor(app) {
    super(app);
    this.appname = "Red Square";
    this.name = "RedSquare";
    this.slug = "redsquare";
    this.description = "Open Source Twitter-clone for the Saito Network";
    this.categories = "Social Entertainment";
    this.redsquare = {}; // where settings go, saved to options file
    this.icon_fa = "fas fa-square-full";
    this.viewing = "home";
    this.profiles = {};
    this.tweets = [];
    this.tweets_sigs_hmap = {};
    this.unknown_children = [];

    //
    // cache common queries
    //
    this.sqlcache_enabled = 1;

    this.peers_for_tweets = [];
    this.peers_for_notifications = [];
    this.notifications = [];
    this.notifications_sigs_hmap = {};
    this.lastest_tweets = [];
    //
    // view tweet or cache it for "load more"...
    //
    this.tweets_last_viewed_ts = 0;

    //
    // is this a notification?
    //
    this.notifications_last_viewed_ts = 0;
    this.notifications_number_unviewed = 0;
    this.ntfs = []; // notifications, the notifications panel is attached under the full name by subcomponent
    this.ntfs_num = 0;
    this.max_ntfs_num = 50;
    this.ntfs_counter = {};

    //
    // used to fetch more content
    //
    this.increment_for_tweets = 0; // start a 0
    this.increment_for_notifications = 1;
    this.results_per_page = 10;
    this.results_loaded = false;
    //
    // tracking timestamps of notifications and tweets (potentially useful)
    //
    this.notifications_newest_ts = 0;
    this.notifications_oldest_ts = new Date().getTime();
    this.tweets_newest_ts = 0;
    this.tweets_oldest_ts = new Date().getTime();

    this.load_more_tweets = 1;
    this.load_more_notifications = 1;
    this.trackedTweet = null;
    this.allowed_upload_types = ["image/png", "image/jpg", "image/jpeg"];

    this.scripts = ["/saito/lib/virtual-bg/virtual-bg.js"];

    this.postScripts = ["/saito/lib/emoji-picker/emoji-picker.js"];

    this.styles = ["/saito/saito.css", "/redsquare/style.css"];

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
      og_image_secure_url:
        "https://saito.tech/wp-content/uploads/2022/04/saito_card_horizontal.png",
    };

    this.theme_options = {
      lite: "fa-solid fa-sun",
      dark: "fa-solid fa-moon",
    };

    return this;
  }

  returnServices() {
    let services = [];
    services.push({ service: "redsquare", name: "RedSquare Tweet Archive" });
    return services;
  }

  /////////////////////////////////
  // inter-module communications //
  /////////////////////////////////
  respondTo(type = "") {
    let this_mod = this;
    if (type === "user-menu") {
      return {
        text: "View Profile",
        icon: "fa-regular fa-user",
        callback: function (app, publickey) {
          app.connection.emit("redsquare-profile-render-request", publickey);
        },
      };
    }
    if (type === "saito-header") {
      let x = [];
      if (!this.browser_active) {
        x.push({
          text: "RedSquare",
          icon: "fa-solid fa-square",
          rank: 20,
          callback: function (app, id) {
            window.location = "/redsquare";
          },
        });
      }
      //Suggestion -- these are covered by the floating menu
      /*if (this.app.browser.isMobileBrowser()) {
        x.push({
          text: "Notifications",
          icon: "fas fa-bell",
          rank: 23,
          callback: function (app, id) {
            window.location = "/redsquare#notifications";
          }
        });
        x.push({
          text: "Profile",
          icon: "fas fa-user",
          rank: 26,
          callback: function (app, id) {
            window.location = "/redsquare#profile";
          }
        });
      }*/

      return x;
    }

    if (type === "saito-floating-menu") {
      let x = [];
      x.push({
        text: "Tweet",
        icon: "fa-solid fa-pen",
        allowed_mods: ["redsquare"],
        disallowed_mods: ["arcade"],
        rank: 20,
        callback: function (app, id) {
          let post = new Post(app, this_mod);
          post.render();
        },
      });

      x.push({
        text: "Refresh",
        icon: "fa-solid fa-house",
        allowed_mods: ["redsquare"],
        disallowed_mods: ["arcade"],
        rank: 5,
        callback: function (app, id) {
          setHash("home");
          app.connection.emit("redsquare-home-render-request");
        },
      });

      x.push({
        text: "Notificationas",
        icon: "fa-solid fa-bell",
        allowed_mods: ["redsquare"],
        disallowed_mods: ["arcade"],
        rank: 5,
        callback: function (app, id) {
          setHash("notifications");
          app.connection.emit("redsquare-notifications-render-request");
          this.notifications_number_unviewed = 0;
          this.notifications_last_viewed_ts = new Date().getTime();
          this.save();
          this.incrementNotifications("notifications", this.notifications_number_unviewed);
        },
      });

      x.push({
        text: "Profile",
        icon: "fa-solid fa-user",
        allowed_mods: ["redsquare"],
        disallowed_mods: ["arcade"],
        rank: 5,
        callback: function (app, id) {
          app.connection.emit("redsquare-profile-render-request");
        },
      });

      return x;
    }

    return null;
  }

  //////////////////////////////
  // initialization functions //
  //////////////////////////////
  //
  // this gets the party started. note that we may not have
  // any network connections to peers at this point. so most
  // of the work is setting up the wallet and seeing if we
  // already have data there to load.
  //
  // we can also try to load content from any local storage
  // so that we have something to show before the network is
  // live.
  //
  async initialize(app) {
    let redsquare_self = app.modules.returnModule("RedSquare");
    await super.initialize(app);

    //
    // fetch content from options file
    //
    this.load();

    //
    // fetch content from local archive
    //
    //    this.tweets_last_viewed_ts = new Date().getTime();
    //    app.storage.loadTransactionsFromLocal("RedSquare", (50 * 1), (txs) => {
    //      for (let i = 0; i < txs.length; i++) { this.addTweet(tx); }
    //    });

    //
    // this prints the last 10 tweets to ./web/tweets.js which is optionally
    // fetched by browsers. It allows us to rapidly put the last 10 tweets we
    // prefer at the top of their feed for more rapid page load.
    //
    if (app.BROWSER == 0) {
      // await this.updateTweetsCacheForBrowsers();
    }
  }

  //
  // runs when archive peer connects
  //
  async onPeerServiceUp(app, peer, service = {}) {
    //
    // avoid network overhead if in other apps
    //
    if (!this.browser_active) {
      return;
    }

    //
    // redsquare -- fetch community tweets
    //
    if (service.service === "redsquare") {
      // make sure we have at least one peer for tweets

      if (!this.peers_for_tweets.includes(peer)) {
        this.peers_for_tweets.push(peer);
      }

      if (this.app.browser.returnURLParameter("tweet_id")) {
        return;
      }
      if (this.app.browser.returnURLParameter("user_id")) {
        return;
      }
      // needs be the same as in loadMoreTweets
      let sql = `SELECT *
                 FROM tweets
                 WHERE parent_id = ""
                   AND flagged IS NOT 1
                   AND moderated IS NOT 1
                   AND tx_size < 10000000
                 ORDER BY updated_at DESC LIMIT 0,'${this.results_per_page}'`;
      this.loadTweetsFromPeer(
        peer,
        sql,
        (txs) => {
          let hash = this.app.browser.returnHashAndParameters();
          if (!hash.hash) {
            this.app.connection.emit("redsquare-home-render-request");
          }
        },
        true
      );
    }

    //
    // archive -- load our own tweets
    //
    if (service.service === "archive") {
      //
      // minor delay so community content loads first
      //
      setTimeout(() => {
        this.loadNotificationsFromPeer(peer, 1, function (res) {
          let hash = app.browser.returnHashAndParameters();
          if (hash.hash === "notifications") {
            app.connection.emit("redsquare-notifications-render-request");
          }
        });
      }, 3500);
    }
  }

  //
  // runs when normal peer connects
  //
  async onPeerHandshakeComplete(app, peer) {
    //
    // avoid network overhead if in other apps
    //
    if (!this.browser_active) {
      return;
    }

    //
    // render tweet thread
    //
    let mod = app.modules.returnModule("RedSquare");
    if (this.results_loaded == false) {
      let tweet_id = this.app.browser.returnURLParameter("tweet_id");
      if (tweet_id != "") {
        let sql = `SELECT *
                   FROM tweets
                   WHERE sig = '${tweet_id}'
                      OR parent_id = '${tweet_id}'
                   ORDER BY created_at DESC`;
        this.loadTweetsFromPeer(
          peer,
          sql,
          (txs) => {
            let x = [];
            this.results_loaded = true;
            for (let z = 0; z < txs.length; z++) {
              if (txs[z].signature === tweet_id) {
                let tweet = new Tweet(this.app, this, ".redsquare-appspace-body", txs[z]);
                x.push(tweet);
              }
            }
            for (let z = 0; z < txs.length; z++) {
              if (txs[z].signature !== tweet_id) {
                let tweet = new Tweet(this.app, this, ".redsquare-appspace-body", txs[z]);
                x[0].addTweet(tweet);
              }
            }
            this.app.connection.emit("redsquare-home-thread-render-request", x);
          },
          false,
          false
        );
        return;
      }

      //
      // render user profile
      //
      let user_id = this.app.browser.returnURLParameter("user_id");
      if (user_id != "") {
        this.app.connection.emit("redsquare-profile-render-request", user_id);
        this.results_loaded = true;
        return;
      }
    } else {
      if (this.results_loaded == true) {
        let user_id = this.app.browser.returnURLParameter("user_id");
        let tweet_id = this.app.browser.returnURLParameter("tweet_id");
        if (user_id != "" || tweet_id != "") {
          return;
        }
      }
    }
  }

  //
  // this initializes the DOM but does not necessarily show the loaded content
  // onto the page, as we are likely being asked to render the components on
  // the application BEFORE we have any peers capable of feeding us content.
  //
  async render() {
    if (this.app.BROWSER == 1) {
      if (this.app.options.theme) {
        let theme = this.app.options.theme[this.slug];
        if (theme != null) {
          this.app.browser.switchTheme(theme);
        }
      }
    }

    if (this.main == null) {
      this.main = new SaitoMain(this.app, this);
      this.header = new SaitoHeader(this.app, this);
      this.menu = new SaitoMenu(this.app, this, ".saito-sidebar.left");
      this.sidebar = new RedSquareSidebar(this.app, this, ".saito-sidebar.right");

      this.addComponent(this.header);
      this.addComponent(this.main);
      this.addComponent(this.menu);
      this.addComponent(this.sidebar);

      //
      // chat manager can insert itself into left-sidebar if exists
      //
      for (const mod of await this.app.modules.returnModulesRespondingTo("chat-manager")) {
        let cm = await mod.respondTo("chat-manager");
        cm.container = ".saito-sidebar.left";
        this.addComponent(cm);
      }
    }

    await super.render();

    //
    // check if hash component exists
    //
    let hash = this.app.browser.returnHashAndParameters();
    if (hash.hash) {
      if (hash.hash != "home") {
        this.app.connection.emit("redsquare-component-render-request", hash);
        return;
      }
    }

    //
    // if our browser has loaded cached tweets through a direct
    // download they will be in our tweets object and we can load
    // them dynamically.
    //
    // this runs after components are rendered or it breaks/fails
    //
    try {
      if (this.app.browser.returnURLParameter("tweet_id")) {
        return;
      }
      if (this.app.browser.returnURLParameter("user_id")) {
        return;
      }
      for (let z = 0; z < tweets.length; z++) {
        let newtx = Transaction.deserialize(tweets[z], new Factory());

        // newtx.deserialize_from_web(this.app, tweets[z]);
        await this.addTweet(newtx, true, true); // prepend and render ?
      }
      this.app.connection.emit("redsquare-home-render-request");
    } catch (err) {
      console.log("error in initial redsquare post fetch: " + err);
    }
  }

  ///////////////////////
  // network functions //
  ///////////////////////
  async onConfirmation(blk, tx, conf, app) {
    let txmsg = tx.returnMessage();
    try {
      if (conf == 0) {
        if (txmsg.request === "create tweet") {
          await this.receiveTweetTransaction(blk, tx, conf, app);
          this.sqlcache = {};
        }
        if (txmsg.request === "like tweet") {
          await this.receiveLikeTransaction(blk, tx, conf, app);
          this.sqlcache = {};
        }
        if (txmsg.request === "flag tweet") {
          await this.receiveFlagTransaction(blk, tx, conf, app);
          this.sqlcache = {};
        }
      }
    } catch (err) {
      console.log("ERROR in " + this.name + " onConfirmation: " + err);
    }
  }

  //
  // fetch tweets / notifications middleware
  //
  // when we need more tweets or notifications, we can ask these functions, they
  // keep track of which peers have given us content in the past and simply ask
  // them for more data.
  //
  loadProfile(publickey) {
    for (let i = 0; i < this.peers_for_tweets.length; i++) {
      let sql = `SELECT *
                 FROM tweets
                 WHERE flagged IS NOT 1
                   AND moderated IS NOT 1
                   AND publickey = '${publickey}'
                 ORDER BY created_at DESC;`;
      let peer = this.peers_for_tweets[i];
      this.loadTweetsFromPeerWithoutAdding(peer, sql, publickey, (txs) => {
        if (!this.profile[publickey]) {
          this.profile[publickey] = [];
        }
        for (let z = 0; z < txs.length; z++) {
          this.profile[publickey].push(txs[z]);
        }
        this.app.connection.emit("redsquare-profile-render-request", publickey);
      });
    }
  }

  loadChildrenOfTweet(sig, mycallback = null) {
    if (this.peers_for_tweets.length == 0) {
      return;
    }
    if (mycallback == null) {
      return;
    }

    let x = [];
    let sql = `SELECT *
               FROM tweets
               WHERE parent_id = '${sig}'
               ORDER BY created_at DESC`;
    //this.loadTweetsFromPeerAndReturn(this.peers_for_tweets[0], sql, (txs) => {
    this.loadTweetsFromPeer(this.peers_for_tweets[0], sql, (txs) => {
      for (let z = 0; z < txs.length; z++) {
        let tweet = new Tweet(this.app, this, ".redsquare-appspace-body", txs[z]);
        x.push(tweet);
      }
      mycallback(x);
      return;
    });
  }

  loadTweetWithSig(sig, mycallback = null) {
    if (this.peers_for_tweets.length == 0) {
      return;
    }
    if (mycallback == null) {
      return;
    }

    let t = this.returnTweet(sig);
    if (t != null) {
      mycallback(t);
      return;
    }

    let sql = `SELECT *
               FROM tweets
               WHERE sig = '${sig}'
               ORDER BY created_at DESC`;
    this.loadTweetsFromPeer(this.peers_for_tweets[0], sql, (txs) => {
      this.loadTweetsFromPeerAndReturn(
        this.peers_for_tweets[0],
        sql,
        (txs) => {
          for (let z = 0; z < txs.length; z++) {
            let tweet = new Tweet(this.app, this, ".redsquare-appspace-body", txs[z]);
            mycallback(tweet);
          }
        },
        false,
        false
      );
    });
  }

  loadTweetsWithParentId(sig, mycallback = null) {
    if (this.peers_for_tweets.length == 0) {
      return;
    }
    if (mycallback == null) {
      return;
    }

    let t = this.returnTweet(sig);
    if (t != null) {
      let x = [];
      for (let z = 0; z < t.children.length; z++) {
        x.push(t.children[z]);
      }
      mycallback(x);
      return;
    }

    let sql = `SELECT *
               FROM tweets
               WHERE parent_id = '${sig}'
               ORDER BY created_at DESC`;
    //this.loadTweetsFromPeerAndReturn(mod.peers_for_tweets[0], sql, (txs) => {
    this.loadTweetsFromPeer(mod.peers_for_tweets[0], sql, (txs) => {
      let x = [];
      //this.loadTweetsFromPeerAndReturn(peer, sql, (txs) => {
      this.loadTweetsFromPeer(
        peer,
        sql,
        (txs) => {
          for (let z = 0; z < txs.length; z++) {
            let tweet = new Tweet(this.app, mod, ".redsquare-appspace-body", txs[z]);
            x.push(tweet);
          }
          mycallback(x);
        },
        false,
        false
      );
    });
  }

  loadMoreTweets(post_load_tweet_callback = null) {
    this.increment_for_tweets++;
    let pre_existing_tweets_on_page = this.tweets.length;
    let loaded_tweets = false;
    for (let i = 0; i < this.peers_for_tweets.length; i++) {
      let peer = this.peers_for_tweets[i];
      let sql = `SELECT *
                 FROM tweets
                 WHERE parent_id = ""
                   AND flagged IS NOT 1
                   AND moderated IS NOT 1
                   AND tx_size < 10000000
                 ORDER BY updated_at DESC LIMIT '${
                   this.results_per_page * this.increment_for_tweets - 1
                 }','${this.results_per_page}'`;
      this.loadTweetsFromPeer(peer, sql, (txs) => {
        if (txs.length > 0) {
          let x = [];
          for (let z = 0; z < txs.length; z++) {
            let tweet = new Tweet(this.app, this, ".redsquare-appspace-body", txs[z]);
            this.app.connection.emit("redsquare-home-tweet-append-render-request", tweet);
          }
        }
        if (txs.length > 0) {
          loaded_tweets = true;
        }
        if (post_load_tweet_callback) {
          post_load_tweet_callback();
        }
      });
    }
    if (this.tweets.length <= pre_existing_tweets_on_page && loaded_tweets == true) {
      this.loadMoreTweets(post_load_tweet_callback);
      return;
    }
  }

  loadMoreNotifications() {
    this.increment_for_notifications++;
    let pre_existing_notifications = this.notifications.length;
    let loaded_notifications = false;
    for (let i = 0; i < this.peers_for_notifications.length; i++) {
      let peer = this.peers_for_notifications[i];
      this.loadNotificationsFromPeer(peer, this.increment_for_notifications, () => {
        if (this.notifications.length > pre_existing_notifications) {
          loaded_notifications = true;
        }
        let hash = this.app.browser.returnHashAndParameters();
        if (hash) {
          if (hash.hash === "notifications") {
            this.app.connection.emit("redsquare-home-notifications-render-request");
          }
        }
      });
    }
  }

  loadNotificationsFromPeer(peer, increment = 1, post_load_callback = null) {
    this.app.storage.loadTransactionsFromPeer("RedSquare", 10 * increment, peer, async (txs) => {
      if (!this.peers_for_notifications.includes(peer)) {
        this.peers_for_notifications.push(peer);
      }
      for (let i = 0; i < txs.length; i++) {
        txs[i].decryptMessage(this.app);
        await this.addTweet(txs[i], false, false);
      }
      if (post_load_callback != null) {
        post_load_callback();
      }
    });
  }

  trackTweet(tweet) {
    this.trackedTweet = tweet;
  }

  loadTweetsFromPeerAndReturn(
    peer,
    sql,
    post_load_callback = null,
    to_track_tweet = false,
    is_server_request = false
  ) {
    let txs = [];
    let tweet_to_track = null;

    this.sendPeerDatabaseRequestWithFilter(
      "RedSquare",
      sql,
      async (res) => {
        if (res.rows) {
          tweet_to_track = res.rows[0];

          if (!this.peers_for_tweets.includes(peer)) {
            this.peers_for_tweets.push(peer);
          }
          res.rows.forEach((row) => {
            let tx = Transaction.deserialize(row.tx, new Factory());
            // tx.deserialize_from_web(this.app, row.tx);
            if (!tx.optional) {
              tx.optional = {};
            }
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
            } catch (err) {}
            // this will render the event
            txs.push(tx);
          });
        }
        if (post_load_callback != null) {
          post_load_callback(txs, tweet_to_track);
        }
      },
      (p) => {
        if (p == peer) {
          return 1;
        }
        return 0;
      }
    );
  }

  loadTweetsFromPeer(
    peer,
    sql,
    post_load_callback = null,
    to_track_tweet = false,
    is_server_request = false
  ) {
    let txs = [];
    this.loadTweetsFromPeerAndReturn(
      peer,
      sql,
      async (txs, tweet_to_track = null) => {
        if (to_track_tweet) {
          if (tweet_to_track) {
            this.trackTweet(tweet_to_track);
          }
        }
        for (let z = 0; z < txs.length; z++) {
          await this.addTweet(txs[z]);
        }
        if (post_load_callback != null) {
          post_load_callback(txs);
        }
      },
      to_track_tweet,
      is_server_request
    );
  }

  //
  // adding tweets and notifications
  //
  // all tweets and notifications are added as transactions. this function examines the
  // tweet-tree ( this.tweets ) and inserts the transaction into the appropriate spot so
  // that when specific tweets are rendered their children will also display as wanted.
  //
  // notifications are added through this function.
  //
  async addTweet(tx, prepend = false, render = true) {
    //
    // create the tweet
    //
    let tweet = new Tweet(this.app, this, "", tx);

    tweet.updated_at = tx.timestamp;

    let is_notification = 0;

    //
    // maybe this needs to go into notifications too
    //
    if (tx.isTo(this.publicKey)) {
      //
      // this is a notification, so update our timestamps
      //
      if (tx.timestamp > this.notifications_newest_ts) {
        this.notifications_newest_ts = tx.timestamp;
      }
      if (tx.timestamp < this.notifications_oldest_ts) {
        this.notifications_oldest_ts = tx.timestamp;
      }
      //
      // notify of other people's actions, but not ours
      //
      if (!tx.isFrom(this.publicKey)) {
        let insertion_index = 0;
        if (prepend == false) {
          for (let i = 0; i < this.notifications.length; i++) {
            if (this.notifications[i].updated_at > tweet.updated_at) {
              insertion_index++;
              break;
            } else {
              insertion_index++;
            }
          }
        }

        is_notification = 1;
        this.notifications.splice(insertion_index, 0, tweet);
        this.notifications_sigs_hmap[tweet.tx.signature] = 1;

        //
        // increment notifications in menu unless is our own
        //
        if (tx.timestamp > this.notifications_last_viewed_ts) {
          this.notifications_number_unviewed = this.notifications_number_unviewed + 1;
          this.menu.incrementNotifications("notifications", this.notifications_number_unviewed);
        }
      }

      //
      // if this is a like, we can avoid adding it to our tweet index
      //
      let txmsg = tx.returnMessage();
      if (txmsg.request === "like tweet") {
        //
        // skip out on likes but still update timestamps
        //
        if (tx.timestamp > this.tweets_newest_ts) {
          this.tweets_newest_ts = tx.timestamp;
        }
        if (tx.timestamp < this.notifications_oldest_ts) {
          this.tweets_oldest_ts = tx.timestamp;
        }
        return;
      }
    }

    //
    // if this is a like, we can avoid adding it to our tweet index
    //
    let txmsg = tx.returnMessage();
    if (txmsg.request === "like tweet") {
      return;
    }

    //
    // add tweet to tweet and tweets_sigs_hmap for easy-reference
    //
    //
    // this is a post
    //
    if (tweet.parent_id === "") {
      //
      // we do not have this tweet indexed, it's new
      //
      if (!this.tweets_sigs_hmap[tweet.tx.signature]) {
        //
        // check where we insert the tweet
        //
        let insertion_index = 0;
        if (prepend == false) {
          for (let i = 0; i < this.tweets.length; i++) {
            if (this.tweets[i].updated_at > tweet.updated_at) {
              insertion_index++;
              break;
            } else {
              //insertion_index++;
            }
          }
        }

        //
        // add unknown children if possible
        //
        for (let i = 0; i < this.unknown_children.length; i++) {
          if (this.unknown_children[i].thread_id === tweet.tx.signature) {
            if (this.tweets[insertion_index].addTweet(this.unknown_children[i]) == 1) {
              this.unknown_children.splice(i, 1);
              i--;
            }
          }
        }

        //
        // and insert it
        //
        this.tweets.splice(insertion_index, 0, tweet);
        this.tweets_sigs_hmap[tweet.tx.signature] = 1;
      } else {
        for (let i = 0; i < this.tweets.length; i++) {
          if (this.tweets[i].tx.signature === tweet.tx.signature) {
            this.tweets[i].num_replies = tweet.num_replies;
            this.tweets[i].num_retweets = tweet.num_retweets;
            this.tweets[i].num_likes = tweet.num_likes;
          }
        }
      }

      //
      // this is a comment
      //
    } else {
      let inserted = false;

      for (let i = 0; i < this.tweets.length; i++) {
        if (this.tweets[i].tx.signature === tweet.thread_id) {
          if (this.tweets[i].addTweet(tweet) == 1) {
            this.tweets_sigs_hmap[tweet.tx.signature] = 1;
            inserted = true;
            break;
          }
        }
      }

      if (inserted == false) {
        this.unknown_children.push(tweet);
      }
    }

    //
    // this is a tweet, so update our info
    //
    if (is_notification == 0) {
      if (tx.timestamp > this.tweets_newest_ts) {
        this.tweets_newest_ts = tx.timestamp;
      }
      if (tx.timestamp < this.notifications_oldest_ts) {
        this.tweets_oldest_ts = tx.timestamp;
      }
    }

    //
    // only render if asked
    //
    if (render == true) {
      this.app.connection.emit("redsquare-tweet-added-render-request", tweet);
    }
  }

  returnTweet(tweet_sig = null) {
    if (tweet_sig == null) {
      return null;
    }
    if (!this.tweets_sigs_hmap[tweet_sig]) {
      return null;
    }

    for (let i = 0; i < this.tweets.length; i++) {
      if (this.tweets[i].tx.signature === tweet_sig) {
        return this.tweets[i];
      }
      if (this.tweets[i].hasChildTweet(tweet_sig)) {
        return this.tweets[i].returnChildTweet(tweet_sig);
      }
    }

    return null;
  }

  //   addNotification(app, mod, tx) {
  //     if (tx.transaction.from[0].add === app.wallet.returnPublicKey()) {
  //       return;
  //     }
  //     if (tx.timestamp > this.notifications_last_viewed_ts) {
  //       this.notifications_number_unviewed++;

  //     //   this.app.connection.emit("redsquare-notifications-render-request", { menu: "notifications", num: this.notifications_number_unviewed });
  //     // }
  //     if (this.ntfs.length == 0) {
  //       this.ntfs.push(tx);
  //       console.log('notifications ', this.ntfs)
  //       return;
  //     }
  //     for (let i = 0; i < this.ntfs.length; i++) {
  //       if (this.ntfs[i].timestamp < tx.timestamp) {
  //         this.ntfs.splice(i, 0, tx);
  //         return;
  //       }
  //     }
  //     this.ntfs.push(tx);

  //   }
  // }

  async fetchOpenGraphProperties(app, mod, link) {
    if (app.BROWSER != 1) {
      // fetch source code for link inside tweet
      // (sites which uses firewall like Cloudflare shows Cloudflare loading
      //  page when fetching page source)
      //
      try {
        return fetch(link)
          .then((res) => res.text())
          .then((data) => {
            console.log("fetched link now processing...");

            // required og properties for link preview
            let og_tags = {
              "og:exists": false,
              "og:title": "",
              "og:description": "",
              "og:url": "",
              "og:image": "",
              "og:site_name": "",
            };

            // prettify html - unminify html if minified
            let html = prettify(data);

            // parse string html to DOM html
            let dom = HTMLParser.parse(html);

            // fetch meta element for og tags
            let meta_tags = dom.getElementsByTagName("meta");

            // loop each meta tag and fetch required og properties
            for (let i = 0; i < meta_tags.length; i++) {
              let property = meta_tags[i].getAttribute("property");
              let content = meta_tags[i].getAttribute("content");
              // get required og properties only, discard others
              if (property in og_tags) {
                og_tags[property] = content;
                og_tags["og:exists"] = true;
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

  async sendLikeTransaction(app, mod, data, tx = null) {
    let redsquare_self = this;

    let obj = {
      module: redsquare_self.name,
      request: "like tweet",
      data: {},
    };
    for (let key in data) {
      obj.data[key] = data[key];
    }

    let newtx = await redsquare_self.app.wallet.createUnsignedTransaction();
    for (let i = 0; i < tx.to.length; i++) {
      if (tx.to[i].publicKey !== this.publicKey) {
        newtx.transaction.to.push(new saito.default.slip(tx.transaction.to[i].add, 0.0));
      }
    }

    newtx.msg = obj;
    await newtx.sign();
    await redsquare_self.app.network.propagateTransaction(newtx);
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
        await this.app.storage.saveTransaction(tx);

        //
        // save optional likes
        //
        let txmsg = tx.returnMessage();
        if (this.tweets_sigs_hmap[txmsg.data.sig]) {
          let tweet = this.returnTweet(txmsg.data.sig);
          if (tweet == null) {
            return;
          }
          let tx = tweet.tx;
          if (!tx.optional) {
            tx.optional = {};
          }
          if (!tx.optional.num_likes) {
            tx.optional.num_likes = 0;
          }
          tx.optional.num_likes++;
          await this.app.storage.updateTransactionOptional(
            txmsg.data.sig,
            app.wallet.returnPublicKey(),
            tx.optional
          );
          tweet.renderLikes();
        } else {
          await this.app.storage.incrementTransactionOptionalValue(txmsg.data.sig, "num_likes");
        }

        //
        // convert like into tweet and addTweet to get notifications working
        //
        await this.addTweet(tx, true);
      }

      return;
    }

    //
    // servers
    //
    let txmsg = tx.returnMessage();
    let sql = `UPDATE tweets
               SET num_likes = num_likes + 1
               WHERE sig = $sig`;
    let params = {
      $sig: txmsg.data.sig,
    };
    await app.storage.executeDatabase(sql, params, "redsquare");

    //
    // update cache
    //
    await this.updateTweetsCacheForBrowsers();

    return;
  }

  async sendTweetTransaction(app, mod, data, keys = []) {
    let redsquare_self = this;

    let obj = {
      module: redsquare_self.name,
      request: "create tweet",
      data: {},
    };
    for (let key in data) {
      obj.data[key] = data[key];
    }

    let newtx = await redsquare_self.app.wallet.createUnsignedTransaction();
    newtx.msg = obj;
    for (let i = 0; i < keys.length; i++) {
      if (keys[i] !== app.wallet.returnPublicKey()) {
        newtx.transaction.to.push(new saito.default.slip(keys[i]));
      }
    }
    await newtx.sign();
    await redsquare_self.app.network.propagateTransaction(newtx);
    return newtx;
  }

  async receiveTweetTransaction(blk, tx, conf, app) {
    try {
      let tweet = new Tweet(app, this, "", tx);
      let txmsg = tx.returnMessage();

      //
      // browsers
      //
      if (app.BROWSER == 1) {
        //
        // save tweets addressed to me
        //
        if (tx.isTo(app.wallet.returnPublicKey())) {
          await this.app.storage.saveTransaction(tx);

          //
          // if replies
          //
          if (txmsg.data?.parent_id) {
            if (this.tweets_sigs_hmap[txmsg.data.parent_id]) {
              let tweet = this.returnTweet(txmsg.data.parent_id);
              if (tweet == null) {
                return;
              }
              if (!tweet.tx.optional) {
                tweet.tx.optional = {};
              }
              if (!tweet.tx.optional.num_replies) {
                tweet.tx.optional.num_replies = 0;
              }
              tx.optional.num_replies++;
              await this.app.storage.updateTransactionOptional(
                txmsg.data.parent_id,
                app.wallet.returnPublicKey(),
                tweet.tx.optional
              );
              tweet.renderReplies();
            } else {
              await this.app.storage.incrementTransactionOptionalValue(
                txmsg.data.parent_id,
                "num_replies"
              );
            }
          }

          //
          // if retweets
          //
          if (txmsg.data?.retweet_tx) {
            if (txmsg.data?.retweet_tx) {
              let rtx = new saito.default.transaction();
              rtx.deserialize_from_web(this.app, txmsg.data.retweet_tx);
              let rtxsig = rtxobj.sig;

              if (this.tweets_sigs_hmap[rtxsig]) {
                let tweet2 = this.returnTweet(rtxsig);
                if (tweet2 == null) {
                  return;
                }
                let tx = tweet2.tx;
                if (!tx.optional) {
                  tx.optional = {};
                }
                if (!tx.optional.num_retweets) {
                  tx.optional.num_retweets = 0;
                }
                tx.optional.num_retweets++;
                await this.app.storage.updateTransactionOptional(
                  rtxsig,
                  app.wallet.returnPublicKey(),
                  tx.optional
                );
                tweet2.renderRetweets();
              } else {
                await this.app.storage.incrementTransactionOptionalValue(rtxsig, "num_retweets");
              }
            }
          }
        }

        await this.addTweet(tx, 1);
        return;
      }

      //
      // servers
      //
      // fetch supporting link properties
      //
      console.log("SERVER FETCHING OPEN GRAPH PROPERTIES!");
      console.log("this is for: " + tweet.text);
      tweet = await tweet.generateTweetProperties(app, this, 1);
      console.log("DONE: " + JSON.stringify(tweet.link_properties));

      let type_of_tweet = 0; // unknown
      if (txmsg.data?.parent_id) {
        type_of_tweet = 1; // reply
      }
      if (txmsg.data?.retweet_tx) {
        type_of_tweet = 2; // retweet
      }
      if (tweet.link != null) {
        type_of_tweet = 3; // link
      }
      if (tweet.images?.length > 0) {
        type_of_tweet = 4; // images
      }

      let created_at = tx.timestamp;
      let updated_at = tx.timestamp;

      //
      // insert the basic information
      //
      let sql = `INSERT INTO tweets (tx,
                                     sig,
                                     created_at,
                                     updated_at,
                                     parent_id,
                                     thread_id,
                                     type,
                                     publickey,
                                     link,
                                     link_properties,
                                     num_replies,
                                     num_retweets,
                                     num_likes,
                                     has_images,
                                     tx_size)
                 VALUES ($txjson,
                         $sig,
                         $created_at,
                         $updated_at,
                         $parent_id,
                         $thread_id,
                         $type,
                         $publickey,
                         $link,
                         $link_properties,
                         0,
                         0,
                         0,
                         $has_images,
                         $tx_size)`;

      let has_images = 0;
      if (typeof tweet.images != "undefined") {
        has_images = 1;
      }
      let txjson = tx.serialize_to_web(this.app);
      let tx_size = txjson.length;

      let params = {
        $txjson: txjson,
        $sig: tx.signature,
        $created_at: created_at,
        $updated_at: updated_at,
        $parent_id: tweet.parent_id,
        $type: type_of_tweet,
        $thread_id: tweet.thread_id,
        $publickey: tx.from[0].publicKey,
        $link: tweet.link,
        $link_properties: JSON.stringify(tweet.link_properties),
        $has_images: has_images,
        $tx_size: tx_size,
      };

      console.log("ABOUT TO INSERT!");

      await app.storage.executeDatabase(sql, params, "redsquare");

      let ts = new Date().getTime();
      let sql2 = "UPDATE tweets SET updated_at = $timestamp WHERE sig = $sig";
      let params2 = {
        $timestamp: ts,
        $sig: tweet.thread_id,
      };
      await app.storage.executeDatabase(sql2, params2, "redsquare");

      if (tweet.retweet_tx != null) {
        let ts = new Date().getTime();
        let sql3 = "UPDATE tweets SET num_retweets = num_retweets + 1 WHERE sig = $sig";
        let params3 = {
          $sig: tweet.thread_id,
        };
        await app.storage.executeDatabase(sql3, params3, "redsquare");
      }

      if (tweet.parent_id !== tweet.tx.signature && tweet.parent_id !== "") {
        let ts = new Date().getTime();
        let sql4 = "UPDATE tweets SET num_replies = num_replies + 1 WHERE sig = $sig";
        let params4 = {
          $sig: tweet.parent_id,
        };
        await app.storage.executeDatabase(sql4, params4, "redsquare");
      }

      //
      // update cache
      //
      await this.updateTweetsCacheForBrowsers();

      this.sqlcache = [];

      return;
    } catch (err) {
      console.log("ERROR in receiveTweetsTransaction() in RedSquare: " + err);
    }
  }

  //
  // writes the latest 10 tweets to tweets.js
  //
  async updateTweetsCacheForBrowsers() {
    let hex_entries = [];

    let sql = `SELECT *
               FROM tweets
               WHERE (flagged IS NOT 1 AND moderated IS NOT 1)
                 AND (((num_replies > 0 OR num_likes > 0) AND parent_id IS NOT "") OR (parent_id IS ""))
                 AND (sig IN (SELECT sig
                              FROM tweets
                              WHERE parent_id = ""
                                AND flagged IS NOT 1
                                AND moderated IS NOT 1
                                AND tx_size < 10000000
                              ORDER BY updated_at DESC LIMIT 10)
                   ) OR (thread_id IN (SELECT sig FROM tweets WHERE parent_id = "" AND flagged IS NOT 1 AND moderated IS NOT 1 AND tx_size < 10000000 ORDER BY updated_at DESC LIMIT 10))
               ORDER BY created_at ASC LIMIT 20`;
    let params = {};
    let rows = await this.app.storage.queryDatabase(sql, params, "redsquare");

    for (let i = 0; i < rows.length; i++) {
      //
      // create the transaction
      //
      let tx = new saito.default.transaction();
      tx.deserialize_from_web(this.app, rows[i].tx);
      tx.optional.num_replies = rows[i].num_replies;
      tx.optional.num_retweets = rows[i].num_retweets;
      tx.optional.num_likes = rows[i].num_likes;
      tx.optional.flagged = rows[i].flagged;
      let hexstring = tx.serialize_to_web(this.app);
      hex_entries.push(hexstring);
    }

    /*****
     //
     // get the parent posts
     //
     let sql = `SELECT * FROM tweets WHERE flagged IS NOT 1 AND moderated IS NOT 1 AND tx_size < 1400000 AND tx_size > 1500 AND parent_id = "" ORDER BY updated_at DESC LIMIT 4`;
     let params = {};
     let rows = await this.app.storage.queryDatabase(sql, params, "redsquare");

     for (let i = 0; i < rows.length; i++) {

          //
          // create the transaction
          //
          let tx = new saito.default.transaction();
          tx.deserialize_from_web(this.app, rows[i].tx);

    let txmsg = tx.returnMessage();
    console.log("TX: ");
    console.log(rows[i].tx.msg);

          tx.optional.num_replies = rows[i].num_replies;
          tx.optional.num_retweets = rows[i].num_retweets;
          tx.optional.num_likes = rows[i].num_likes;
          tx.optional.flagged = rows[i].flagged;
          let hexstring = tx.serialize_to_web(this.app);
          hex_entries.push(hexstring);

        }

     //
     // get the most engaging children
     //
     for (let z = 0; z < rows.length; z++) {

          //
          // fetch best child
          //
          let sql2 = `SELECT * FROM tweets WHERE flagged IS NOT 1 AND moderated IS NOT 1 AND tx_size < 1400000 AND tx_size > 1500 AND parent_id = $parent_id ORDER BY num_likes, num_replies DESC LIMIT 1`;
          let params2 = {
            $parent_id : rows[i].sig
          };
          let rows2 = await this.app.storage.queryDatabase(sql2, params2, "redsquare");

          for (let ii = 0; ii < rows.length; ii++) {

            //
            // create the transaction
            //
            let tx = new saito.default.transaction();
            tx.deserialize_from_web(this.app, rows[ii].tx);
            tx.optional.num_replies = rows[ii].num_replies;
            tx.optional.num_retweets = rows[ii].num_retweets;
            tx.optional.num_likes = rows[ii].num_likes;
            tx.optional.flagged = rows[ii].flagged;
            let hexstring = tx.serialize_to_web(this.app);
            hex_entries.push(hexstring);

          }

        }
     *****/

    try {
      let path = this.app.storage.returnPath();
      if (!path) {
        return;
      }

      const filename = path.join(__dirname, "web/tweets.");
      let fs = this.app.storage.returnFileSystem();
      let html = `if (!tweets) { var tweets = [] };`;
      if (fs != null) {
        for (let i = 0; i < hex_entries.length; i++) {
          let thisfile = filename + i + ".js";
          const fd = fs.openSync(thisfile, "w");
          html += `  tweets.push(\`${hex_entries[i]}\`);   `;
          fs.writeSync(fd, html);
          fs.fsyncSync(fd);
          fs.closeSync(fd);
          html = "";
        }
      }
    } catch (err) {
      console.error("ERROR 2832329: error tweet cache to disk. ", err);
    }
    return "";
  }

  async sendFlagTransaction(app, mod, data) {
    let redsquare_self = this;

    let obj = {
      module: redsquare_self.name,
      request: "flag tweet",
      data: {},
    };
    for (let key in data) {
      obj.data[key] = data[key];
    }

    let newtx = await redsquare_self.app.wallet.createUnsignedTransaction();
    newtx.msg = obj;
    await newtx.sign();
    await redsquare_self.app.network.propagateTransaction(newtx);

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
    let sql = `UPDATE tweets
               SET flagged = 1
               WHERE sig = $sig`;
    let params = {
      $sig: txmsg.data.sig,
    };
    await app.storage.executeDatabase(sql, params, "redsquare");

    this.sqlcache = [];

    //
    // update cache
    //
    await this.updateTweetsCacheForBrowsers();
  }

  /////////////////////////////////////
  // saving and loading wallet state //
  /////////////////////////////////////
  load() {
    if (this.app.options.redsquare) {
      this.redsquare = this.app.options.redsquare;
      this.notifications_last_viewed_ts = this.redsquare.notifications_last_viewed_ts;
      this.notifications_number_unviewed = this.redsquare.notifications_number_unviewed;
    } else {
      this.redsquare = {};
      this.notifications_last_viewed_ts = new Date().getTime();
      this.notifications_number_unviewed = 0;
      this.save();
    }
  }

  save() {
    this.redsquare.notifications_last_viewed_ts = this.notifications_last_viewed_ts;
    this.redsquare.notifications_number_unviewed = this.notifications_number_unviewed;
    this.app.options.redsquare = this.redsquare;
    this.app.storage.saveOptions();
  }

  webServer(app, expressapp, express) {
    let webdir = `${__dirname}/../../mods/${this.dirname}/web`;
    let fs = app?.storage?.returnFileSystem();
    let redsquare_self = this;

    expressapp.get("/" + encodeURI(this.returnSlug()), async function (req, res) {
      let reqBaseURL = req.protocol + "://" + req.headers.host + "/";

      try {
        if (Object.keys(req.query).length > 0) {
          let query_params = req.query;

          if (
            typeof query_params.tweet_id != "undefined" ||
            typeof query_params.thread_id != "undefined"
          ) {
            let sig = query_params.tweet_id || query_params.thread_id;
            let sql = `SELECT *
                       FROM tweets
                       WHERE sig = '${sig}'
                       ORDER BY created_at DESC`;
            let rows = await app.storage.queryDatabase(sql, {}, "redsquare");

            for (let i = 0; i < rows.length; i++) {
              let tx = new saito.default.transaction();
              tx.deserialize_from_web(app, rows[i].tx);
              let txmsg = tx.returnMessage();
              let text = txmsg.data.text;
              let publickey = tx.from[0].publicKey;
              let user = app.keychain.returnIdentifierByPublicKey(publickey, true);

              redsquare_self.social.twitter_description = text;
              redsquare_self.social.og_description = text;
              redsquare_self.social.og_url = reqBaseURL + encodeURI(redsquare_self.returnSlug());

              // if (typeof tx.msg.data.images != "undefined") {
              //   let image = tx.msg.data?.images[0];
              // } else {
              //   let publickey = tx.transaction.from[0].add;
              //   let image = app.keychain.returnIdenticon(publickey);
              // }

              let image = (redsquare_self.social.og_url =
                reqBaseURL + encodeURI(redsquare_self.returnSlug()) + "?og_img_sig=" + sig);
              redsquare_self.social.og_title = user + " posted on Saito 🟥";
              redsquare_self.social.twitter_title = user + " posted on Saito 🟥";
              redsquare_self.social.og_image = image;
              redsquare_self.social.og_image_url = image;
              redsquare_self.social.og_image_secure_url = image;
              redsquare_self.social.twitter_image = image;
            }
          }

          if (typeof query_params.og_img_sig != "undefined") {
            console.info(query_params.og_img_sig);

            let sig = query_params.og_img_sig;
            let sql = `SELECT *
                       FROM tweets
                       WHERE sig = '${sig}'
                       ORDER BY created_at DESC`;

            let rows = await app.storage.queryDatabase(sql, {}, "redsquare");
            console.info(rows.length);
            for (let i = 0; i < rows.length; i++) {
              let tx = new saito.default.transaction();
              tx.deserialize_from_web(redsquare_self.app, rows[i].tx);
              //console.info(rows[i]);
              let txmsg = tx.returnMessage();
              console.info(txmsg);
              if (typeof txmsg.data.images != "undefined") {
                let img_uri = txmsg.data?.images[0];
                let img_type = img_uri.substring(img_uri.indexOf(":") + 1, img_uri.indexOf(";"));
                let base64Data = img_uri.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
                let img = Buffer.from(base64Data, "base64");
              } else {
                let publickey = tx.from[0].publicKey;
                let img_uri = app.keychain.returnIdenticon(publickey, "png");
                let base64Data = img_uri.replace(/^data:image\/png;base64,/, "");
                let img = Buffer.from(base64Data, "base64");
                let img_type = img_uri.substring(img_uri.indexOf(":") + 1, img_uri.indexOf(";"));
              }

              if (img_type == "image/svg+xml") {
                img_type = "image/svg";
              }

              console.info("### write from 1229 of redsquare.js");
              res.writeHead(200, {
                "Content-Type": img_type,
                "Content-Length": img.length,
              });
              res.end(img);
              return;
            }
          }
        }
      } catch (err) {
        console.log("Loading OG data failed with error: " + err);
      }
      console.info("### write from line 1242 of server.ts.");
      res.setHeader("Content-type", "text/html");
      res.charset = "UTF-8";
      res.send(redsquareHome(app, redsquare_self));
      return;
    });

    expressapp.use("/" + encodeURI(this.returnSlug()), express.static(webdir));
  }

  //  returnFirstNonVisibleTweet() {
  //
  //  }
}

module.exports = RedSquare;
