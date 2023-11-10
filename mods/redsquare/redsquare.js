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
//const RedSquareHammerSwipe = require("./lib/redsquare-hammer-swipe/redsquare-hammer-swipe");
const Post = require("./lib/post");
const Transaction = require("../../lib/saito/transaction").default;
const PeerService = require("saito-js/lib/peer_service").default;

/*
 * lib/main.js:    this.app.connection.on("redsquare-home-render-request", () => {      // renders main tweets
 * lib/main.js:    this.app.connection.on("redsquare-tweet-render-request", (tweet) => {   // renders tweet onto page, at bottom
 * lib/main.js:    this.app.connection.on("redsquare-profile-render-request", () => {     // renders profile
 * lib/main.js:    this.app.connection.on("redsquare-notifications-render-request", () => {   // renders notifications
 * lib/main.js:    this.app.connection.on("redsquare-component-render-request", (obj) => {    // renders other modules into .saito-main
 */

////////////////////////////////////////////
//
// RedSquare is now entirely dependent on Archive for TX storage
// This may create some lingering issues because having a dedicated DB
// allowed us to surface important information. For reference, the original
// schema is:
/*

  tweets (
    id      INTEGER,
    tx      TEXT,
    sig       VARCHAR(99),
    publickey     VARCHAR(99),
    thread_id     VARCHAR(99),
    parent_id     VARCHAR(99),
    `text`    TEXT,
    link      TEXT,
    link_properties TEXT,
    type      INTEGER,
    processed   INTEGER,
    flagged     INTEGER,
    moderated     INTEGER,
    has_images      INTEGER,
    tx_size   INTEGER,
    num_likes     INTEGER,
    num_retweets    INTEGER,
    num_replies     INTEGER,
    created_at    INTEGER,
    updated_at    INTEGER,
    UNIQUE    (id),
    UNIQUE    (sig),
    PRIMARY KEY     (id ASC)
  );
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

    this.debug = false;

    this.tweets = [];
    this.tweets_sigs_hmap = {};
    this.unknown_children = [];

    this.peers = [];

    this.tweet_count = 0;
    this.liked_tweets = [];
    this.retweeted_tweets = [];
    this.replied_tweets = [];

    this.notifications = [];
    this.notifications_sigs_hmap = {};

    //
    // set by main
    //
    this.manager = "";

    //
    // is this a notification?
    //
    this.notifications_earliest_ts = new Date().getTime();
    this.notifications_last_viewed_ts = 0;
    this.notifications_number_unviewed = 0;

    this.allowed_upload_types = ["image/png", "image/jpg", "image/jpeg"];

    this.scripts = ["/saito/lib/virtual-bg/virtual-bg.js", "/saito/lib/hammer/hammer.min.js"];

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
      sangre: "fa-solid fa-droplet",
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
            window.history.pushState(
              {},
              document.title,
              "/" + this_mod.slug + `/?user_id=${publicKey}`
            );
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

    this.publicKey = await app.wallet.getPublicKey();

    //
    // fetch content from options file
    //
    this.loadOptions();

    //
    // servers update their cache for browsers
    //
    if (app.BROWSER == 0) {
      this.updateTweetsCacheForBrowsers();
    } else {
      //Add myself as a peer...
      this.addPeer("localhost");

      //
      // New browser fetch from server cache
      //
      if (this.browser_active && this.tweet_count == 0) {
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
        this.tweet_count = 1;
        this.saveOptions();
      }
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
  // content is loaded from the local cache, and then the "loading new tweets" indicator
  // is enabled, and when onPeerServiceUp() triggers we run a postcache-render-request
  // to update the page if it is in a state where that is permitted.
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
      this.manager = this.main.manager;

      this.addComponent(this.header);
      this.addComponent(this.main);
      this.addComponent(this.menu);
      this.addComponent(this.sidebar);

      //      if (this.app.browser.isMobileBrowser()){
      //        this.hammer = new RedSquareHammerSwipe(this.app, this);
      //        this.addComponent(this.hammer);
      //      }

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

    this.loadLocalTweets();
  }

  /////////////////////
  // peer management //
  /////////////////////
  addPeer(peer) {
    //For "localhost"
    let publicKey = peer?.publicKey || this.publicKey;

    let peer_idx = -1;

    for (let i = 0; i < this.peers.length; i++) {
      if (this.peers[i].publicKey === publicKey) {
        peer_idx = i;
      }
    }
    if (peer_idx == -1) {
      this.peers.push({
        peer: peer,
        publicKey: publicKey,
        tweets_earliest_ts: new Date().getTime(),
        tweets_latest_ts: 0,
        tweets_limit: 20,
      });
    } else {
      this.peers[peer_idx].peer = peer;
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
    if (service.service === "archive") {
      //
      // or fetch tweets (load tweets "earlier")
      //
      this.addPeer(peer, "tweets");

      //
      // if viewing a specific tweet
      //
      let tweet_id = this.app.browser.returnURLParameter("tweet_id");
      if (tweet_id != "") {
        this.loadTweetWithSig(tweet_id, (txs) => {
          for (let z = 0; z < txs.length; z++) {
            this.addTweet(txs[z]);
          }
          let tweet = this.returnTweet(tweet_id);
          this.app.connection.emit("redsquare-tweet-render-request", tweet);
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
        switch (hash) {
          case "#notifications":
            this.app.connection.emit("redsquare-notifications-render-request");
            break;
          case "#profile":
            this.app.connection.emit("redsquare-profile-render-request");
            break;
          default: // #home
            break;
        }
      }

      this.loadTweets("later", (tx_count) => {
        this.app.connection.emit("redsquare-home-postcache-render-request", tx_count);
      });
    }
  }

  ///////////////////////
  // network functions //
  ///////////////////////
  async onConfirmation(blk, tx, conf) {
    try {
      let txmsg = tx.returnMessage();

      if (conf == 0) {
        if (this.debug) {
          console.log("%%");
          console.log("NEW TRANSACTION RECEIVED!");
          if (txmsg.data.images) {
            let new_obj = JSON.parse(JSON.stringify(txmsg));
            new_obj.data.images = "[image tweet]";
            console.log("txmsg: " + JSON.stringify(new_obj));
          } else {
            console.log("txmsg: " + JSON.stringify(txmsg));
          }
        }

        if (txmsg.request === "create tweet") {
          await this.receiveTweetTransaction(blk, tx, conf, this.app);
        }
        if (txmsg.request === "like tweet") {
          await this.receiveLikeTransaction(blk, tx, conf, this.app);
        }
        if (txmsg.request === "flag tweet") {
          await this.receiveFlagTransaction(blk, tx, conf, this.app);
        }
      }
    } catch (err) {
      console.log("ERROR in RedSquare onConfirmation: " + err);
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

  loadTweets(created_at = "earlier", mycallback) {

    console.log(`RS: load ${created_at} tweets with num peers: ${this.peers.length}`);

    for (let i = 0; i < this.peers.length; i++) {
      if (!(this.peers[i].tweets_earliest_ts == 0 && created_at == "earlier")) {
        let obj = {
          field1: "RedSquare",
          limit: this.peers[i].tweets_limit,
        };

        if (created_at == "earlier") {
          obj.created_earlier_than = this.peers[i].tweets_earliest_ts;
        } else if (created_at == "later") {
          //
          // For "new" tweets we maybe want to look at updated, not created
          // this should allow us to pull fresh stats for tweets that aren't
          // otherwise directed at us
          //
          obj.updated_later_than = this.peers[i].tweets_latest_ts;
        } else {
          console.error("Unsupported time restraint in rS");
        }

        this.app.storage.loadTransactions(
          obj,
          (txs) => {

            console.log(`${txs?.length} ${created_at} tweets loaded from ${this.peers[i].publicKey}`);

            //
            // Instead of just passing the txs to the callback, we count how many of these txs
            // are new to us so we can have a better UX
            //
            let count = 0;

            if (txs.length > 0) {
              for (let z = 0; z < txs.length; z++) {
                txs[z].decryptMessage(this.app);
                count += this.addTweet(txs[z]);

                //timestamp is the original timestamp of the create tweet transaction
                if (txs[z].timestamp < this.peers[i].tweets_earliest_ts) {
                  this.peers[i].tweets_earliest_ts = txs[z].timestamp;
                }

                if (txs[z].updated_at > this.peers[i].tweets_latest_ts) {
                  this.peers[i].tweets_latest_ts = txs[z].updated_at;
                }

                let tweet = this.returnTweet(txs[z].signature);
                if (tweet) {
                  //
                  // Update our local archive with any updated metadata
                  //
                  this.app.storage.updateTransaction(tweet.tx, null, "localhost");
                }
              }
            } else {
              this.peers[i].tweets_earliest_ts = 0;
            }

            if (mycallback) {
              //
              // we aren't caching old tweets, so don't incur the costs of deleting and saving!
              //
              if (count > 0 && this.peers[i].publicKey != this.publicKey && created_at == "later") {
                console.log("RS: " + this.peers[i].publicKey + " -- " + this.publicKey);
                console.log("SAVING LOCAL TWEETS AS NEW ONES FETCHED...!");
                this.saveLocalTweets();
              }

              mycallback(count);
            }
          },
          this.peers[i].peer
        );
      }
    }
  }

  loadNotifications(peer, mycallback = null) {
    if (this.notifications_earliest_ts !== 0) {
      this.app.storage.loadTransactions(
        {
          field1: "RedSquare",
          field3: this.publicKey,
          created_earlier_than: this.notifications_earliest_ts,
        },
        (txs) => {
          if (txs.length > 0) {
            for (let z = 0; z < txs.length; z++) {
              txs[z].decryptMessage(this.app);
              this.addTweet(txs[z]);

              if (txs[z].timestamp < this.notifications_earliest_ts) {
                this.notifications_earliest_ts = txs[z].timestamp;
              }
            }
          } else {
            this.notifications_earliest_ts = 0;
          }

          if (mycallback) {
            mycallback(txs);
          }
        },
        "localhost"
      );
    }
  }

  loadTweetThread(thread_id, mycallback = null) {
    if (!mycallback) {
      return;
    }

    for (let i = 0; i < this.peers.length; i++) {
      let obj = {
        field1: "RedSquare",
        field3: thread_id,
      };

      this.app.storage.loadTransactions(
        obj,
        (txs) => {
          if (txs.length > 0) {
            for (let z = 0; z < txs.length; z++) {
              txs[z].decryptMessage(this.app);
              this.addTweet(txs[z]);
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

  //
  // the following functions are all deprecated, but included because it is going to be a challenge
  // to upgrade them quickly. we prefer to use the Archive module to fetch and load transactions
  // rather than falling back to SQL commands....
  //
  // nonetheless, when we have more complex requests for thread display or tweet ordering, we fall
  // back to asking a peer that indexes them in a database.
  //

  loadTweetWithSig(sig, mycallback = null) {
    if (mycallback == null) {
      return;
    }

    let t = this.returnTweet(sig);
    if (t != null) {
      mycallback(t);
      return;
    }

    this.app.storage.loadTransactions(
      { sig, field1: "RedSquare" },
      (txs) => {
        if (txs.length > 0) {
          for (let z = 0; z < txs.length; z++) {
            txs[z].decryptMessage(this.app);
            this.addTweet(txs[z]);
          }
        } else {
          for (let i = 0; i < this.peers.length; i++) {
            this.app.storage.loadTransactions(
              { sig, field1: "RedSquare" },
              (txs) => {
                if (txs.length > 0) {
                  for (let z = 0; z < txs.length; z++) {
                    txs[z].decryptMessage(this.app);
                    this.addTweet(txs[z]);
                  }

                  mycallback(txs);
                }
              },
              this.peer[i].peer
            );
          }
        }

        mycallback(txs);
      },
      "localhost"
    );
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
  // returns 1 if this is a new tweet that can be displayed
  //
  addTweet(tx, prepend = false) {
    //
    // create the tweet
    //
    let tweet = new Tweet(this.app, this, tx, ".tweet-manager");
    tweet.updated_at = tx.timestamp;
    let is_notification = 0;

    //
    // avoid errors
    //
    if (!tweet?.tx) {
      return 0;
    }

    if (!tweet.tx.optional) {
      tweet.tx.optional = {};
    }

    //
    // maybe this needs to go into notifications too
    //
    // NOTE -- addNotification() duplicates while avoiding this.tweets insertion
    //
    if (tx.isTo(this.publicKey)) {
      console.log("RS: Processing Tweet/Like directed to me");

      //
      // notify of other people's actions, but not ours
      //
      if (!tx.isFrom(this.publicKey)) {
        console.log("Not from me");

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
          console.log("new notification");

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
    }

    //
    // if this is a like, we can avoid adding it to our tweet index
    //
    let txmsg = tx.returnMessage();
    if (txmsg.request === "like tweet") {
      return 0;
    }

    let inserted = 0;

    //
    // add tweet to tweet and tweets_sigs_hmap for easy-reference
    //
    //
    // this is a post
    //
    if (!tweet.tx.optional.parent_id) {
      tweet.tx.optional.parent_id = "";
    }
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
            let target = this.tweets[i].created_at;
            if (this.tweets[i].updated_at > target) {
              target = this.tweets[i].updated_at;
            }
            let ttarget = tweet.created_at;
            if (tweet.updated_at > ttarget) {
              ttarget = tweet.updated_at;
            }
            if (target > ttarget) {
              insertion_index++;
            } else {
              break;
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

        return 1;
      } else {
        //
        // Update the stats for this tweet we already have in memory
        //
        let t = this.returnTweet(tweet.tx.signature);
        if (tweet.tx.optional) {
          if (tweet.tx.optional.num_replies > t.tx.optional.num_replies) {
            t.tx.optional.num_replies = tweet.tx.optional.num_replies;
            t.rerenderControls();
          }
          if (tweet.tx.optional.num_retweets > t.tx.optional.num_retweets) {
            t.tx.optional.num_retweets = tweet.tx.optional.num_retweets;
            t.rerenderControls();
          }
          if (tweet.tx.optional.num_likes > t.tx.optional.num_likes) {
            t.tx.optional.num_likes = tweet.tx.optional.num_likes;
            t.rerenderControls();
          }
        }
      }
    } else {
      //
      // this is a comment / reply
      //

      for (let i = 0; i < this.tweets.length; i++) {
        if (this.tweets[i].tx.signature === tweet.tx.optional.thread_id) {
          console.log("#");
          console.log("#");
          console.log("# our comment is " + tweet.text);
          console.log("# we think this is comment on " + this.tweets[i].text);
          console.log(this.tweets[i].tx.signature + " -- " + tweet.tx.optional.thread_id);
          if (this.tweets[i].addTweet(tweet)) {
            this.tweets_sigs_hmap[tweet.tx.signature] = 1;
            return 1;
          }
        }
      }

      console.log("^");
      console.log("^");
      console.log("^");
      console.log("^ pushed onto unknown children: ");
      this.unknown_children.push(tweet);
      this.tweets_sigs_hmap[tweet.tx.signature] = 1;
    }

    return 0;
  }
  //
  // addTweets adds to notifications, but we have a separate function here
  // for cached notifications, because we don't want to show all of the
  // cached notifications in the main thread automatically, which is what
  // will happen if we use addTweet() on loading.
  //
  async addNotification(tx, prepend = false) {
    let tweet = new Tweet(this.app, this, tx, ".tweet-manager");
    let is_notification = 1;

    console.log("#");
    console.log("# note: " + tweet.text);
    console.log("#");

    if (!tweet.tx) {
      return;
    }

    //
    // avoid errors
    //
    if (!tweet) {
      return;
    }
    if (!tweet.tx) {
      return;
    }
    if (!tweet.tx.optional) {
      tweet.tx.optional = {};
    }

    if (tx.isTo(this.publicKey)) {
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

          if (!this.notifications_last_viewed_ts && !(this.notifications_last_viewed_ts < 1)) {
            this.loadOptions();
          }

          if (tx.timestamp > this.notifications_last_viewed_ts) {
            this.notifications_number_unviewed = this.notifications_number_unviewed + 1;
            this.menu.incrementNotifications("notifications", this.notifications_number_unviewed);
          }
        }
      }
    }

    return;
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
    if (!tweet) {
      return [root_id];
    }
    let parent_id = tweet.parent_id;

    sigs.push(child_id);
    while (parent_id != "" && parent_id != root_id) {
      let x = this.returnTweet(parent_id);
      if (!x) {
        parent_id = root_id;
      } else {
        if (x.parent_id != "") {
          sigs.push(parent_id);
          parent_id = x.parent_id;
        } else {
          parent_id = root_id;
        }
      }
    }
    if (child_id != root_id) {
      sigs.push(root_id);
    }
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
    //
    // All tweets include the sender in the to
    //
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
    console.log("RS: receive like transaction!");

    let txmsg = tx.returnMessage();

    let liked_tweet = this.returnTweet(txmsg.data.signature);

    //
    // save optional likes
    //

    if (liked_tweet?.tx) {
      console.log("I have liked tweet locally");

      if (!liked_tweet.tx.optional) {
        liked_tweet.tx.optional = {};
      }

      if (!liked_tweet.tx.optional.num_likes) {
        liked_tweet.tx.optional.num_likes = 0;
      }
      liked_tweet.tx.optional.num_likes++;

      await this.app.storage.updateTransaction(liked_tweet.tx, {}, "localhost");

      liked_tweet.renderLikes();
    } else {
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
      await this.app.storage.loadTransactions(
        { sig: txmsg.data.signature, field1: "RedSquare" },
        async (txs) => {
          if (txs?.length > 0) {
            let tx = txs[0];

            if (!tx.optional) {
              tx.optional = {};
            }
            if (!tx.optional.num_likes) {
              tx.optional.num_likes = 0;
            }
            tx.optional.num_likes++;

            console.log("Archive found liked tweet:", tx.msg.data.text, tx.optional.num_likes);
            await this.app.storage.updateTransaction(tx, {}, "localhost");
          }
        },
        "localhost"
      );
    }

    //
    // browsers
    //
    if (app.BROWSER == 1) {
      //
      // save my likes
      //
      if (tx.isTo(this.publicKey)) {
        //
        // Save locally -- indexed to myKey so it is accessible as a notification
        //
        // I'm not sure we really want to save these...
        ///
        await this.app.storage.saveTransaction(
          tx,
          { field1: "RedSquare", field3: this.publicKey },
          "localhost"
        );

        //
        // convert like into tweet and addTweet to get notifications working
        //
        this.addTweet(tx, true);
      }
    }

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
    console.log("RS: receive tweet transaction!");

    try {
      let tweet = new Tweet(app, this, tx, ".tweet-manager");
      let other_tweet = null;
      let txmsg = tx.returnMessage();

      //
      // browsers keep a list in memory of processed tweets
      //
      if (app.BROWSER == 1) {
        //
        // profile caching of tweets FROM me
        //
        /*if (tx.isFrom(this.publicKey)) {
          if (this.manager) {
            if (tweet.isPost()) {
              if (!this.manager.profilePostsAlreadyHasTweet(tweet)) {
                this.profile_posts.push(tweet);
                this.saveLocalProfile();
              }
            }
            if (tweet.isReply()) {
              if (!this.manager.profileRepliesAlreadyHasTweet(tweet)) {
                this.profile_replies.push(tweet);
                this.saveLocalProfile();
              }
            }
          }
        }
        */
        this.addTweet(tx, 1);
      }

      //
      // save this transaction in our archives as a redsquare transaction that is owned by ME (the server), so that I
      // can deliver it to users who want to fetch RedSquare transactions from the archives instead of just through the
      // sql database -- this is done by specifying that I -- "localhost" am the peer required.
      //

      //
      // this transaction is TO me, but I may not be the tx.to[0].publicKey address, and thus the archive
      // module may not index this transaction for me in a way that makes it very easy to fetch (field3 = MY_KEY}
      // thus we override the defaults by setting field3 explicitly to our publickey so that loading transactions
      // from archives by fetching on field3 will get this.
      //
      let opt = {
        field1: "RedSquare", //defaults to module.name, but just to make sure we match the capitalization with our loadTweets
      };

      if (tx.isTo(this.publicKey)) {
        //
        // When a browser stores tweets, it is storing tweets it sent or were sent to it
        // this will help use with notifications (to) and profile (from)
        //
        opt["field3"] = this.publicKey;
      } else {
        //
        // When the service node stores tweets, it is for general look up. We will usually
        // search for all tweets or tweets within a thread, thus we want the thread_id indexed
        //
        opt["field3"] = tweet?.thread_id;
      }

      //
      // servers -- get open graph properties
      //

      tweet = await tweet.generateTweetProperties(app, this, 1);

      //
      // Save the modified tx so we have open graph properties available
      //
      await this.app.storage.saveTransaction(tweet.tx, opt, "localhost");

      //
      // Includes retweeted tweet
      //
      if (tweet.retweet_tx != null) {
        other_tweet = this.returnTweet(tweet.thread_id);

        if (other_tweet) {
          if (!other_tweet.tx.optional) {
            other_tweet.tx.optional = {};
          }
          if (!other_tweet.tx.optional.num_retweets) {
            other_tweet.tx.optional.num_retweets = 0;
          }
          other_tweet.tx.optional.num_retweets++;
          await this.app.storage.updateTransaction(other_tweet.tx, {}, "localhost");
          other_tweet.renderRetweets();
        } else {
          //
          // fetch archived copy
          //
          // servers load from themselves
          //
          await this.app.storage.loadTransactions(
            { sig: tweet.thread_id, field1: "RedSquare" },
            async (txs) => {
              if (txs?.length) {
                //Only update the first copy??
                let tx = txs[0];

                if (!tx.optional) {
                  tx.optional = {};
                }
                if (!tx.optional.num_retweets) {
                  tx.optional.num_retweets = 0;
                }
                tx.optional.num_retweets++;
                await this.app.storage.updateTransaction(tx, {}, "localhost");
              }
            },
            "localhost"
          );
        }
      }

      //
      // Is a reply
      //
      if (tweet.parent_id && tweet.parent_id !== tweet.tx.signature) {
        //
        // if we have the parent tweet in memory...
        //
        other_tweet = this.returnTweet(tweet.parent_id);

        if (other_tweet) {
          if (!other_tweet.tx.optional) {
            other_tweet.tx.optional = {};
          }
          if (!other_tweet.tx.optional.num_replies) {
            other_tweet.tx.optional.num_replies = 0;
          }
          other_tweet.tx.optional.num_replies++;
          other_tweet.rerenderControls();
          other_tweet.renderReplies();

          await this.app.storage.updateTransaction(other_tweet.tx, {}, "localhost");
        } else {
          //
          // ...otherwise, hit up the archive first
          //
          await this.app.storage.loadTransactions(
            { sig: tweet.parent_id, field1: "RedSquare" },
            async (txs) => {
              if (txs?.length) {
                let tx = txs[0];
                if (!tx.optional) {
                  tx.optional = {};
                }
                if (!tx.optional.num_replies) {
                  tx.optional.num_replies = 0;
                }
                tx.optional.num_replies++;
                await this.app.storage.updateTransaction(tx, {}, "localhost");
              }
            },
            "localhost"
          );
        }
      }

      //
      // update cache
      //
      this.updateTweetsCacheForBrowsers();
    } catch (err) {
      console.log("ERROR in receiveTweetsTransaction() in RedSquare: " + err);
    }
  }

  //
  // How does this work with the archive module???
  //
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

    return;
  }

  /////////////////////////////////////
  // saving and loading wallet state //
  /////////////////////////////////////
  saveTweet(sig) {

    // When we interact with a tweet, we want to mark it as important to us and add it to our
    // local tweet cache .... maybe????

    let tweet = this.returnTweet(sig);

    if (!tweet) {
      return;
    }

    this.app.storage.loadTransactions(
      { field1: "RedSquare", sig },
      (txs) => {
        if (txs?.length > 0) {
          return;
        }
        this.app.storage.saveTransaction(tweet.tx, { field1: "RedSquare" }, "localhost");
      },
      "localhost"
    );
  }

  saveLocalTweets() {
    //
    // randomly delete any REDSQUARECOMMUNITY-tagged RedSquare tweets
    //
    this.app.storage.deleteTransactions(
      { field3: "REDSQUARECOMMUNITY" },
      () => {
        //
        // save the last 4-5 tweets
        //
        for (let i = 0; i < this.tweets.length && i < 8; i++) {
          //
          // no await
          //
          this.app.storage.saveTransaction(
            this.tweets[i].tx,
            { field3: "REDSQUARECOMMUNITY" },
            "localhost"
          );
        }
      },
      "localhost"
    );
  }

  saveLocalProfile() {
    /*let ptxs = [];
    let rtxs = [];
    for (let i = 0; i < this.manager.profile_posts.length && i < 20; i++) {
      ptxs.push(this.manager.profile_posts[i].tx.serialize_to_web(this.app));
    }
    for (let i = 0; i < this.manager.profile_replies.length && i < 20; i++) {
      rtxs.push(this.manager.profile_replies[i].tx.serialize_to_web(this.app));
    }
    localforage.setItem(`profile_posts_history`, ptxs).then(function () {
      console.log(`Saved ${ptxs.length} tweets`);
    });
    localforage.setItem(`profile_replies_history`, rtxs).then(function () {
      console.log(`Saved ${rtxs.length} tweets`);
    });
    */
  }

  saveLocalNotifications() {
    /*let ntxs = [];
    let total_cached = 0;
    for (let i = 0; i < this.notifications.length && total_cached < 10; i++) {
      //
      // avoid caching likes, because we'll fetch them separately
      //
      let txmsg = this.notifications[i].tx.returnMessage();
      if (txmsg.request != "like tweet") {
        ntxs.push(this.notifications[i].tx.serialize_to_web(this.app));
        total_cached++;
      }
    }
    localforage.setItem(`notifications_history`, ntxs).then(function () {
      console.log(`Saved ${ntxs.length} notifications`);
    });
    */
  }

  loadLocalTweets() {
    if (!this.app.BROWSER) {
      return;
    }

    console.log("Load Local Tweets");

    try {
      let obj = {
        field3: "REDSQUARECOMMUNITY",
        limit: 15,
        created_earlier_than: new Date().getTime(),
      };

      this.app.storage.loadTransactions(
        obj,
        (txs) => {
          if (txs.length > 0) {
            for (let z = 0; z < txs.length; z++) {
              txs[z].decryptMessage(this.app);
              console.log(JSON.stringify(txs[z].returnMessage()));
              this.addTweet(txs[z]);
            }
          }
          for (let i = 0; i < this.tweets.length; i++) {
            console.log(this.tweets[i].text);
          }
          console.log("%");
          console.log("%");
          console.log("%");
          console.log("% local load fetched: " + txs.length + " txs");
        },
        "localhost"
      );
    } catch (err) {
      console.log("!!!!!");
      console.log("!!!!!");
      console.log("!!!!! ERROR WITH LOCAL CONTENT FETCH: " + err);
      console.log("!!!!!");
      console.log("!!!!!");
    }

    this.app.storage.loadTransactions(
      { field1: "RedSquare" },
      (txs) => {
        if (txs.length > 0) {
          for (let z = 0; z < txs.length; z++) {
            txs[z].decryptMessage(this.app);
            this.addTweet(txs[z]);
          }
        }

        if (this.app.browser.returnURLParameter("tweet_id")) {
          return;
        }
        if (this.app.browser.returnURLParameter("user_id")) {
          return;
        }

        //Run these regardless of results
        this.app.connection.emit("redsquare-home-render-request");
        this.app.connection.emit("redsquare-insert-loading-message");
      },
      "localhost"
    );

    /*if (this.app.browser.returnURLParameter("tweet_id")) {
      return;
    }

    localforage.getItem(`notifications_history`, (error, value) => {
      if (value && value.length > 0) {
        for (let tx of value) {
          try {
            let newtx = new Transaction();
            newtx.deserialize_from_web(this.app, tx);
            this.addNotification(newtx);
          } catch (err) {}
        }
      }
    });
    localforage.getItem(`profile_posts_history`, (error, value) => {
      if (value && value.length > 0) {
        for (let tx of value) {
          try {
            let newtx = new Transaction();
            newtx.deserialize_from_web(this.app, tx);
      let t = new Tweet(this.app, this, newtx, ".tweet-manager");
console.log("profile cache load: " + t.text);
            this.manager.profile_posts.push(t); // the tweet
          } catch (err) {}
        }
      }
    });
    localforage.getItem(`profile_replies_history`, (error, value) => {
      if (value && value.length > 0) {
        for (let tx of value) {
          try {
            let newtx = new Transaction();
            newtx.deserialize_from_web(this.app, tx);
      let t = new Tweet(this.app, this, newtx, ".tweet-manager");
console.log("profile cache load: " + t.text);
            this.manager.profile_replies.push(t); // the tweet
          } catch (err) {}
        }
      }
    });
    localforage.getItem(`tweet_history`, (error, value) => {
      if (value && value.length > 0) {
        for (let tx of value) {
          try {
            let newtx = new Transaction();
            newtx.deserialize_from_web(this.app, tx);
            this.addTweet(newtx);
          } catch (err) {}
        }
      }
      //Run these regardless of results
      this.app.connection.emit("redsquare-home-render-request");
      this.app.connection.emit("redsquare-insert-loading-message");
    });*/
  }

  /////////////////////////////////////
  // saving and loading wallet state //
  /////////////////////////////////////
  loadOptions() {
    if (!this.app.BROWSER) {
      return;
    }

    if (this.app.options.redsquare) {
      this.notifications_last_viewed_ts =
        this.app.options.redsquare?.notifications_last_viewed_ts || 0;
      this.notifications_number_unviewed =
        this.app.options.redsquare?.notifications_number_unviewed || 0;
      this.tweet_count = this.app.options.redsquare?.tweet_count || 0;

      if (this.app.options.redsquare.liked_tweets) {
        this.liked_tweets = this.app.options.redsquare.liked_tweets;
      }
      if (this.app.options.redsquare.retweeted_tweets) {
        this.retweeted_tweets = this.app.options.redsquare.retweeted_tweets;
      }
      if (this.app.options.redsquare.replied_tweets) {
        this.replied_tweets = this.app.options.redsquare.replied_tweets;
      }
    } else {
      this.saveOptions();
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
    this.app.options.redsquare.tweet_count = this.tweet_count;

    if (this.debug) {
      console.log("Liked: " + this.liked_tweets.length);
      console.log("Quote: " + this.retweeted_tweets.length);
      console.log("Reply: " + this.replied_tweets.length);
    }

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
      this.saveTweet(sig);
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
      this.saveTweet(sig);
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
      this.saveTweet(sig);
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

  //
  // writes the latest 10 tweets to tweets.js
  //
  async updateTweetsCacheForBrowsers() {
    if (this.app.BROWSER) {
      return;
    }

    let hex_entries = [];

    this.app.storage.loadTransactions(
      { field1: "RedSquare" },
      (txs) => {
        if (txs.length > 0) {
          try {
            let path = this.app.storage.returnPath();
            if (!path) {
              return;
            }

            const filename = path.join(__dirname, "web/tweets.");
            let fs = this.app.storage.returnFileSystem();
            let html = `if (!tweets) { var tweets = [] };`;
            if (fs != null) {
              for (let i = 0; i < txs.length; i++) {
                let thisfile = filename + i + ".js";
                const fd = fs.openSync(thisfile, "w");
                html += `  tweets.push(\`${txs[i].serialize_to_web(this.app)}\`);   `;
                fs.writeSync(fd, html);
                fs.fsyncSync(fd);
                fs.closeSync(fd);
                html = "";
              }
            }
          } catch (err) {
            console.error("ERROR 2832329: error tweet cache to disk. ", err);
          }
        }
      },
      "localhost"
    );
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

          let sig = query_params?.tweet_id || query_params?.thread_id;

          if (sig) {
            redsquare_self.loadTweetWithSig(sig, (txs) => {
              for (let z = 0; z < txs.length; z++) {
                let tx = txs[z];

                let txmsg = tx.returnMessage();
                let text = txmsg.data.text;
                let publicKey = tx.from[0].publicKey;
                let user = app.keychain.returnIdentifierByPublicKey(publicKey, true);

                redsquare_self.social.twitter_description = text;
                redsquare_self.social.og_description = text;
                redsquare_self.social.og_url = reqBaseURL + encodeURI(redsquare_self.returnSlug());

                let image = (redsquare_self.social.og_url =
                  reqBaseURL + encodeURI(redsquare_self.returnSlug()) + "?og_img_sig=" + sig);
                redsquare_self.social.og_title = user + " posted on Saito 🟥";
                redsquare_self.social.twitter_title = user + " posted on Saito 🟥";
                redsquare_self.social.og_image = image;
                redsquare_self.social.og_image_url = image;
                redsquare_self.social.og_image_secure_url = image;
                redsquare_self.social.twitter_image = image;
              }

              res.setHeader("Content-type", "text/html");
              res.charset = "UTF-8";
              res.send(redsquareHome(app, redsquare_self));
            });

            return;
          }

          if (typeof query_params.og_img_sig != "undefined") {
            console.info(query_params.og_img_sig);

            let sig = query_params.og_img_sig;

            redsquare_self.loadTweetWithSig(sig, (txs) => {
              for (let i = 0; i < txs.length; i++) {
                let tx = txs[i];
                let txmsg = tx.returnMessage();

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
            });

            return;
          }
        }
      } catch (err) {
        console.log("Loading OG data failed with error: " + err);
      }

      // fallback for default
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
