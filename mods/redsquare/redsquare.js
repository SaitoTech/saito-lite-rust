const saito = require("./../../lib/saito/saito");
const ModTemplate = require("../../lib/templates/modtemplate");
const SaitoHeader = require("../../lib/saito/ui/saito-header/saito-header");
const SaitoCamera = require("../../lib/saito/ui/saito-camera/saito-camera");
const SaitoMain = require("./lib/main");
const SaitoMenu = require("./lib/menu");
const RedSquareSidebar = require("./lib/sidebar");
const Tweet = require("./lib/tweet");
const fetch = require("node-fetch");
const HTMLParser = require("node-html-parser");
const prettify = require("html-prettify");
const redsquareHome = require("./index");
const Post = require("./lib/post");
const Transaction = require("../../lib/saito/transaction").default;
const PeerService = require("saito-js/lib/peer_service").default;

/*
 * lib/main.js:    this.app.connection.on("redsquare-home-render-request", () => {      // renders main tweets
 * lib/main.js:    this.app.connection.on("redsquare-tweet-render-request", (tweet) => {   // renders tweet
 * lib/main.js:    this.app.connection.on("redsquare-profile-render-request", () => {     // renders profile
 * lib/main.js:    //this.app.connection.on("redsquare-contacts-render-request", () => {    // renders contacts
 * lib/main.js:    this.app.connection.on("redsquare-notifications-render-request", () => {   // renders notifications
 * lib/main.js:    this.app.connection.on("redsquare-component-render-request", (obj) => {    // renders other modules into .saito-main
 */

class RedSquare extends ModTemplate {
  constructor(app) {
    super(app);
    this.appname = "Red Square";
    this.name = "RedSquare";
    this.slug = "redsquare";
    this.description = "Open Source Twitter-clone for the Saito Network";
    this.categories = "Social Entertainment";
    this.icon_fa = "fas fa-square-full";

    this.publicKey = "";

    this.tweets = [];
    this.tweets_sigs_hmap = {};
    this.unknown_children = [];

    this.peers = [];

    this.liked_tweets = [];
    this.retweeted_tweets = [];
    this.replied_tweets = [];


    this.notifications = [];
    this.notifications_sigs_hmap = {};

    //
    // is this a notification?
    //
    this.notifications_last_viewed_ts = 0;
    this.notifications_number_unviewed = 0;

    this.allowed_upload_types = ["image/png", "image/jpg", "image/jpeg"];

    this.scripts = ["/saito/lib/virtual-bg/virtual-bg.js"];

    this.postScripts = ["/saito/lib/emoji-picker/emoji-picker.js"];

    this.styles = ["/saito/saito.css", "/redsquare/style.css"];

    this.liked_tweets = [];
    this.retweeted_tweets = [];
    this.replied_tweets = [];

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
    services.push(new PeerService(null, "redsquare", "RedSquare Tweet Archive"));
    return services;
  }

  /////////////////////////////////
  // inter-module communications //
  /////////////////////////////////
  respondTo(type = "", obj) {
    let this_mod = this;
    if (type === "user-menu") {
      return {
        text: `View ${obj?.publicKey && obj.publicKey === this.publicKey ? "My " : ""}Profile`,
        icon: "fa fa-user",
        callback: function (app, publicKey) {
          if (app.modules.returnActiveModule().returnName() == "Red Square") {
            app.connection.emit("redsquare-profile-render-request", publicKey);
          } else {
            window.location = `/redsquare/?user_id=${publicKey}`;
          }
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

      if (this.app.browser.isMobileBrowser() && this.browser_active) {
        x.push({
          text: "RedSquare Home",
          icon: "fa-solid fa-house",
          rank: 21,
          callback: function (app, id) {
            document.querySelector(".redsquare-menu-home").click();
          },
        });
        x.push({
          text: "Notifications",
          icon: "fas fa-bell",
          rank: 23,
          callback: function (app, id) {
            document.querySelector(".redsquare-menu-notifications").click();
          },
        });
        x.push({
          text: "Profile",
          icon: "fas fa-user",
          rank: 26,
          callback: function (app, id) {
            document.querySelector(".redsquare-menu-profile").click();
          },
        });
      }

      /*x.push({
        text: "Camera",
        icon: "fas fa-camera",
        rank: 27,
        callback: function (app, id) {
          let camera = new SaitoCamera(app, this_mod);
          camera.render();
        }
      });
      */
      return x;
    }

    if (type === "saito-floating-menu") {
      let x = [];
      x.push({
        text: "Tweet",
        icon: "fa-solid fa-pen",
        allowed_mods: ["redsquare"],
        disallowed_mods: ["arcade"],
        rank: 10,
        callback: function (app, id) {
          let post = new Post(app, this_mod);
          post.render();
        },
      });

      x.push({
        text: "Tweet Camera",
        icon: "fas fa-camera",
        allowed_mods: ["redsquare"],
        disallowed_mods: ["arcade"],
        rank: 20,
        callback: function (app, id) {
          let post = new Post(app, this_mod);
          let camera = new SaitoCamera(app, this_mod, (img) => {
            post.render();
            post.addImg(img);
          });
          camera.render();
        },
      });

      x.push({
        text: "Tweet Image",
        icon: "fas fa-image",
        allowed_mods: ["redsquare"],
        disallowed_mods: ["arcade"],
        rank: 30,
        callback: function (app, id) {
          let post = new Post(app, this_mod);
          post.render();
          post.triggerClick("#hidden_file_element_tweet-overlay");
        },
      });
      return x;
    }

    return null;
  }

  ////////////////////
  // initialization //
  ////////////////////
  //
  // this function runs whenever the browser or application is loaded. note that
  // at this point we probably do not have any network connections to any peers
  // so most of the work is pre-network init.
  //
  async initialize(app) {

    //
    // database setup etc.
    //
    await super.initialize(app);

    if (this.browser_active) {
      this.styles = ["/saito/saito.css", "/redsquare/style.css"];
    }
    this.publicKey = await app.wallet.getPublicKey();

    //
    // fetch content from options file
    //
    this.load();

    //
    // servers update their cache for browsers
    //
    if (app.BROWSER == 0) {
      this.updateTweetsCacheForBrowsers();
    } else {
//      this.loadLocalTweets();
    }
  }

  ////////////
  // render //
  ////////////
  //
  // browsers run this to render the page. this also runs before the network is
  // likely functional, so it focuses on writing the components to the screen rather
  // that fetching content.
  //
  // the content fetch begins when onPeerServiceUp() lets us know that a peer is
  // connected and available for a content-fetch request.
  //
  async render() {
    //
    // browsers only!
    //
    if (!this.app.BROWSER) {
      return;
    }
    new Date().getTime();
    //
    // default to dark mode
    //
    if (this.app.options.theme) {
      let theme = this.app.options.theme[this.slug];
      if (theme != null) {
        this.app.browser.switchTheme(theme);
      }
    }

    //
    // create and render components
    //
    if (this.main == null) {
      this.main = new SaitoMain(this.app, this);
      this.header = new SaitoHeader(this.app, this);
      await this.header.initialize(this.app);
      this.menu = new SaitoMenu(this.app, this, ".saito-sidebar.left");
      this.sidebar = new RedSquareSidebar(this.app, this, ".saito-sidebar.right");

      this.addComponent(this.header);
      this.addComponent(this.main);
      this.addComponent(this.menu);
      this.addComponent(this.sidebar);

      //
      // chat manager can insert itself into left-sidebar if exists
      //
      for (const mod of this.app.modules.returnModulesRespondingTo("chat-manager")) {
        let cm = mod.respondTo("chat-manager");
        cm.container = ".saito-sidebar.left";
        cm.render_manager_to_screen = 1;
        this.addComponent(cm);
      }
    }

    await super.render();
    this.rendered = true;

  }

  /////////////////////
  // peer management //
  /////////////////////
  async addPeer(peer, type = "tweets") {

    let mypeers = await this.app.network.getPeers();
    let has_tweets = false;
    let has_notifications = false;
    let publicKey = peer.publicKey;

    if (type === "tweets") {
      has_tweets = true;
    }
    if (type === "notifications") {
      has_notifications = true;
    }

    let peer_idx = -1;
    for (let i = 0; i < this.peers.length; i++) {
      if (this.peers[i].publickey === publicKey) {
        peer_idx = i;
      }
    }
    if (peer_idx == -1) {
      this.peers.push({
        peer: peer,
        publickey: publicKey,
        tweets_earliest_ts: new Date().getTime(),
        tweets_latest_ts: 0,
        tweets_limit: 20,
        profile_earliest_ts: 0,
        profile_latest_ts: 0,
        profile_limit: 20,
        notifications_earliest_ts: new Date().getTime(),
        notifications_latest_ts: 0,
        notifications_limit: 10,
        has_tweets: has_tweets,
        has_notifications: has_notifications,
      });
    } else {
      this.peers[peer_idx].peer = peer;
      if (has_tweets) {
        this.peers[peer_idx].tweets = true;
      }
      if (has_notifications) {
        this.peers[peer_idx].notifications = true;
      }
    }
  }

  ////////////////////////
  // when peer connects //
  ////////////////////////
  async onPeerServiceUp(app, peer, service = {}) {
    //
    // avoid network overhead if in other apps
    //
    if (!this.browser_active) {
      return;
    }

    //
    // redsquare -- load tweets
    //
    if (service.service === "redsquare") {

      //
      // if viewing a specific tweet
      //
      let tweet_id = this.app.browser.returnURLParameter("tweet_id");

      if (tweet_id === "undefined") {
        tweet_id = "";
      }

      if (tweet_id != "") {
        let sql = `SELECT *
                   FROM tweets
                   WHERE sig = '${tweet_id}'
                      OR parent_id = '${tweet_id}'
                   ORDER BY created_at DESC`;
        this.loadTweetsFromPeer(peer, sql, (txs) => {
          for (let z = 0; z < txs.length; z++) {
            this.addTweet(txs[z]);
          }
          let tweet = this.returnTweet(tweet_id);

          if (tweet) {
            this.app.connection.emit("redsquare-home-tweet-render-request", tweet);
          }
        });
        return;
      }

      //
      // render user profile
      //
      let user_id = this.app.browser.returnURLParameter("user_id");
      if (user_id != "") {
        this.app.connection.emit("redsquare-profile-render-request", user_id);
        return;
      }


      // check url hash
      let hash = window.location.hash;
      if (hash) {
        switch(hash) {
          case "#home":
            this.app.connection.emit("redsquare-home-render-request");
            break;
          case "#notifications":
            this.app.connection.emit("redsquare-notifications-render-request");
            break;
          case "#profile":
            this.app.connection.emit("redsquare-profile-render-request");
            break;
          default:
            this.app.connection.emit("redsquare-home-render-request");
        }
        return;
      }


      //
      // or fetch tweets
      //
      await this.addPeer(peer, "tweets");
      this.loadTweets(peer, (txs) => {
        this.app.connection.emit("redsquare-home-render-request");
        if (txs.length == 0) {
          this.app.connection.emit("redsquare-home-loader-hide-request");
          return;
        }
      });
    }

    //
    // archive -- load notifications
    //
    if (service.service === "archive") {

      await this.addPeer(peer, "notifications");
      let recursiveLoadNotifications = (peer, delay) => {
        setTimeout(() => {
          this.loadNotifications(peer, (txs) => {
            if (txs.length == 0) {
              this.app.connection.emit("redsquare-home-loader-hide-request");
              return;
            }
            if (this.notifications.length < 5) { recursiveLoadNotifications(peer, delay); }
          });
        }, delay);
      };
      recursiveLoadNotifications(peer, 3500);
    }
  }

  ///////////////////////
  // network functions //
  ///////////////////////
  async onConfirmation(blk, tx, conf) {
    let txmsg = tx.returnMessage();

    if (conf === 0) {
      console.log("%%");
      console.log("NEW TRANSACTION RECEIVED!");
      console.log("txmsg: " + JSON.stringify(txmsg));
    }

    try {
      if (conf == 0) {
        if (txmsg.request === "create tweet") {
          await this.receiveTweetTransaction(blk, tx, conf, this.app);
          this.sqlcache = {};
        }
        if (txmsg.request === "like tweet") {
          await this.receiveLikeTransaction(blk, tx, conf, this.app);
          this.sqlcache = {};
        }
        if (txmsg.request === "flag tweet") {
          await this.receiveFlagTransaction(blk, tx, conf, this.app);
          this.sqlcache = {};
        }
      }
    } catch (err) {
      console.log("ERROR in " + this.name + " onConfirmation: " + err);
    }
  }

  ///////////////////////////////
  // content loading functions //
  ///////////////////////////////
  //
  // there are three major functions that are called to fetch more content:
  //
  // - loadProfile()
  // - loadTweets()
  // - loadNotifications()
  //
  // these will trigger calls to all of the peers that have been added and
  // fetch more content from all of them up until there is no more content
  // to fetch and display. this content will be fetched and returned in the
  // form of transactions that can be fed to addTweets() or displayed
  // via the manager.
  //
  // there are additional functions that fetch content via SQL requests to
  // the main server. these are older functions that date back to when
  // RedSquare was mostly a server-client app and exist so that the UI
  // can still fetch individual tweets using the more complicated SQL-powered
  // loading logic.
  //
  loadProfile(peer, publickey = "", mycallback) {
    for (let i = 0; i < this.peers.length; i++) {
      let peer = this.peers[i].peer;
      let peer_publickey = this.peers[i].publickey;
      if (this.peers[i].profile_earliest_ts != 0) {
	//
	// specifying OWNER as the remote peer tells us to fetch the tweets that they
	// have saved under the publickey associated with RedSquare as opposed to our
	// own publickey, under which they may have transactions that are indexed for
	// us separately. we will update the OWNER field in the notifications fetch
	// so that fetch will return any content specific to us...
	//
        this.app.storage.loadTransactions(
          {
            field2: this.publicKey ,
            owner: peer_publickey,
            created_earlier_than: this.peers[i].profile_earliest_ts,
            limit: this.peers[i].profile_limit,
          },
          (txs) => {
            if (txs.length > 0) {
              for (let z = 0; z < txs.length; z++) {
                txs[z].decryptMessage(this.app);
                this.addTweet(txs[z]);
              }
            } else {
              this.peers[i].profile_earliest_ts = 0;
            }

            for (let z = 0; z < txs.length; z++) {
              if (txs[z].timestamp < this.peers[i].profile_earliest_ts) {
                this.peers[i].profile_earliest_ts = txs[z].timestamp;
              }
              if (txs[z].timestamp > this.peers[i].profile_latest_ts) {
                this.peers[i].profile_latest_ts = txs[z].timestamp;
              }
            }

            if (mycallback) {
              mycallback(txs);
            }
          },
          this.peers[i].peer
        );
      }
    }
  }

  loadTweets(peer, mycallback) {
    for (let i = 0; i < this.peers.length; i++) {
      let peer = this.peers[i].peer;
      let peer_publickey = this.peers[i].publickey;
      if (this.peers[i].tweets_earliest_ts != 0) {
	//
	// specifying OWNER as the remove peer tells us to fetch the tweets that they
	// have saved under the publickey associated with RedSquare as opposed to our
	// own publickey, under which they may have transactions that are indexed for
	// us separately. we will update the OWNER field in the notifications fetch
	// so that fetch will return any content specific to us...
	//
        this.app.storage.loadTransactions(
          {
            field1: "RedSquare",
            owner: peer_publickey,
            created_earlier_than: this.peers[i].tweets_earliest_ts,
            limit: this.peers[i].tweets_limit,
          },
          (txs) => {
            if (txs.length > 0) {
              for (let z = 0; z < txs.length; z++) {
                txs[z].decryptMessage(this.app);
                this.addTweet(txs[z]);
              }
            } else {
              this.peers[i].tweets_earliest_ts = 0;
            }

            for (let z = 0; z < txs.length; z++) {
              if (txs[z].timestamp < this.peers[i].tweets_earliest_ts) {
                this.peers[i].tweets_earliest_ts = txs[z].timestamp;
              }
              if (txs[z].timestamp > this.peers[i].tweets_latest_ts) {
                this.peers[i].tweets_latest_ts = txs[z].timestamp;
              }
            }

            if (mycallback) {
              mycallback(txs);
            }
          },
          this.peers[i].peer
        );
      }
    }
  }


  loadNotifications(peer, mycallback = null) {
    //
    // notifications are not fetched from peers that index the tweets but from transactions
    // that have been archived for us and others, because they are saved transactions rather
    // than curated tweets. tweets from servers can still show up as notifications, of course
    // because addTweets() will automatically make them a notification if they are addressed
    // TO us, but when we want to fetch our list of notifications, we want to fetch from our
    // archive nodes.
    //
    for (let i = 0; i < this.peers.length; i++) {
      let peer = this.peers[i].peer;
      let peer_publickey = this.peers[i].publickey;
      if (this.peers[i].notifications_earliest_ts != 0) {
        this.app.storage.loadTransactions(
          {
            owner: this.publicKey,
            field3: this.publicKey,
            created_earlier_than: this.peers[i].notifications_earliest_ts,
            limit: this.peers[i].limit,
          },
          (txs) => {
            if (txs.length > 0) {
              for (let z = 0; z < txs.length; z++) {
                txs[z].decryptMessage(this.app);
                this.addTweet(txs[z]);
              }
            } else {
              this.peers[i].notifications_earliest_ts = 0;
            }
            for (let z = 0; z < txs.length; z++) {
              if (txs[z].timestamp < this.peers[i].notifications_earliest_ts) {
                this.peers[i].notifications_earliest_ts = txs[z].timestamp;
              }
              if (txs[z].timestamp > this.peers[i].notifications_latest_ts) {
                this.peers[i].notifications_latest_ts = txs[z].timestamp;
              }
            }

            if (mycallback) {
              mycallback(txs);
            }
          },
          this.peers[i].peer
        );
      }
    }
  }

  //
  //
  //
  loadAndRenderTweetChildren(peer, sig, mycallback = null) {

    let sql = `SELECT *
               FROM tweets
               WHERE parent_id = '${sig}'
               ORDER BY created_at DESC`;
    this.loadTweetsFromPeer(peer, sql, (txs) => {
      for (let z = 0; z < txs.length; z++) {
        this.addTweet(txs[z]);
      } 
      mycallback(txs);
    });

  }


  //
  // the following functions are all deprecated, but included because it is going to be a challenge
  // to upgrade them quickly. we prefer to use the Archive module to fetch and load transactions
  // rather than falling back to SQL commands....
  //
  // nonetheless, when we have more complex requests for thread display or tweet ordering, we fall
  // back to asking a peer that indexes them in a database.
  //
  loadTweetThread(peer, sig, mycallback = null) {
    let sql = `SELECT *
               FROM tweets
               WHERE thread_id = '${sig}'
               ORDER BY created_at DESC`;

    for (let i = 0; i < this.peers.length; i++) {
      let peer = this.peers[i].peer;
      this.loadTweetsFromPeer(peer, sql, mycallback);
    }
  }


  loadTweetChildren(peer, sig, mycallback = null) {
    if (this.peers.length == 0) {
      return;
    }
    if (mycallback == null) {
      return;
    }

    for (let i = 0; i < this.peers.length; i++) {
      let peer = this.peers[i].peer;

      let x = [];
      let sql = `SELECT *
                 FROM tweets
                 WHERE parent_id = '${sig}'
                 ORDER BY created_at DESC`;

      this.loadTweetsFromPeer(this.peers[0].peer, sql, (txs) => {
        for (let z = 0; z < txs.length; z++) {
          this.addTweet(txs[z]);
        }
        if (mycallback) {
          mycallback(txs);
        }
      });
    }
  }

  loadTweetWithSig(sig, mycallback = null) {
    if (this.peers.length == 0) {
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

    this.loadTweetsFromPeer(this.peers[0].peer, sql, (txs) => {
      for (let z = 0; z < txs.length; z++) {
        this.addTweet(txs[z]);
      }
      if (mycallback) {
        mycallback(txs);
      }
    });
  }

  loadTweetsFromPeer(peer, sql, mycallback = null) {
    let txs = [];
    this.loadTweetsFromPeerAndReturn(peer, sql, (txs, tweet_to_track = null) => {
      for (let z = 0; z < txs.length; z++) {
        this.addTweet(txs[z]);
      }
      if (mycallback != null) {
        mycallback(txs);
      }
    });
  }

  loadTweetsFromPeerAndReturn(peer, sql, mycallback = null) {
    let txs = [];
    let tweet_to_track = null;

    this.sendPeerDatabaseRequestWithFilter(
      "RedSquare",
      sql,
      async (res) => {

        if (res.rows) {
          await this.addPeer(peer, "tweet");

          res.rows.forEach((row) => {
            let tx = new saito.default.transaction();
            tx.deserialize_from_web(this.app, row.tx);
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
        if (mycallback != null) {
          mycallback(txs);
        }
      },
      (p) => {
        if (p.publicKey == peer.publicKey) {
          return 1;
        }
        return 0;
      }
    );
  }

  loadTweetsWithParentId(sig, mycallback = null) {
    if (this.peers.length == 0) {
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
    this.loadTweetsFromPeer(mod.peers[0].peer, sql, (txs) => {
      let x = [];
      this.loadTweetsFromPeer(
        peer,
        sql,
        (txs) => {
          for (let z = 0; z < txs.length; z++) {
            let tweet = new Tweet(app, mod, txs[z], ".tweet-manager");
            x.push(tweet);
          }
          mycallback(x);
        },
        false,
        false
      );
      return;
    });
  }

  returnEarliestTimestampFromTransactionArray(txs = []) {
    let ts = new Date().getTime();
    for (let i = 0; i < txs.length; i++) {
      if (txs[i].timestamp < ts) {
        ts = txs[i].timestamp;
      }
    }
    return ts;
  }

  ///////////////
  // add tweet //
  ///////////////
  //
  // this creates the tweet and adds it to the internal list that we maintain of
  // the tweets that holds them in a structured tree (parents hold children, etc.)
  // while also maintaining a separate list of the notifications, etc. this function
  // also indexes the tweets as needed in the various hashmaps so they can be
  // retrieved by returnTweet()
  //
  // this does not DISPLAY any tweets, although it makes sure that when they are
  // added they will render into the TWEET MANAGER component.
  //
  async addTweet(tx, prepend = false) {

    //
    // create the tweet
    //
    let tweet = new Tweet(this.app, this, tx, ".tweet-manager");
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

	//
	// only insert notification if doesn't already exist
	//
        if (this.notifications_sigs_hmap[tweet.tx.signature] != 1) {

	  //
	  // insert / update
	  //
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
      if (!this.tweets_sigs_hmap[tx.signature]) {
        this.tweets_sigs_hmap[tx.signature] = 1;
      }
      return;
    }

    //
    // We have already indexed this tweet, so just update the stats
    // we are adding it because it's updated_at is newer, e.g. there are more replies/retweets/likes
    //
    if (this.tweets_sigs_hmap[tweet.tx.signature]) {
      let updated = 0;
      for (let i = 0; i < this.tweets.length; i++) {
        if (this.tweets[i].tx.signature === tweet.tx.signature) {
          if (this.tweets[i].tx.optional.num_replies < tweet.tx.optional.num_replies) {
            console.log("~~~");
            console.log(
              "~~~ already have tweet - updating num replies...: " + tweet.tx.optional.num_replies
            );
            console.log("~~~");
            this.tweets[i].tx.optional.num_replies = tweet.tx.optional.num_replies;
          }
          if (this.tweets[i].tx.optional.num_retweets < tweet.tx.optional.num_retweets) {
            this.tweets[i].tx.optional.num_retweets = tweet.tx.optional.num_retweets;
          }
          if (this.tweets[i].tx.optional.num_likes < tweet.tx.optional.num_likes) {
            this.tweets[i].tx.optional.num_likes = tweet.tx.optional.num_likes;
          }
          if (this.tweets[i].updated_at < tweet.updated_at) {
            this.tweets[i].updated_at = tweet.updated_at;
          }
          console.log("Update stats of tweet we already indexed");
          console.log(this.tweets[i].tx.optional);
          updated = true;
          break;
        }
      }

      // maybe this is a hidden child
      if (!updated) {
        let t = this.returnTweet(tweet.tx.signature);
        if (t.tx.optional.num_replies < tweet.tx.optional.num_replies) {
          console.log("!!!");
          console.log("!!! updating num replies in child: " + tweet.tx.optional.num_replies);
          console.log("!!!");
          t.tx.optional.num_replies = tweet.tx.optional.num_replies;
        }
        if (t.tx.optional.num_retweets < tweet.tx.optional.num_retweets) {
          t.tx.optional.num_retweets = tweet.tx.optional.num_retweets;
        }
        if (t.tx.optional.num_likes < tweet.tx.optional.num_likes) {
          t.tx.optional.num_likes = tweet.tx.optional.num_likes;
        }
        if (t.updated_at < tweet.updated_at) {
          t.updated_at = tweet.updated_at;
        }
        console.log("Updated stats of sub-tweet we already indexed");
        console.log(this.tweets[i].tx.optional);
      }
      return;
    }

    //
    // add tweet to tweet and tweets_sigs_hmap for easy-reference
    //
    //
    // this is a post
    //
    if (tweet.tx.optional.parent_id === "") {
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
          if (this.unknown_children[i].tx.optional.thread_id === tweet.tx.signature) {
            if (this.tweets.length > insertion_index) {
              if (this.tweets[insertion_index].addTweet(this.unknown_children[i]) == 1) {
                this.unknown_children.splice(i, 1);
                i--;
              }
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
	    if (tweet.num_replies > this.tweets[i].tx.optional.num_replies) {
              this.tweets[i].tx.optional.num_replies = tweet.num_replies;
	    }
	    if (tweet.num_retweets > this.tweets[i].tx.optional.num_retweets) {
              this.tweets[i].tx.optional.num_retweets = tweet.num_retweets;
	    }
	    if (tweet.num_likes > this.tweets[i].tx.optional.num_likes) {
              this.tweets[i].tx.optional.num_likes = tweet.num_likes;
	    }
          }
        }
      }

      //
      // this is a comment
      //
    } else {
      let inserted = false;

      for (let i = 0; i < this.tweets.length; i++) {
        if (this.tweets[i].tx.signature === tweet.tx.optional.thread_id) {
          let xyz = await this.tweets[i].addTweet(tweet);
          if (xyz == 1) {
            this.tweets_sigs_hmap[tweet.tx.signature] = 1;
            inserted = true;
            break;
          } else {
	  }
        }
      }

      if (inserted == false) {
        this.tweets_sigs_hmap[tweet.tx.signature] = 1;
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

  returnThreadSigs(root_id, child_id) {

    let sigs = [];
    let tweet = this.returnTweet(child_id);
    if (!tweet) { return [parent_id]; }
    let parent_id = tweet.parent_id;

    sigs.push(child_id);
    while (parent_id != "" && parent_id != root_id) {
      let x = this.returnTweet(parent_id);
      if (!x) { parent_id = root_id; } else {
        if (x.parent_id != "") {
          sigs.push(parent_id);
	  parent_id = x.parent_id;
        } else {
          parent_id = root_id;
        }
      }
    }
    if (child_id != root_id) { sigs.push(root_id); }
    return sigs;

  }


  ///////////////////////
  // network functions //
  ///////////////////////
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
        newtx.addTo(tx.to[i].publicKey);
      }
    }

    newtx.msg = obj;
    await newtx.sign();
    await redsquare_self.app.network.propagateTransaction(newtx);
    return newtx;
  }

  async receiveLikeTransaction(blk, tx, conf, app) {
    console.log(":");
    console.log(":");
    console.log(": receive like transaction!");
    console.log(":");
    console.log(":");

    //
    // browsers
    //
    if (app.BROWSER == 1) {
      //
      // save my likes
      //
      if (tx.isTo(this.publicKey)) {

	let ts = tx.timestamp;

        await this.app.storage.saveTransaction(tx, {
          owner: this.publicKey,
          field3: this.publicKey,
        });

        //
        // save optional likes
        //
        let txmsg = tx.returnMessage();
        if (this.tweets_sigs_hmap[txmsg.data.signature]) {
          let tweet = this.returnTweet(txmsg.data.signature);

          if (tweet.tx) {
	    if (!tweet.tx.optional) { tweet.tx.optional = {}; }
	    if (tweet.tx.optional) {
	      if (!tweet.tx.optional.updated_at) { tweet.tx.optional.updated_at = 0; }
	      if (tweet.tx.optional.updated_at > ts) {
                return;
              } else {
		// we should logically update updated_at here, but we don't
		// because browsers will not load likes for each other in a
		// confused manner like this, and not updating the field 
		// allows for accurate counting of multiple likes...
	      }
            }
          }
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
          await this.app.storage.updateTransaction(tx, { owner: this.publicKey });
          tweet.renderLikes();
        } else {
          await this.app.storage.updateTransaction(tx, { owner: this.publicKey });
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
      $sig: txmsg.data.signature,
    };
    await app.storage.executeDatabase(sql, params, "redsquare");

    //
    // fetch original
    //
    // servers load from themselves
    //
    // servers update their TX.updated_at timestamps based on current_time, since they won't be
    // fetching the blockchain transiently afterwards while viewing tweets that have loaded from
    // others. this permits browsers to avoid double-liking tweets that show up with pre-calculated
    // likes, as those will also have pre-updated updated_at values.
    //
    // this isn't an ironclad way of avoiding browsers saving likes 2x, but last_updated is not a 
    // consensus variable and if they're loading tweets from server-archives uncritically it is a 
    // sensible set of defaults.
    //
    this.app.storage.loadTransactions({ sig: txmsg.data.signature , owner: this.publicKey }, async (txs) => {
      if (!txs) { return; }
      if (txs.length == 0) { return; }
      let tx = txs[0];
      if (!tx.optional) {
        tx.optional = {};
      }
      if (!tx.optional.num_likes) {
        tx.optional.num_likes = 0;
      }
      tx.optional.updated_at = new Date().getTime();
      tx.optional.num_likes++;
      await this.app.storage.updateTransaction(tx, { owner: this.publicKey }, "localhost");
    }, "localhost");

    //
    // update cache
    //
    this.updateTweetsCacheForBrowsers();

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
      if (keys[i] !== this.publicKey) {
        newtx.addTo(keys[i]);
      }
    }

    await newtx.sign();
    await redsquare_self.app.network.propagateTransaction(newtx);

    return newtx;
  }

  async receiveTweetTransaction(blk, tx, conf, app) {

    console.log(":");
    console.log(":");
    console.log(": receive tweet transaction!");
    console.log(":");
    console.log(":");

    try {

      let tweet = new Tweet(app, this, tx, ".tweet-manager");
      let txmsg = tx.returnMessage();

      //
      // browsers
      //
      if (app.BROWSER == 1) {
        //
        // save tweets addressed to me
        //
        if (tx.isTo(this.publicKey)) {

          //
          // this transaction is TO me, but I may not be the tx.to[0].publicKey address, and thus the archive
          // module may not index this transaction for me in a way that makes it very easy to fetch (field3 = MY_KEY}
          // thus we override the defaults by setting field3 explicitly to our publickey so that loading transactions
          // from archives by fetching on field3 will get this.
          //
          await this.app.storage.saveTransaction(tx, {
            owner: this.publicKey,
            field1: "RedSquare",
            field3: this.publicKey,
          });

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
              await this.app.storage.updateTransaction(
                tx,
                {
                  owner: this.publicKey,
                  field3: this.publicKey,
                },
                "localhost"
              );
              tweet.renderReplies();
            } else {
              await this.app.storage.updateTransaction(
                tx,
                {
                  owner: this.publicKey,
                  field3: this.publicKey,
                },
                "localhost"
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
                await this.app.storage.updateTransaction(
                  tx,
                  {
                    owner: this.publicKey,
                    field3: this.publicKey,
                  },
                  "localhost"
                );
                tweet2.renderRetweets();
              } else {
                await this.app.storage.updateTransaction(
                  tx,
                  {
                    owner: this.publicKey,
                    field3: this.publicKey(),
                  },
                  "localhost"
                );
              }
            }
          }
        }

        this.addTweet(tx, 1);
        return;
      }

      //
      // save this transaction in our archives as a redsquare transaction that is owned by ME (the server), so that I
      // can deliver it to users who want to fetch RedSquare transactions from the archives instead of just through the
      // sql database -- this is done by specifying that I -- "localhost" am the peer required.
      //
      await this.app.storage.saveTransaction(tx, { owner: this.publicKey }, "localhost");

      //
      // servers
      //
      tweet = await tweet.generateTweetProperties(app, this, 1);

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
        $parent_id: tweet.tx.optional.parent_id,
        $type: type_of_tweet,
        $thread_id: tweet.tx.optional.thread_id,
        $publickey: tx.from[0].publicKey,
        $link: tweet.link,
        $link_properties: JSON.stringify(tweet.tx.optional.link_properties),
        $has_images: has_images,
        $tx_size: tx_size,
      };

console.log("TWEETS INSERT: " + JSON.stringify(params));
console.log("TX FROM: " + JSON.stringify(tx.from));
console.log("TX FROM: " + JSON.stringify(tx.from));

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

	//
	// fetch archived copy
        //
        // servers load from themselves
        //
        this.app.storage.loadTransactions({ sig: tweet.thread_id ,owner: this.publicKey }, async (txs) => {
          if (!txs) { return; }
          if (txs.length == 0) { return; }
          let tx = txs[0];
          if (!tx.optional) { tx.optional = {}; }
          if (!tx.optional.num_retweets) {
            tx.optional.num_retweets = 0;
          }
          tx.optional.num_retweets++;
          await this.app.storage.updateTransaction(tx, { owner: this.publicKey }, "localhost");
        }, "localhost");
      }


      if (tweet.parent_id !== tweet.tx.signature && tweet.parent_id !== "") {
        let ts = new Date().getTime();
        let sql4 = "UPDATE tweets SET num_replies = num_replies + 1 WHERE sig = $sig";
        let params4 = {
          $sig: tweet.parent_id,
        };
        await app.storage.executeDatabase(sql4, params4, "redsquare");

        //
        // fetch archived copy
        //
        // servers load from themselves
        //
        this.app.storage.loadTransactions({ sig: tweet.parent_id ,owner: this.publicKey }, async (txs) => {
          if (!txs) { return; }
          if (txs.length == 0) { return; }
          let tx = txs[0];
          if (!tx.optional) { tx.optional = {}; }
          if (!tx.optional.num_replies) {
            tx.optional.num_replies = 0;
          }
          tx.optional.num_replies++;
          await this.app.storage.updateTransaction(tx, { owner: this.publicKey }, "localhost");
        }, "localhost");
      }

      //
      // update cache
      //
      this.updateTweetsCacheForBrowsers();
      this.sqlcache = {};
      return;
    } catch (err) {
      console.log("ERROR in receiveTweetsTransaction() in RedSquare: " + err);
    }
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
      $sig: txmsg.data.signature,
    };
    await app.storage.executeDatabase(sql, params, "redsquare");

    this.sqlcache = [];

    //
    // update cache
    //
    this.updateTweetsCacheForBrowsers();

    return;
  }

  /////////////////////////////////////
  // saving and loading wallet state //
  /////////////////////////////////////
  loadLocalTweets() {

return;

    if (!this.app.BROWSER) { return; }

    if (this.app.browser.returnURLParameter("tweet_id")) {
      return;
    }
    if (this.app.browser.returnURLParameter("user_id")) {
      return;
    }

    localforage.getItem(`tweet_history`, (error, value) => {
      if (value && value.length > 0) {
        for (let tx of value) {
          let newtx = new Transaction();
          newtx.deserialize_from_web(this.app, tx);
          this.addTweet(newtx);
        }
      } else {
        //
        // servers can suggest a number of curated tweets for instant-loading
        // and display. this avoids the need for the browser to handshake with
        // the peer before there is something to load on-screen.
        //
        // if our browser has loaded cached tweets through a direct
        // download they will be in our tweets object already and we can and
        // should display them to speed-up the experience of using Red Square.
        //
        // this runs after components are rendered or it breaks/fails
        //
        try {
//
//
// CACHE TWEETS LOADED HERE
//
//
//
//
//
          //Prefer our locally cached tweets to the webServer ones
          if (window?.tweets?.length > 0) {
            console.log("Using Server Cached Tweets");
            for (let z = 0; z < window.tweets.length; z++) {
              //console.log(window.tweets[z]);
              let newtx = new Transaction();
              newtx.deserialize_from_web(this.app, window.tweets[z]);
              //console.log(newtx);
              this.addTweet(newtx);
            }
          }
        } catch (err) {
          console.log("error in initial redsquare post fetch: " + err);
        }

        this.saveLocalTweets();
      }
      if (this.browser_active && this.rendered) {
        this.app.connection.emit("redsquare-home-render-request", false);
      }
    });
  }

  loadOptions() {
    if (!this.app.BROWSER) {
      return;
    }

    if (this.app.options.redsquare) {
      this.notifications_last_viewed_ts = this.app.options.redsquare.notifications_last_viewed_ts;
      this.notifications_number_unviewed = this.app.options.redsquare.notifications_number_unviewed;
    } else {
      this.app.options.redsquare = {};
      this.notifications_last_viewed_ts = new Date().getTime();
      this.notifications_number_unviewed = 0;
    }

    if (this.app.options.redsquare.liked_tweets) {
      this.liked_tweets = this.app.options.redsquare.liked_tweets;
    }
    if (this.app.options.redsquare.retweeted_tweets) {
      this.retweeted_tweets = this.app.options.redsquare.retweeted_tweets;
    }
    if (this.app.options.redsquare.replied_tweets) {
      this.replied_tweets = this.app.options.redsquare.replied_tweets;
    }
  }

  saveOptions() {
    if (!this.app.BROWSER || !this.browser_active) {
      return;
    }

    if (!this.app.options?.redsquare) {
      this.app.options.redsquare = {};
    }

    this.app.options.redsquare.notifications_last_viewed_ts = this.notifications_last_viewed_ts;
    this.app.options.redsquare.notifications_number_unviewed = this.notifications_number_unviewed;

    while (this.liked_tweets.length > 100) {
      this.liked_tweets.splice(0, 1);
    }
    while (this.retweeted_tweets.length > 100) {
      this.retweeted_tweets.splice(0, 1);
    }
    while (this.replied_tweets.length > 100) {
      this.replied_tweets.splice(0, 1);
    }

    this.app.options.redsquare.liked_tweets = this.liked_tweets;
    this.app.options.redsquare.retweeted_tweets = this.retweeted_tweets;
    this.app.options.redsquare.replied_tweets = this.replied_tweets;

    //console.log(JSON.parse(JSON.stringify(this.app.options.redsquare)));
    this.app.storage.saveOptions();
  }


  //////////////
  // remember //
  //////////////
  likeTweet(sig = "") {
    if (sig === "") {
      return;
    }
    if (!this.liked_tweets.includes(sig)) {
      this.liked_tweets.push(sig);
    }
    this.saveOptions();
  }
  unlikeTweet(sig = "") {
    if (sig === "") {
      return;
    }
    if (this.liked_tweets.includes(sig)) {
      for (let i = 0; i < this.liked_tweets.length; i++) {
        if (this.liked_tweets[i] === sig) {
          this.liked_tweets.splice(i, 1);
          i--;
        }
      }
    }
    this.saveOptions();
  }
  retweetTweet(sig = "") {
    if (sig === "") {
      return;
    }
    if (!this.retweeted_tweets.includes(sig)) {
      this.retweeted_tweets.push(sig);
    }
    this.saveOptions();
  }
  unretweetTweet(sig = "") {
    if (sig === "") {
      return;
    }
    if (this.retweeted_tweets.includes(sig)) {
      for (let i = 0; i < this.retweeted_tweets.length; i++) {
        if (this.retweeted_tweets[i] === sig) {
          this.retweeted_tweets.splice(i, 1);
          i--;
        }
      }
    }
    this.saveOptions();
  }
  replyTweet(sig = "") {
    if (sig === "") {
      return;
    }
    if (!this.replied_tweets.includes(sig)) {
      this.replied_tweets.push(sig);
    }
    this.saveOptions();
  }
  unreplyTweet(sig = "") {
    if (sig === "") {
      return;
    }
    if (this.replied_tweets.includes(sig)) {
      for (let i = 0; i < this.replied_tweets.length; i++) {
        if (this.replied_tweets[i] === sig) {
          this.replied_tweets.splice(i, 1);
          i--;
        }
      }
    }
    this.saveOptions();
  }

  async saveLocalTweets() {
    if (!this.app.BROWSER || !this.browser_active) {
      return;
    }

    this.saveOptions();

    let tweet_txs = [];
    let maximum = 10;
    for (let tweet of this.tweets) {
      tweet.tx.optional.updated_at = tweet.updated_at;
      // let tweet_json = tweet.tx.toJson();
      // tweet_json.optional = tweet.tx.optional;
      tweet_txs.push(tweet.tx.serialize_to_web(this.app));
      if (--maximum <= 0) {
        break;
      }
    }
    console.log("start save");
    localforage.setItem(`tweet_history`, tweet_txs).then(function () {
      console.log(`Saved ${tweet_txs.length} tweets`);
    });
  }


  //
  // writes the latest 10 tweets to tweets.js
  //
  async updateTweetsCacheForBrowsers() {
    let hex_entries = [];

    let sql = `SELECT *, (updated_at + 10 * (num_likes + num_replies + num_retweets)) AS virality
               FROM tweets
               WHERE (flagged IS NOT 1 AND moderated IS NOT 1 AND tx_size > 1000)
               ORDER BY virality DESC LIMIT 10`;

    let params = {};
    let rows = await this.app.storage.queryDatabase(sql, params, "redsquare");

    for (let i = 0; i < rows.length; i++) {
      if (!rows[i].tx) {
        continue;
      }
      // create the transaction
      let tx = new Transaction();
      tx.deserialize_from_web(this.app, rows[i].tx);

      if (rows[i].num_reples) {
        tx.optional.num_replies = rows[i].num_replies;
      }
      if (rows[i].num_retweets) {
        tx.optional.num_retweets = rows[i].num_retweets;
      }
      if (rows[i].num_likes) {
        tx.optional.num_likes = rows[i].num_likes;
      }
      if (rows[i].flagged) {
        tx.optional.flagged = rows[i].flagged;
      }
      let tweet = new Tweet(this.app, this, tx, "");
      let hexstring = tx.serialize_to_web(this.app);
      hex_entries.push(hexstring);
    }

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

  ///////////////
  // webserver //
  ///////////////
  webServer(app, expressapp, express) {
    let webdir = `${__dirname}/../../mods/${this.dirname}/web`;
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
              let tx = new Transaction();
              tx.deserialize_from_web(this.app, rows[i].tx);

              let txmsg = tx.returnMessage();
              let text = txmsg.data.text;
              let publicKey = tx.from[0].publicKey;
              let user = app.keychain.returnIdentifierByPublicKey(publicKey, true);

              redsquare_self.social.twitter_description = text;
              redsquare_self.social.og_description = text;
              redsquare_self.social.og_url = reqBaseURL + encodeURI(redsquare_self.returnSlug());

              // if (typeof tx.msg.data.images != "undefined") {
              //   let image = tx.msg.data?.images[0];
              // } else {
              //   let publicKey = tx.from[0].publicKey;
              //   let image = app.keychain.returnIdenticon(publicKey);
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
              let tx = new Transaction();
              tx.deserialize_from_web(this.app, rows[i].tx);

              //console.info(rows[i]);
              let txmsg = tx.returnMessage();
              //console.info(txmsg);
              if (typeof txmsg.data.images != "undefined") {
                let img_uri = txmsg.data?.images[0];
                let img_type = img_uri.substring(img_uri.indexOf(":") + 1, img_uri.indexOf(";"));
                let base64Data = img_uri.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
                let img = Buffer.from(base64Data, "base64");
              } else {
                let publicKey = tx.from[0].publicKey;
                let img_uri = app.keychain.returnIdenticon(publicKey, "png");
                let base64Data = img_uri.replace(/^data:image\/png;base64,/, "");
                let img = Buffer.from(base64Data, "base64");
                let img_type = img_uri.substring(img_uri.indexOf(":") + 1, img_uri.indexOf(";"));
              }

              if (img_type == "image/svg+xml") {
                img_type = "image/svg";
              }

              console.info("### write from redsquare.js:1651 (request Open Graph Image)");
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

      // use index.js
      res.setHeader("Content-type", "text/html");
      res.charset = "UTF-8";
      res.send(redsquareHome(app, redsquare_self));
      return;
    });

    expressapp.use("/" + encodeURI(this.returnSlug()), express.static(webdir));
  }

  //
  // servers can fetch open graph graphics
  //
  async fetchOpenGraphProperties(app, mod, link) {
    if (app.BROWSER != 1) {
      return fetch(link, { redirect: "follow", follow: 50 })
        .then((res) => res.text())
        .then((data) => {
          let no_tags = {
            title: "",
            description: "",
          };

          let og_tags = {
            "og:exists": false,
            "og:title": "",
            "og:description": "",
            "og:url": "",
            "og:image": "",
            "og:site_name": "", //We don't do anything with this
          };

          let tw_tags = {
            "twitter:exists": false,
            "twitter:title": "",
            "twitter:description": "",
            "twitter:url": "",
            "twitter:image": "",
            "twitter:site": "", //We don't do anything with this
            "twitter:card": "", //We don't do anything with this
          };

          // prettify html - unminify html if minified
          let html = prettify(data);

          //Useful to check, don't delete until perfect
          //let testReg = /<head>.*<\/head>/gs;
          //console.log(html.match(testReg));

          // parse string html to DOM html
          let dom = HTMLParser.parse(html);

          try {
            no_tags.title = dom.getElementsByTagName("title")[0].textContent;
          } catch (err) {}

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
            if (property in tw_tags) {
              tw_tags[property] = content;
              tw_tags["twitter:exists"] = true;
            }
            if (meta_tags[i].getAttribute("name") === "description") {
              no_tags.description = content;
            }
          }

          // fallback to no tags
          og_tags["og:title"] = og_tags["og:title"] || no_tags["title"];
          og_tags["og:description"] = og_tags["og:description"] || no_tags["description"];

          if (tw_tags["twitter:exists"] && !og_tags["og:exists"]) {
            og_tags["og:title"] = tw_tags["twitter:title"];
            og_tags["og:description"] = tw_tags["twitter:description"];
            og_tags["og:url"] = tw_tags["twitter:url"];
            og_tags["og:image"] = tw_tags["twitter:image"];
            og_tags["og:site_name"] = tw_tags["twitter:site"];
          }

          return og_tags;
        })
        .catch((err) => {
          console.error("Error fetching content: " + err);
          return "";
        });
    } else {
      return "";
    }
  }
}

module.exports = RedSquare;

