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

const SaitoLoginOverlay = require("../../lib/saito/ui/saito-login-overlay/saito-login-overlay");

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
    this.tweet_fetch_interval = 3000;
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
    this.increment_for_tweets = 1;
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

  /////////////////////////////////
  // inter-module communications //
  /////////////////////////////////
  respondTo(type = "") {
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
      let m = [
        {
          text: "Home",
          icon: "fa-solid fa-house",
          allowed_mods: ["redsquare"],
          callback: function (app, id) {
            window.location = "/redsquare";
          },
        },
        {
          text: "Notifications",
          icon: "fas fa-bell",
          allowed_mods: ["redsquare"],
          callback: function (app, id) {
            window.location = "/redsquare#notifications";
          },
        },
      ];
      return m;
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
  initialize(app) {
    let redsquare_self = app.modules.returnModule("RedSquare");
    super.initialize(app);

    //
    // fetch content from options file
    //
    this.load();

    //
    // fetch content from local archive
    //
    this.tweets_last_viewed_ts = new Date().getTime();
    app.storage.loadTransactionsFromLocal("RedSquare", 50 * 1, (txs) => {
      for (let i = 0; i < txs.length; i++) {
        this.addTweet(tx);
      }
    });

    let tweet_fetch_interval = 3000;

    setInterval(function () {
      // if (redsquare_self.viewing == "feed") {
      // console.log('loading new tweets')
      // redsquare_self.loadNewTweets(app, redsquare_self);
      // }
    }, 3000);
  }

  //
  // runs when archive peer connects
  //
  async onServiceUp(app, peer, service = {}) {
    //
    // avoid network overhead if in other apps
    //
    if (!this.browser_active) {
      return;
    }

    //
    // archive -- load our own tweets
    //
    if (service.service === "archive") {
      this.loadNotificationsFromPeer(peer);
    }

    //
    // registry -- load DNS names
    //
    if (service.service === "registry") {
      this.app.browser.addIdentifiersToDom();
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
      let tweet_id = app.browser.returnURLParameter("tweet_id");
      if (tweet_id != "") {
        let sql = `SELECT *
                   FROM tweets
                   WHERE sig = '${tweet_id}'
                      OR parent_id = '${tweet_id}'`;
        this.loadTweetsFromPeerAndReturn(
          peer,
          sql,
          (txs) => {
            this.results_loaded = true;
            for (let z = 0; z < txs.length; z++) {
              let tweet = new Tweet(app, mod, ".redsquare-home", txs[z]);
              app.connection.emit("redsquare-thread-render-request", tweet);
            }
          },
          false,
          false
        );
        return;
      }

      //
      // render user profile
      //
      let user_id = app.browser.returnURLParameter("user_id");
      if (user_id != "") {
        this.app.connection.emit("redsquare-profile-render-request", user_id);
        this.results_loaded = true;
        return;
      }
    } else {
      if (this.results_loaded == true) {
        let user_id = app.browser.returnURLParameter("user_id");
        let tweet_id = app.browser.returnURLParameter("tweet_id");
        if (user_id != "" || tweet_id != "") {
          return;
        }
      }
    }

    //
    // check peer for any tweets they want to send us
    //
    let sql = `SELECT *
               FROM tweets
               WHERE flagged IS NOT 1
                 AND moderated IS NOT 1
                 AND tx_size < 10000000
               ORDER BY updated_at DESC LIMIT 0,'${this.results_per_page}'`;

    this.loadTweetsFromPeer(
      peer,
      sql,
      () => {
        this.app.connection.emit("redsquare-home-render-request");
        this.app.browser.addIdentifiersToDom();
        this.app.connection.emit("registry-fetch-identifiers-and-update-dom", {});
      },
      true
    );
  }

  //
  // this initializes the DOM but does not necessarily show the loaded content
  // onto the page, as we are likely being asked to render the components on
  // the application BEFORE we have any peers capable of feeding us content.
  //
  render() {
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
      this.app.modules.returnModulesRespondingTo("chat-manager").forEach((mod) => {
        let cm = mod.respondTo("chat-manager");
        cm.container = ".saito-sidebar.left";
        this.addComponent(cm);
      });
    }

    super.render();
  }

  ///////////////////////
  // network functions //
  ///////////////////////
  async onConfirmation(blk, tx, conf, app) {
    let txmsg = tx.returnMessage();
    try {
      if (conf == 0) {
        if (txmsg.request === "create tweet") {
          this.receiveTweetTransaction(blk, tx, conf, app);
          this.sqlcache = {};
        }
        if (txmsg.request === "like tweet") {
          this.receiveLikeTransaction(blk, tx, conf, app);
          this.sqlcache = {};
        }
        if (txmsg.request === "flag tweet") {
          this.receiveFlagTransaction(blk, tx, conf, app);
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
                   AND publickey = '${publickey}';`;
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

  loadMoreTweets(post_load_tweet_callback = null) {
    this.increment_for_tweets++;
    for (let i = 0; i < this.peers_for_tweets.length; i++) {
      let peer = this.peers_for_tweets[i];
      let sql = `SELECT *
                 FROM tweets
                 WHERE flagged IS NOT 1
                   AND moderated IS NOT 1
                   AND tx_size < 10000000
                 ORDER BY updated_at DESC LIMIT '${
                   this.results_per_page * this.increment_for_tweets - 1
                 }','${this.results_per_page}'`;
      this.loadTweetsFromPeer(peer, sql, (tx) => {
        if (tx.length > 0) {
          this.app.connection.emit("redsquare-home-load-more-tweets-request");
        }
        if (post_load_tweet_callback) {
          post_load_tweet_callback();
        }
      });
    }
  }

  // loadNewTweets(app, mod) {
  //   let redsquare_self = app.modules.returnModule('RedSquare')
  //   console.log("Fetching New Posts");
  //   // if (!mod.trackedTweet) { return; }
  //   for (let i = 0; i < this.peers_for_tweets.length; i++) {
  //   let sql = `SELECT * FROM tweets WHERE (flagged IS NOT 1 OR moderated IS NOT 1) AND tx_size < 1000000 AND created_at > '${mod.trackedTweet.created_at}' ORDER BY updated_at DESC LIMIT 0,'${this.results_per_page}'`;

  //   let peer = this.peers_for_tweets[i];
  //   this.loadTweetsFromPeer(peer, sql, (tx) => {
  //      if(tx.length > 0){
  //           this.app.connection.emit("redsquare-show-load-tweet-banner");
  //      }
  //   }, true);
  // }
  // }

  loadMoreNotifications() {
    this.increment_for_notifications++;
    for (let i = 0; i < this.peers_for_notifications.length; i++) {
      let peer = this.peers_for_notifications[i];
      this.loadNotificationsFromPeer(peer, this.increment_for_notifications, () => {
        this.app.connection.emit("redsquare-notifications-render-request");
      });
    }
  }

  loadNotificationsFromPeer(peer, increment = 1, post_load_callback = null) {
    this.app.storage.loadTransactionsFromPeer("RedSquare", 50 * increment, peer, (txs) => {
      if (!this.peers_for_notifications.includes(peer)) {
        this.peers_for_notifications.push(peer);
      }
      for (let i = 0; i < txs.length; i++) {
        txs[i].decryptMessage(this.app);
        this.addTweet(txs[i]);
      }
      console.log("notificatoins added", this.notifications, this.tweets);
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
    let render_home = false;
    if (this.tweets.length == 0) {
      render_home = true;
    }

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
            let tx = new saito.default.transaction(undefined, JSON.parse(row.tx));
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
    let render_home = false;
    if (this.tweets.length == 0) {
      render_home = true;
    }

    this.loadTweetsFromPeerAndReturn(
      peer,
      sql,
      (txs, tweet_to_track = null) => {
        if (to_track_tweet) {
          if (tweet_to_track) {
            this.trackTweet(tweet_to_track);
          }
        }
        for (let z = 0; z < txs.length; z++) {
          this.addTweet(txs[z]);
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
  addTweet(tx, prepend = 0) {
    //
    // create the tweet
    //
    let tweet = new Tweet(this.app, this, "", tx);
    tweet.updated_at = tx.transaction.ts;

    let is_notification = 0;

    //
    // maybe this needs to go into notifications too
    //

    if (tx.isTo(this.app.wallet.getPublicKey())) {
      //
      // this is a notification, so update our timestamps
      //
      if (tx.transaction.ts > this.notifications_newest_ts) {
        this.notifications_newest_ts = tx.transaction.ts;
      }
      if (tx.transaction.ts < this.notifications_oldest_ts) {
        this.notifications_oldest_ts = tx.transaction.ts;
      }
      //
      // notify of other people's actions, but not ours
      //
      if (!tx.isFrom(this.app.wallet.getPublicKey())) {
        let insertion_index = 0;
        if (prepend == 0) {
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
        this.notifications_sigs_hmap[tweet.tx.transaction.sig] = 1;

        //
        // increment notifications in menu unless is our own
        //
        if (tx.transaction.ts > this.notifications_last_viewed_ts) {
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
        if (tx.transaction.ts > this.tweets_newest_ts) {
          this.tweets_newest_ts = tx.transaction.ts;
        }
        if (tx.transaction.ts < this.notifications_oldest_ts) {
          this.tweets_oldest_ts = tx.transaction.ts;
        }
        return;
      }
    }

    //
    // add tweet to tweet and tweets_sigs_hmap for easy-reference
    //
    //
    // this is a post
    //
    if (
      tweet.parent_id === "" ||
      (tweet.parent_id === tweet.thread_id && tweet.parent_id === tweet.tx.transaction.sig)
    ) {
      //
      // we do not have this tweet indexed, it's new
      //
      if (!this.tweets_sigs_hmap[tweet.tx.transaction.sig]) {
        //
        // check where we insert the tweet
        //
        let insertion_index = 0;
        if (prepend == 0) {
          for (let i = 0; i < this.tweets.length; i++) {
            if (this.tweets[i].updated_at > tweet.updated_at) {
              insertion_index++;
              break;
            } else {
              insertion_index++;
            }
          }
        }

        //
        // and insert it
        //
        this.tweets.splice(insertion_index, 0, tweet);
        this.tweets_sigs_hmap[tweet.tx.transaction.sig] = 1;

        //
        // add unknown children if possible
        //
        for (let i = 0; i < this.unknown_children.length; i++) {
          if (this.tweets[insertion_index].addTweet(this.unknown_children[i]) == 1) {
            this.unknown_children.splice(i, 1);
            i--;
          }
        }
      } else {
        for (let i = 0; i < this.tweets.length; i++) {
          if (this.tweets[i].tx.transaction.sig === tweet.tx.transaction.sig) {
            this.tweets[i].num_replies = tweet.num_replies;
            this.tweets[i].num_retweets = tweet.num_retweets;
            this.tweets[i].num_likes = tweet.num_likes;

            //
            // EVENT HERE
            //
            // this.tweets[i].renderOptional();
          }
        }
      }

      //
      // this is a comment
      //
    } else {
      let inserted = false;

      for (let i = 0; i < this.tweets.length; i++) {
        if (this.tweets[i].tx.transaction.sig === tweet.thread_id) {
          if (this.tweets[i].addTweet(tweet) == 1) {
            this.tweets_sigs_hmap[tweet.tx.transaction.sig] = 1;
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
    // this is a tweet, so update our
    //
    if (is_notification == 0) {
      if (tx.transaction.ts > this.tweets_newest_ts) {
        this.tweets_newest_ts = tx.transaction.ts;
      }
      if (tx.transaction.ts < this.notifications_oldest_ts) {
        this.tweets_oldest_ts = tx.transaction.ts;
      }
    }

    this.app.connection.emit("redsquare-tweet-added-render-request", tweet);
  }

  returnTweet(tweet_sig = null) {
    if (tweet_sig == null) {
      return null;
    }
    if (!this.tweets_sigs_hmap[tweet_sig]) {
      return null;
    }

    for (let i = 0; i < this.tweets.length; i++) {
      if (this.tweets[i].tx.transaction.sig === tweet_sig) {
        return this.tweets[i];
      }
      if (this.tweets[i].hasChildTweet(tweet_sig)) {
        return this.tweets[i].returnChildTweet(tweet_sig);
      }
    }

    return null;
  }

  //   addNotification(app, mod, tx) {
  //     if (tx.transaction.from[0].add === app.wallet.getPublicKey()) {
  //       return;
  //     }
  //     if (tx.transaction.ts > this.notifications_last_viewed_ts) {
  //       this.notifications_number_unviewed++;

  //     //   this.app.connection.emit("redsquare-notifications-render-request", { menu: "notifications", num: this.notifications_number_unviewed });
  //     // }
  //     if (this.ntfs.length == 0) {
  //       this.ntfs.push(tx);
  //       console.log('notifications ', this.ntfs)
  //       return;
  //     }
  //     for (let i = 0; i < this.ntfs.length; i++) {
  //       if (this.ntfs[i].transaction.ts < tx.transaction.ts) {
  //         this.ntfs.splice(i, 0, tx);
  //         return;
  //       }
  //     }
  //     this.ntfs.push(tx);

  //   }
  // }

  async fetchOpenGraphProperties(app, mod, link) {
    if (app.BROWSER != 1) {
      // required og properties for link preview
      let og_tags = {
        "og:exists": false,
        "og:title": "",
        "og:description": "",
        "og:url": "",
        "og:image": "",
        "og:site_name": "",
      };

      // fetch source code for link inside tweet
      // (sites which uses firewall like Cloudflare shows Cloudflare loading
      //  page when fetching page source)
      //
      try {
        return fetch(link)
          .then((res) => res.text())
          .then((data) => {
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
      if (tx.transaction.to[i].add !== app.wallet.getPublicKey()) {
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
      if (tx.isTo(app.wallet.getPublicKey())) {
        this.app.storage.saveTransaction(tx);

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
          this.app.storage.updateTransactionOptional(
            txmsg.data.sig,
            app.wallet.getPublicKey(),
            tx.optional
          );
          tweet.renderLikes();
        } else {
          this.app.storage.incrementTransactionOptionalValue(txmsg.data.sig, "num_likes");
        }

        //
        // convert like into tweet and addTweet to get notifications working
        //
        this.addTweet(tx, true);
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
      if (keys[i] !== app.wallet.getPublicKey()) {
        newtx.transaction.to.push(new saito.default.slip(keys[i]));
      }
    }
    newtx = redsquare_self.app.wallet.signTransaction(newtx);
    redsquare_self.app.network.propagateTransaction(newtx);
    return newtx;
  }

  async receiveTweetTransaction(blk, tx, conf, app) {
    let tweet = new Tweet(app, this, "", tx);

    //
    // browsers
    //
    if (app.BROWSER == 1) {
      //

      // save tweets addressed to me
      //
      if (tx.isTo(app.wallet.getPublicKey())) {
        this.app.storage.saveTransaction(tx);
        let txmsg = tx.returnMessage();

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
            this.app.storage.updateTransactionOptional(
              txmsg.data.parent_id,
              app.wallet.getPublicKey(),
              tweet.tx.optional
            );
            tweet.renderReplies();
          } else {
            this.app.storage.incrementTransactionOptionalValue(txmsg.data.parent_id, "num_replies");
          }
        }

        //
        // if retweets
        //

        if (txmsg.data?.retweet_tx) {
          if (txmsg.data?.retweet_tx) {
            let rtxobj = JSON.parse(txmsg.data.retweet_tx);
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
              this.app.storage.updateTransactionOptional(
                rtxsig,
                app.wallet.getPublicKey(),
                tx.optional
              );
              tweet2.renderRetweets();
            } else {
              this.app.storage.incrementTransactionOptionalValue(rtxsig, "num_retweets");
            }
          }
        }
      }

      // if (tx.transaction.from[0].add != app.wallet.getPublicKey()) {
      //   // document.querySelector("#redsquare-new-tweets-banner").style.display = "block";
      //   return;
      // }

      this.addTweet(tx, 1);

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
    let sql = `INSERT INTO tweets (tx,
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
                                   tx_size)
               VALUES ($txjson,
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
                       $tx_size)`;

    let has_images = 0;
    if (typeof tweet.images != "undefined") {
      has_images = 1;
    }
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
      $tx_size: tx_size,
    };

    app.storage.executeDatabase(sql, params, "redsquare");

    let ts = new Date().getTime();
    let sql2 = "UPDATE tweets SET updated_at = $timestamp WHERE sig = $sig";
    let params2 = {
      $timestamp: ts,
      $sig: tweet.thread_id,
    };
    app.storage.executeDatabase(sql2, params2, "redsquare");

    if (tweet.retweet_tx != null) {
      let ts = new Date().getTime();
      let sql3 = "UPDATE tweets SET num_retweets = num_retweets + 1 WHERE sig = $sig";
      let params3 = {
        $sig: tweet.thread_id,
      };
      app.storage.executeDatabase(sql3, params3, "redsquare");
    }

    if (tweet.parent_id !== tweet.tx.transaction.sig && tweet.parent_id !== "") {
      let ts = new Date().getTime();
      let sql4 = "UPDATE tweets SET num_replies = num_replies + 1 WHERE sig = $sig";
      let params4 = {
        $sig: tweet.parent_id,
      };
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
    let sql = `UPDATE tweets
               SET flagged = 1
               WHERE sig = $sig`;
    let params = {
      $sig: txmsg.data.sig,
    };
    app.storage.executeDatabase(sql, params, "redsquare");

    this.sqlcache = [];

    return;
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
                       WHERE sig = '${sig}'`;
            let rows = await app.storage.queryDatabase(sql, {}, "redsquare");

            for (let i = 0; i < rows.length; i++) {
              let tx = new saito.default.transaction(undefined, JSON.parse(rows[i].tx));
              let txmsg = tx.returnMessage();
              let text = tx.msg.data.text;
              let publickey = tx.transaction.from[0].add;
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
            let sig = query_params.og_img_sig;
            let sql = `SELECT *
                       FROM tweets
                       WHERE sig = '${sig}'`;

            let rows = await app.storage.queryDatabase(sql, {}, "redsquare");

            for (let i = 0; i < rows.length; i++) {
              let tx = new saito.default.transaction(undefined, JSON.parse(rows[i].tx));
              let txmsg = tx.returnMessage();

              if (typeof tx.msg.data.images != "undefined") {
                let img_uri = tx.msg.data?.images[0];
                let img_type = img_uri.substring(img_uri.indexOf(":") + 1, img_uri.indexOf(";"));
                let base64Data = img_uri.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
                let img = Buffer.from(base64Data, "base64");
              } else {
                let publickey = tx.transaction.from[0].add;
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
}

module.exports = RedSquare;

