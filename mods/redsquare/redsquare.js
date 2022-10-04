const saito = require("./../../lib/saito/saito");
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
const GameCreator = require("./lib/appspace/arcade/game-creator");
const SaitoLoader = require("../../lib/saito/new-ui/saito-loader/saito-loader");
const PostTweet = require("./lib/post");
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

    this.viewing = "main";
    // "main" or sig if viewing page-specific
    this.viewing = "main";
    this.last_viewed_notifications_ts = 0;
    this.unviewed_notifications = 0;

    this.results_per_page = 10;
    this.page_number = 1;

    this.styles = [
      '/saito/saito.css',
      '/redsquare/css/redsquare-main.css',
      '/redsquare/css/arcade.css',		      // game creation overlays
      '/redsquare/css/chat.css',		        // game creation overlays
      //'/saito/show.css',                    // show body (antifauc)
    ];
    this.ui_initialized = false;

    this.allowed_upload_types = ['image/png', 'image/jpg', 'image/jpeg'];
    this.icon_fa = "fas fa-square-full";

    return this;

  }


  initialize(app) {

    this.loadRedSquare();
    super.initialize(app);

    if (app.BROWSER === 1) {
      if (this.browser_active == 1) {
        //Leave a cookie trail to return to Redsquare when you enter a game
        if (app.options.homeModule !== this.returnSlug()) {
          console.log("Update homepage to " + this.returnSlug());
          app.options.homeModule = this.returnSlug();
          app.storage.saveOptions();
        }

        //Query tweets every 30 seconds
        setInterval(() => {
          this.fetchNewTweets(app, this)
        }, 45000)
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
    // skip notifying us of our own posts / comments
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

  addTweet(app, mod, tweet, prepend = 0) {

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
        //recommended change - add before first tweet it's newer than.
        for (let i = 0; i < this.tweets.length; i++) {
          if ((this.tweets[i].updated_at < tweet.updated_at))
            /*          
            if (this.tweets[i].updated_at > tweet.updated_at) {
              insertion_index++;
              break;
            } else {
              insertion_index++;
            }
            */
            this.tweets.splice(i, 0, tweet);
          break;
        }
        //this.tweets.splice(insertion_index, 0, tweet);
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

  prependTweetFromTransaction(app, mod, tx, tracktweet = false) {
    let tweet = new Tweet(app, this, tx);
    if (tracktweet) {
      this.trackTweet(app, mod, tweet)
    }
    this.addTweet(app, this, tweet, 1);
    this.txmap[tx.transaction.sig] = 1;

    if (this.viewing === "main") {
      this.renderMainPage(app, mod);
    } else {
      app.connection.emit('tweet-render-request', tweet);
    }
  }
  addTweetFromTransaction(app, mod, tx, tracktweet = false) {
    let tweet = new Tweet(app, this, tx);



    this.addTweet(app, this, tweet);
    this.txmap[tx.transaction.sig] = 1;
  }


  reorganizeTweets(app, mod) {
    // sort chronologically
    for (let i = this.tweets.length - 1; i >= 1; i--) {
      if (this.tweets[i - 1].updated_at < this.tweets[i].updated_at) {
        let x = this.tweets[i - 1];
        let y = this.tweets[i];
        this.tweets[i] = x;
        this.tweets[i - 1] = y;
      }
    }
    // and pull image to top
    for (let i = 0; i < this.tweets.length; i++) {
      if (this.tweets[i].has_image == true) {
        if (i > 0) {
          let x = this.tweets[i];
          let y = this.tweets[0];
          this.tweets[i] = y;
          this.tweets[0] = x;
        }
        return;
      }
    }
    return;
  }

  initializeHTML(app) {
    this.saito_loader.render(app, this, '', true);
  }

  render(app, mod, selector = "") {

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


  renderMainPage(app, mod) {
    this.viewing = "main";
    this.reorganizeTweets(app, mod);
    document.querySelector(".redsquare-list").innerHTML = "";
    for (let i = 0; i < this.tweets.length; i++) {
      this.tweets[i].render(app, mod, ".redsquare-list");
    }
    app.browser.addIdentifiersToDom();
  }

  //
  // render with children, but loads if not parent (used for retweets)
  //
  renderParentWithChildren(app, mod, sig) {
    this.viewing = sig;
    this.reorganizeTweets(app, mod);
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
    mod.etchTweets(app, mod, sql, function (app, mod) {
      mod.renderParentWithChildren(app, mod, sig);

    });

  }



  //
  // renders tweet with parents
  //
  renderWithParents(app, mod, sig, num = -1) {
    this.viewing = sig;
    document.querySelector(".redsquare-list").innerHTML = "";
    let tweet_shown = 0;
    let t = this.returnTweet(app, mod, sig);
    if (t != null) {
      t.renderWithParents(app, mod, ".redsquare-list", num);
    } else {
      t.renderWithParents(app, mod, ".redsquare-list", 0);
    }
    document.querySelector('.saito-container').scroll({top:0, left:0, behavior: 'smooth'});
  }



  //
  // renders children
  //
  renderWithChildren(app, mod, sig) {
    this.viewing = sig;
    this.reorganizeTweets(app, mod);
    document.querySelector('.saito-container').scroll({top:0, left:0, behavior: 'smooth'});
    document.querySelector(".redsquare-list").innerHTML = "";
    let tweet_shown = 0;
    for (let i = 0; i < this.tweets.length; i++) {
      if (this.tweets[i].tx.transaction.sig === sig) {
        tweet_shown = 1;
        this.tweets[i].renderWithChildren(app, mod, ".redsquare-list");
        return;
      }
    }
    if (tweet_shown == 0) {
      for (let i = 0; i < this.tweets.length; i++) {
        if (this.tweets[i].returnTweet(app, mod, sig) != null) {
          let t = this.tweets[i].returnTweet(app, mod, sig);
          tweet_shown = 1;
          t.renderWithChildren(app, mod, ".redsquare-list");
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

    let redsquare_self = this;
    if (this.app.BROWSER == 1) {
      this.saito_loader.render(app, redsquare_self, 'redsquare-home-header', false);

      let tweet_id = app.browser.returnURLParameter('tweet_id');

      if (document.querySelector(".redsquare-list")) {
        if (tweet_id != "") {
          let sql = `SELECT * FROM tweets WHERE sig = '${tweet_id}' OR parent_id = '${tweet_id}'`;
          this.fetchTweets(app, redsquare_self, sql, function (app, mod) { mod.renderWithChildren(app, redsquare_self, tweet_id); });
        } else {
          let sql = `SELECT * FROM tweets WHERE (flagged IS NOT 1 OR moderated IS NOT 1) AND parent_id == thread_id AND tx_size < 1000000 ORDER BY updated_at DESC LIMIT 0,'${this.results_per_page}'`;
          this.fetchTweets(app, redsquare_self, sql, function (app, mod) {
            console.log("~~~~~~~~~~~~~~~~~~");
            console.log("~~~~~~~~~~~~~~~~~~");
            console.log("~~~~~~~~~~~~~~~~~~");
            console.log("1 TWEETS FETCH FROM PEER: " + redsquare_self.tweets.length);
            mod.renderMainPage(app, redsquare_self);
          }, true);
        }

      }

      this.app.storage.loadTransactions("RedSquare", 50, (txs) => {
        console.log("~~~~~~~~~~~~~~~~~~");
        console.log("~~~~~~~~~~~~~~~~~~");
        console.log("~~~~~~~~~~~~~~~~~~");
        console.log("HOW MANY DID WE LOAD? " + txs.length);
        for (let i = 0; i < txs.length; i++) {
          txs[i].decryptMessage(app);
          let txmsg = txs[i].returnMessage();
          if (txmsg.request == "create tweet") {
            let tweet = new Tweet(redsquare_self.app, redsquare_self, txs[i]);
            redsquare_self.addTweet(redsquare_self.app, redsquare_self, tweet);
            redsquare_self.txmap[tweet.tx.transaction.sig] = 1;
          }
          redsquare_self.addNotification(redsquare_self.app, redsquare_self, txs[i]);
        }
        if (tweet_id != "") {
          console.log("HOW MANY DID WE LOAD 2? " + txs.length);
          redsquare_self.renderMainPage(redsquare_self.app, redsquare_self);
        }
      });


    }
  }


  async onConfirmation(blk, tx, conf, app) {

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
  fetchTweets(app, mod, sql, post_fetch_tweets_callback = null, to_track_tweet=false) {
    app.modules.returnModule("RedSquare").sendPeerDatabaseRequestWithFilter(
      "RedSquare",
      sql,
      async (res) => {
        if (res.rows) {
          if(to_track_tweet){
            mod.trackedTweet = res.rows[0];
          }
    
          // console.log('current tracked tweet', mod.trackedTweet);
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
              } catch (err) { }
              let txmsg = tx.returnMessage();
              this.addTweetFromTransaction(app, mod, tx);
            }
          });

          if (post_fetch_tweets_callback != null) {
            post_fetch_tweets_callback(app, mod);
          }

        }
        mod.saito_loader.remove(app, mod);
      }
    );
  }

  fetchMoreTweets(app, mod, post_fetch_tweets_callback) {

    const startingLimit = (this.page_number - 1) * this.results_per_page
    let sql = `SELECT * FROM tweets WHERE (flagged IS NOT 1 OR moderated IS NOT 1) AND parent_id == thread_id AND tx_size < 1000000 ORDER BY updated_at DESC LIMIT '${startingLimit}','${this.results_per_page}'`;

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
    console.log("Fetching New Tweets");
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
            // console.log(res.rows, "continue");
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




  sendLikeTransaction(app, mod, data) {

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
      }

      //
      // add notification for unviewed
      //
      console.log("ADD THIS: " + tx.transaction.ts + " > " + this.last_viewed_notifications_ts);
      if (tx.transaction.ts > this.last_viewed_notifications_ts) {
        this.addNotification(app, this, tx);
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
      }

      //
      // add notification for unviewed
      //
      console.log("ADD THIS: " + tx.transaction.ts + " > " + this.last_viewed_notifications_ts);
      if (tx.transaction.ts > this.last_viewed_notifications_ts) {
        this.addNotification(app, this, tx);
      }

      this.addTweet(app, this, tweet);
      app.connection.emit("tweet-render-request", tweet);
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

}

module.exports = RedSquare;

