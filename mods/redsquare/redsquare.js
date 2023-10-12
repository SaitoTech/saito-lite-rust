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
const localforage = require("localforage");
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

    this.tweets = [];
    this.tweets_sigs_hmap = {};
    this.unknown_children = [];

    this.peers = [];

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

    this.styles = ["/redsquare/style.css"];

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

          //Id created by app.browser.addDragAndDrop
          //post.triggerClick("#hidden_file_element_tweet-overlay");
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
    await super.initialize(app);

    if (this.browser_active) {
      this.styles = ["/saito/saito.css", "/redsquare/style.css"];
    }

    //
    // this prints the last 10 tweets to ./web/tweets.js which is optionally
    // fetched by browsers. It allows us to rapidly put the last 10 tweets we
    // prefer at the top of their feed for more rapid page load.
    //
    if (!app.BROWSER) {
      await this.updateTweetsCacheForBrowsers();
    } else {
      //
      // fetch content from options file -- regardless of whether we are accessing redsquare or not!
      //
      this.loadOptions();
      this.loadLocalTweets();
    }
  }

  //
  // this initializes the DOM but does not necessarily show the loaded content
  // onto the page, as we are likely being asked to render the components on
  // the application BEFORE we have any peers capable of feeding us content.
  //
  async render() {
    if (!this.app.BROWSER) {
      return;
    }

    if (this.app.options.theme) {
      let theme = this.app.options.theme[this.slug];
      if (theme != null) {
        this.app.browser.switchTheme(theme);
      }
    }

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
    // redsquare -- load tweets
    //
    if (service.service === "redsquare") {
      this.addPeer(peer, "tweets");

      //
      // render tweet + children
      //
      let tweet_id = this.app.browser.returnURLParameter("tweet_id");
      if (tweet_id === "undefined") {
        tweet_id = "";
      }
      if (tweet_id != "") {
        let sql = `SELECT *
                   FROM tweets
		   WHERE thread_id = (SELECT thread_id FROM tweets WHERE sig = '${tweet_id}') 
                   ORDER BY created_at ASC`;
        this.loadTweetsFromPeer(peer, sql, (txs) => {
          for (let z = 0; z < txs.length; z++) {
            this.addTweet(txs[z]);
          }
          let tweet = this.returnTweet(tweet_id);
          if (tweet) {
            this.app.connection.emit("redsquare-tweet-render-request", tweet);
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

      //
      // or fetch tweets
      //

      this.loadNewTweets(null, (txs) => {
        if (txs.length > 0) {
          this.app.connection.emit("redsquare-new-tweets-notification-request");
        }
      });
    }

    //
    // archive -- load notifications
    //
    if (service.service === "archive") {
      this.addPeer(peer, "notifications");

      setTimeout(() => {
        //        this.loadNotifications(peer, () => {});
      }, 1500);
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

    //
    // render user profile
    //
  }

  //
  // adds peer to list of content sources
  //
  addPeer(peer, type = "tweets") {
    let has_tweets = false;
    let has_notifications = false;

    if (type === "tweets") {
      has_tweets = true;
    }
    if (type === "notifications") {
      has_notifications = true;
    }

    for (let i = 0; i < this.peers.length; i++) {
      if (this.peers[i].publicKey == peer.publicKey) {
        this.peers[i].peer = peer;
        if (has_tweets) {
          this.peers[i].tweets = true;
        }
        if (has_notifications) {
          this.peers[i].notifications = true;
        }
        return;
      }
    }

    //
    // Peer not already in list -- add it
    //
    this.peers.push({
      peer: peer,
      publicKey: peer.publicKey,
      tweets_earliest_ts: new Date().getTime(),
      tweets_latest_ts: 0,
      tweets_limit: 20,
      profile_earliest_ts: new Date().getTime(),
      profile_limit: 20,
      notifications_limit: 500,
      has_tweets: has_tweets,
      has_notifications: has_notifications,
    });
  }

  updatePeerStat(ts, field = "tweets_earliest_ts", peer = null) {
    if (peer) {
      for (let i = 0; i < this.peers.length; i++) {
        if (this.peers[i].peer == peer) {
          this.peers[i][field] = ts;

          //Sanity check - so first intersection observer returns something
          if (
            this.peers[i].tweets_earliest_ts > this.peers[i].tweets_latest_ts &&
            this.peers[i].tweets_latest_ts > 0
          ) {
            this.peers[i].tweets_earliest_ts = this.peers[i].tweets_latest_ts;
          }
        }
      }
    } else {
      for (let i = 0; i < this.peers.length; i++) {
        this.peers[i][field] = ts;
      }
    }
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

  returnLatestTimeStamp() {
    let ts = 0;
    for (let tweet of this.tweets) {
      if (tweet.updated_at > ts) {
        ts = tweet.updated_at;
      }
    }
    return ts;
  }

  ///////////////////////
  // network functions //
  ///////////////////////
  async onConfirmation(blk, tx, conf) {
    let txmsg = tx.returnMessage();
    try {
      if (conf == 0) {
        if (txmsg.request === "create tweet") {
          console.log("#");
          console.log("# RECEIVED TWEET TRANSACTION: " + JSON.stringify(txmsg));
          console.log("#");
          await this.receiveTweetTransaction(blk, tx, conf);
        }
        if (txmsg.request === "like tweet") {
          console.log("#");
          console.log("# RECEIVED LIKE TRANSACTION: " + JSON.stringify(txmsg));
          console.log("#");
          await this.receiveLikeTransaction(blk, tx, conf);
        }
        if (txmsg.request === "flag tweet") {
          await this.receiveFlagTransaction(blk, tx, conf);
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
  // NOTE - we are ignoring PEER here and making request of ALL peers
  // but am leaving function name intact in case we want to add a meta-layer
  // that discriminates.
  //
  loadProfileTweets(peer, publicKey = "", mycallback) {
    for (let i = 0; i < this.peers.length; i++) {
      let peer = this.peers[i].peer;

      let time_cutoff = this.peers[i].profile_earliest_ts || new Date().getTime();

      let sql = `SELECT *
                 FROM tweets
                 WHERE publickey = '${publicKey}'
                   AND updated_at < ${time_cutoff}
                 ORDER BY created_at DESC LIMIT '${this.peers[i].profile_limit}'`;
      this.loadTweetsFromPeer(peer, sql, (txs) => {
        this.updatePeerStat(
          this.returnEarliestTimestampFromTransactionArray(txs),
          "profile_earliest_ts",
          peer
        );

        if (mycallback) {
          mycallback(txs);
        }
      });
    }
  }

  loadTweets(peer, mycallback) {
    for (let i = 0; i < this.peers.length; i++) {
      let peer = this.peers[i].peer;

      let time_cutoff = this.peers[i].tweets_earliest_ts || new Date().getTime();

      let sql = `SELECT *
                 FROM tweets
                 WHERE parent_id = ""
                   AND flagged IS NOT 1
                   AND moderated IS NOT 1
                   AND tx_size < 10000000
                   AND updated_at < ${time_cutoff}
                 ORDER BY updated_at DESC LIMIT '${this.peers[i].tweets_limit}'`;

      this.loadTweetsFromPeer(peer, sql, (txs) => {
        this.updatePeerStat(
          this.returnEarliestTimestampFromTransactionArray(txs),
          "tweets_earliest_ts",
          peer
        );

        if (mycallback) {
          mycallback(txs);
        }
      });
    }
  }

  loadNewTweets(peer, mycallback) {
    for (let i = 0; i < this.peers.length; i++) {
      let peer = this.peers[i].peer;

      let time_cutoff = this.peers[i].tweets_latest_ts || this.returnLatestTimeStamp();
      //
      // 7/7 -- let's try not excluding replies from the data pull -- the renderWithCriticalChild should keep things from looking too crazy on the main feed
      //
      let sql = `SELECT *
                 FROM tweets
                 WHERE flagged IS NOT 1
                   AND moderated IS NOT 1
                   AND tx_size < 10000000
                   AND updated_at > ${time_cutoff}
                 ORDER BY updated_at DESC LIMIT '${this.peers[i].tweets_limit}'`;

      this.loadTweetsFromPeer(peer, sql, (txs) => {
        let newTimeStamp = this.returnLatestTimeStamp();
        this.updatePeerStat(newTimeStamp, "tweets_latest_ts", peer);
        if (mycallback) {
          mycallback(txs);
        }
      });
    }
  }

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

  loadTweetWithSig(sig, mycallback = null) {
    let t = this.returnTweet(sig);
    if (t?.tx) {
      if (mycallback) {
        mycallback(t.tx);
      }
      return;
    }

    let sql = `SELECT *
               FROM tweets
               WHERE sig = '${sig}'
               ORDER BY created_at DESC`;

    for (let i = 0; i < this.peers.length; i++) {
      let peer = this.peers[i].peer;

      this.loadTweetsFromPeer(peer, sql, mycallback);
    }
  }

  loadTweetsFromPeer(peer, sql, mycallback = null) {
    let txs = [];

    this.loadTweetsFromPeerAndReturn(peer, sql, (txs) => {
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

    this.sendPeerDatabaseRequestWithFilter(
      "RedSquare",
      sql,
      async (res) => {
        if (res.rows) {
          res.rows.forEach((row) => {
            let tx = new Transaction();
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
            tx.optional.updated_at = row.updated_at;
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

  //
  // NOTE - we are ignoring PEER here and making request of ALL peers
  // but am leaving function name intact in case we want to add a meta-layer
  // that discriminates.
  //
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
      this.app.storage.loadTransactions(
        {
          field3: this.publicKey,
          //created_later_than: this.notifications_last_viewed_ts,
          limit: this.peers[i].limit,
        },

        async (txs) => {
          if (txs.length > 0) {
            for (let z = 0; z < txs.length; z++) {
              txs[z].decryptMessage(this.app);
              this.addTweet(txs[z]);
            }
          }

          if (mycallback) {
            await mycallback(txs);
          }
        },
        this.peers[i].peer
      );
    }
  }

  //
  // adds tweets to internal data structure
  //
  // likes, retweets, replies notifications are added through this function.
  //
  addTweet(tx, prepend = false) {
    //
    // create the tweet
    //
    let tweet = new Tweet(this.app, this, tx);
    console.log("ADD TWEET: " + tweet.text);
    console.log("w/ sig: " + tx.signature);
    console.log("parent id: " + tweet.parent_id);
    //
    // skip duplicates
    //
    if (this.tweets_sigs_hmap[tx.signature] || this.notifications_sigs_hmap[tx.signature]) {
      console.log("DUPLICATE - skipping -> " + tweet.text);
      return;
    }

    if (!tweet?.noerrors) {
      return;
    }

    console.log("adding tweet: " + tweet.text);
    if (tweet.tx.optional.num_replies) {
      console.log("num replies: " + tweet.tx.optional.num_replies);
    } else {
      console.log("num replies: 0");
    }
    if (tweet.tx.optional.num_retweets) {
      console.log("num retweets: " + tweet.tx.optional.num_retweets);
    } else {
      console.log("num retweets: 0");
    }
    if (tweet.tx.optional.num_likes) {
      console.log("num likes: " + tweet.tx.optional.num_likes);
    } else {
      console.log("num likes: 0");
    }

    //
    // maybe this needs to go into notifications too
    //
    if (tx.isTo(this.publicKey)) {
      //
      // notify of other people's actions, but not ours
      //
      if (!tx.isFrom(this.publicKey) && !this.notifications_sigs_hmap[tx.signature]) {
        let insertion_index = 0;
        if (prepend == false) {
          for (let i = 0; i < this.notifications.length; i++) {
            if (tweet.updated_at > this.notifications[i].updated_at) {
              break;
            }
            insertion_index++;
          }
        }

        this.notifications.splice(insertion_index, 0, tweet);
        this.notifications_sigs_hmap[tx.signature] = 1;

        //
        // increment notifications in menu unless is our own
        //
        if (tx.timestamp > this.notifications_last_viewed_ts) {
          this.notifications_last_viewed_ts = tx.timestamp;
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
      // check where we insert the tweet
      //
      let insertion_index = 0;
      if (!prepend) {
        for (let i = 0; i < this.tweets.length; i++) {
          if (tweet.updated_at > this.tweets[i].updated_at) {
            break;
          }
          insertion_index++;
        }
      }

      //
      // and insert it
      //
      this.tweets.splice(insertion_index, 0, tweet);
      this.tweets_sigs_hmap[tweet.tx.signature] = 1;

      //
      // add unknown children if possible
      //
      for (let i = 0; i < this.unknown_children.length; i++) {
        if (this.unknown_children[i].tx.optional.thread_id === tweet.tx.signature) {
          if (tweet.addTweet(this.unknown_children[i]) == 1) {
            this.unknown_children.splice(i, 1);
            i--;
          }
        }
      }

      //
      // this is a comment
      //
    } else {
      let inserted = false;

      console.log("number of tweets already existing: " + this.tweets.length);

      console.log("looking for this thread: " + tweet.thread_id);
      for (let i = 0; i < this.tweets.length; i++) {
        if (this.tweets[i].thread_id === tweet.thread_id) {
          this.tweets[i].addTweet(tweet);
          this.tweets_sigs_hmap[tweet.tx.signature] = 1;
          inserted = true;
          break;
        }
      }

      if (inserted == false) {
        //alert("not inserted... unknown children: " + tweet.text);
        this.tweets_sigs_hmap[tweet.tx.signature] = 1;
        this.unknown_children.push(tweet);
      }
    }

    /*
    let output = {};
    for (let i = 0; i < this.tweets.length; i++){
        output[i] = this.tweets[i].formatDate();
    }
    console.log(JSON.parse(JSON.stringify(output)));
    */
  }

  returnTweet(tweet_sig = null) {
    if (tweet_sig == null) {
      return null;
    }
    if (!this.tweets_sigs_hmap[tweet_sig]) {
      console.log("tweets not in sigs hmap!");
      return null;
    }

    //Performs a recursive search
    console.log("tweets length: " + this.tweets.length);
    for (let i = 0; i < this.tweets.length; i++) {
      console.log("checking... " + i);
      if (this.tweets[i].hasChildTweet(tweet_sig)) {
        console.log("has child tweet...");
        return this.tweets[i].returnChildTweet(tweet_sig);
      }
    }
    console.log("returning null");

    return null;
  }

  ////////////////////////////////////////////////
  ///            Network TX
  /// 1) create tweet
  /// 2) like tweet
  /// 3) flag tweet
  ///////////////////////////////////////////////

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

  async receiveTweetTransaction(blk, tx, conf) {
    try {
      let txmsg = tx.returnMessage();

      //
      // browsers
      //
      if (this.app.BROWSER == 1) {
        //
        // save tweets addressed to me
        //
        if (tx.isTo(this.publicKey)) {
          console.log("Receive tweet --> Save notification to archive");

          //
          // this transaction is TO me, but I may not be the tx.to[0].publicKey address, and thus the archive
          // module may not index this transaction for me in a way that makes it very easy to fetch (field3 = MY_KEY}
          // thus we override the defaults by setting field3 explicitly to our publicKey so that loading transactions
          // from archives by fetching on field3 will get this.
          //
          this.app.storage.saveTransaction(tx, {
            owner: this.publicKey,
            field3: this.publicKey,
          });

          console.log("Receive tweet --> Save notification to archive 2");

          //
          // if replies
          //
          if (txmsg.data?.parent_id) {
            let tweet = this.returnTweet(txmsg.data.parent_id);
            if (tweet) {
              if (this.tweets_sigs_hmap[txmsg.data.parent_id]) {
                console.log(
                  "SAVING: updating num_replies on parent tweet: " + txmsg.data.parent_id
                );
                if (tweet == null) {
                  return;
                }
                if (tweet.tx == null) {
                  return;
                }
                if (!tweet.tx.optional) {
                  tweet.tx.optional = {};
                }
                if (!tweet.tx.optional.num_replies) {
                  tweet.tx.optional.num_replies = 0;
                }

                if (!tx.isFrom(this.publicKey)) {
                  //                  tweet.tx.optional.num_replies++;
                  console.log("existing tweet replies: " + tweet.tx.optional.num_replies);
                  console.log("existing tweet replies: " + tweet.tx.optional.num_replies);
                  //console.log("$");
                  //console.log("$");
                  //console.log("$");
                  //console.log("$ Incrementing NUM replies to " + tweet.tx.optional.num_replies);
                  //console.log("$");
                  //console.log("$");
                  //console.log("$");
                  tweet.renderReplies();
                }

                this.app.storage.updateTransaction(tweet.tx, {
                  owner: this.publicKey,
                  field3: this.publicKey,
                });
              } else {
                console.log(
                  "SAVING: child tweet? updating num_replies for: " + txmsg.data.parent_id
                );
                if (tweet.tx) {
                  if (!tweet.tx.optional) {
                    tweet.tx.optional = {};
                  }
                  if (!tweet.tx.optional.num_replies) {
                    tweet.tx.optional.num_replies = 0;
                  }
                  tweet.tx.optional.num_retweets++;

                  this.app.storage.updateTransaction(tweet.tx, {
                    owner: this.publicKey,
                    field3: this.publicKey,
                  });
                }
              }
            }
          }

          console.log("Receive tweet --> Save notification to archive 3");

          //
          // if retweets
          //
          if (txmsg.data?.retweet_tx) {
            let rtx = new Transaction();
            rtx.deserialize_from_web(this.app, txmsg.data.retweet_tx);

            let tweet2 = this.returnTweet(rtx.signature);
            if (tweet2) {
              console.log("SAVING: retweets updating num_retweets 1");
              if (this.tweets_sigs_hmap[rtx.signature]) {
                if (tweet2 == null) {
                  return;
                }
                if (!tweet2.tx.optional) {
                  tweet2.tx.optional = {};
                }
                if (!tweet2.tx.optional.num_retweets) {
                  tweet2.tx.optional.num_retweets = 0;
                }
                tweet2.tx.optional.num_retweets++;
                this.app.storage.updateTransaction(tweet2.tx, {
                  owner: this.publicKey,
                  field3: this.publicKey,
                });
                tweet2.renderRetweets();
              } else {
                console.log("SAVING: retweets updating num_retweets 2");
                if (!tweet2.tx.optional) {
                  tweet2.tx.optional = {};
                }
                if (!tweet2.tx.optional.num_retweets) {
                  tweet2.tx.optional.num_retweets = 0;
                }
                tweet2.tx.optional.num_retweets++;

                this.app.storage.updateTransaction(tweet2.tx, {
                  owner: this.publicKey,
                  field3: this.publicKey,
                });
              }
            }
          }
        }

        console.log("Receive tweet --> Save notification to archive 4");
        this.addTweet(tx, 1);
        console.log("Receive tweet --> Save notification to archive 5");
        return;
      }

      //
      // servers
      //
      let tweet = new Tweet(this.app, this, tx, "");

      if (!tweet?.noerrors) {
        return;
      }

      tweet = await tweet.generateTweetProperties(this.app, this, 1);

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
      //This is the received TX without included optional data!
      let txjson = tx.serialize_to_web(this.app);
      let tx_size = txjson.length;

      let params = {
        $txjson: txjson,
        $sig: tx.signature,
        $created_at: created_at,
        $updated_at: updated_at,
        $parent_id: tweet.tx.optional.parent_id,
        $type: type_of_tweet,
        $thread_id: tweet.tx.optional.thread_id || tx.signature,
        $publickey: tx.from[0].publicKey,
        $link: tweet.link,
        $link_properties: JSON.stringify(tweet.tx.optional.link_properties),
        $has_images: has_images,
        $tx_size: tx_size,
      };

      console.log(params);
      let result = await this.app.storage.executeDatabase(sql, params, "redsquare");
      console.log(result);

      // If you just inserted a record, you don't need to update its updated_at right away
      // but if it is part of a thread, then yes!
      // We should update the whole thread (?) or just the root tweet
      if (tx.signature !== tweet.thread_id) {
        let ts = tx.timestamp;
        let sql2 = "UPDATE tweets SET updated_at = $timestamp WHERE sig = $sig";
        let params2 = {
          $timestamp: ts,
          $sig: tweet.thread_id,
        };
        await this.app.storage.executeDatabase(sql2, params2, "redsquare");
      }

      if (tweet.retweet_tx != null) {
        let sql3 = "UPDATE tweets SET num_retweets = num_retweets + 1 WHERE sig = $sig";
        let params3 = {
          $sig: tweet.retweet.tx.signature,
        };
        await this.app.storage.executeDatabase(sql3, params3, "redsquare");
      }

      if (tweet.parent_id !== tweet.tx.signature && tweet.parent_id !== "") {
        let sql4 = "UPDATE tweets SET num_replies = num_replies + 1 WHERE sig = $sig";
        let params4 = {
          $sig: tweet.parent_id,
        };
        console.log("$$");
        console.log("$$");
        console.log("$$");
        console.log("$$ server incrementing NUM replies to " + tweet.parent_id);
        console.log("$$");
        console.log("$$");
        console.log("$$");
        await this.app.storage.executeDatabase(sql4, params4, "redsquare");
      }

      //
      // update cache
      //
      await this.updateTweetsCacheForBrowsers();
    } catch (err) {
      console.error("ERROR in receiveTweetsTransaction() in RedSquare: " + err);
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
      newtx.addTo(tx.to[i].publicKey);
    }

    newtx.msg = obj;
    await newtx.sign();
    await redsquare_self.app.network.propagateTransaction(newtx);
    return newtx;
  }

  async receiveLikeTransaction(blk, tx, conf) {
    //
    // browsers
    //
    if (this.app.BROWSER == 1) {
      //
      // save my likes
      //
      if (tx.isTo(this.publicKey)) {
        //
        // ignore if already added
        //
        if (this.tweets_sigs_hmap[tx.signature]) {
          console.log("like tweet, but we have already processed / added");
          return;
        }

        this.app.storage.saveTransaction(tx, {
          owner: this.publicKey,
          field3: this.publicKey,
        });

        //
        // save optional likes
        //
        let txmsg = tx.returnMessage();

        if (this.tweets_sigs_hmap[txmsg.data.signature]) {
          let tweet = this.returnTweet(txmsg.data.signature);
          if (tweet == null) {
            return;
          }
          let liked_tx = tweet.tx;
          if (!liked_tx.optional) {
            liked_tx.optional = {};
          }
          if (!liked_tx.optional.num_likes) {
            liked_tx.optional.num_likes = 0;
          }
          console.log("liked_tx has N optional likes: " + liked_tx.optional.num_likes);
          liked_tx.optional.num_likes++;
          console.log("incrementing to: " + liked_tx.optional.num_likes);
          this.app.storage.updateTransaction(liked_tx, { owner: this.publicKey });
          tweet.renderLikes();
        }
      }

      //
      // convert like into tweet and addTweet to get notifications working
      //
      this.addTweet(tx);

      return;
    }

    //
    // servers
    //
    let txmsg = tx.returnMessage();
    let sql = `UPDATE tweets
               SET num_likes  = num_likes + 1,
                   updated_at = $timestamp
               WHERE sig = $sig`;
    let params = {
      $sig: txmsg.data.signature,
      $timestamp: tx.timestamp,
    };

    await this.app.storage.executeDatabase(sql, params, "redsquare");

    //
    // update cache
    //
    await this.updateTweetsCacheForBrowsers();

    return;
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

  async receiveFlagTransaction(blk, tx, conf) {
    //
    // browsers
    //
    if (this.app.BROWSER == 1) {
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
    await this.app.storage.executeDatabase(sql, params, "redsquare");

    //
    // update cache
    //
    await this.updateTweetsCacheForBrowsers();
  }

  /////////////////////////////////////
  // saving and loading wallet state //
  /////////////////////////////////////
  loadLocalTweets() {
    if (this.app.browser.returnURLParameter("tweet_id")) {
      return;
    }
    if (this.app.browser.returnURLParameter("user_id")) {
      return;
    }

    /****
*
* NOTE - code kept for reference but should not be used without serious testing over
* whether the saved / loaded versions are properly updated, as this screws up tracking
* likes / replies / retweets, and we want to shift to browsers storing their own tweets
* in localDB instead of localforage...
*
    localforage.getItem(`tweet_history`, (error, value) => {
      if (value && value.length > 0) {
        console.log("Using local forage");
        for (let tx of value) {
          //console.log(tx);
          // let txobj = JSON.parse(tx);
          let newtx = new Transaction();
          newtx.deserialize_from_web(this.app, tx);
          // if (txobj.optional) {
          //   newtx.optional = txobj.optional;
          // }
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
****/
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

  //////////////////////////////////////////////////////////
  /////       **** WEB SERVER STUFF  *****
  /////////////////////////////////////////////////////////
  async fetchOpenGraphProperties(app, mod, link) {
    if (app.BROWSER != 1) {
      // fetch source code for link inside tweet
      // (sites which uses firewall like Cloudflare shows Cloudflare loading
      //  page when fetching page source)

      return fetch(link, { redirect: "follow", follow: 50 })
        .then((res) => res.text())
        .then((data) => {
          // required og properties for link preview
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

          //Fall back to no tags
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

  //
  // writes the latest 10 tweets to tweets.js
  //
  async updateTweetsCacheForBrowsers() {
    //
    // DISABLE FOR NOW
    //
    return;

    let hex_entries = [];

    /*let sql = `SELECT * FROM tweets WHERE (flagged IS NOT 1 AND moderated IS NOT 1) AND
                    (((num_replies > 0 OR num_likes > 0) AND parent_id IS NOT "") OR (parent_id IS "")) AND
                    (sig IN (SELECT sig FROM tweets WHERE parent_id = "" AND flagged IS NOT 1 AND moderated IS NOT 1 AND tx_size < 10000000 ORDER BY updated_at DESC LIMIT 10)) OR
                    (thread_id IN (SELECT sig FROM tweets WHERE parent_id = "" AND flagged IS NOT 1 AND moderated IS NOT 1 AND tx_size < 10000000 ORDER BY updated_at DESC LIMIT 10)) ORDER BY created_at ASC LIMIT 10`;
    */

    //Alternate selection
    let sql = `SELECT *, (updated_at + 10 * (num_likes + num_replies + num_retweets)) AS virality
               FROM tweets
               WHERE (flagged IS NOT 1 AND moderated IS NOT 1)
               ORDER BY virality DESC LIMIT 10`;

    let params = {};
    let rows = await this.app.storage.queryDatabase(sql, params, "redsquare");

    console.log("Saving viral tweets");
    for (let i = 0; i < rows.length; i++) {
      if (!rows[i].tx) {
        continue;
      }
      //console.log(rows[i].tx);
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
      //console.log(tx);
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

  webServer(app, expressapp, express) {
    let webdir = `${__dirname}/../../mods/${this.dirname}/web`;
    //let fs = app?.storage?.returnFileSystem();
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
      //Use index.js
      console.info("### write from redsquare.js:1652.");
      res.setHeader("Content-type", "text/html");
      res.charset = "UTF-8";
      res.send(redsquareHome(app, redsquare_self));
      return;
    });

    expressapp.use("/" + encodeURI(this.returnSlug()), express.static(webdir));
  }
}

module.exports = RedSquare;
