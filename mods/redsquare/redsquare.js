const saito = require("./../../lib/saito/saito");
const InviteTemplate = require('../../lib/templates/invitetemplate');
const ModTemplate = require('../../lib/templates/modtemplate');
const SaitoHeader = require('../../lib/saito/new-ui/saito-header/saito-header');
const RedSquareMain = require('./lib/main');
const Tweet = require('./lib/tweet');
const JSON = require("json-bigint");
const fetch = require('node-fetch');
const HTMLParser = require('node-html-parser');
const prettify = require('html-prettify');
const GameCreator = require("./lib/appspace/arcade/game-creator");
const SaitoLoader = require("../../lib/saito/new-ui/saito-loader/saito-loader");


class RedSquare extends ModTemplate {

  constructor(app) {

    super(app);

    this.appname = "Red Square";
    this.name = "RedSquare";
    this.slug = "redsquare";
    this.description = "Open Source Twitter-clone for the Saito Network";
    this.categories = "Social Entertainment";
    this.saitoLoader = new SaitoLoader(app, this)
    this.redsquare = {}; // where settings go, saved to options file

    this.sqlcache_enabled = 1;

    this.tweets = [];

    this.styles = [
      '/saito/saito.css',
      '/redsquare/css/redsquare-main.css',
      '/redsquare/css/arcade.css',		// game creation overlays
      '/redsquare/css/chat.css',		// game creation overlays
    ];
    this.ui_initialized = false;
  }


  initialize(app) {

    this.loadRedSquare();
    super.initialize(app);

  }


  addTweetFromTransaction(app, mod, tx) {
    let tweet = new Tweet(app, this, tx);
    this.addTweet(app, this, tweet);
  }

  addTweet(app, mod, tweet) {

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
        this.tweets.splice(insertion_index, 0, tweet);
      }
      //
      // comment-level
      //
    } else {
      for (let i = 0; i < this.tweets.length; i++) {
        if (this.tweets[i].tx.transaction.sig === tweet.thread_id) {
          if (this.tweets[i].addTweet(app, mod, tweet) == 1) {
            // do not render comment-level tweets at parent level
            //app.connection.emit("tweet-render-request", tweet);
          }
        }
      }
    }
  }


  reorganizeTweets(app, mod) {
    for (let i = this.tweets.length - 1; i >= 1; i--) {
      if (this.tweets[i - 1].updated_at < this.tweets[i].updated_at) {
        let x = this.tweets[i - 1];
        let y = this.tweets[i];
        this.tweets[i] = x;
        this.tweets[i - 1] = y;
      }
    }
  }

  renderMainPage(app, mod) {

    this.reorganizeTweets(app, mod);
    document.querySelector(".redsquare-list").innerHTML = "";
    for (let i = 0; i < this.tweets.length; i++) {
      this.tweets[i].render(app, mod, ".redsquare-list");
    }

    app.browser.addIdentifiersToDom();
  }

  renderWithChildren(app, mod, sig) {
    this.reorganizeTweets(app, mod);
    document.querySelector(".redsquare-list").innerHTML = "";
    let tweet_shown = 0;
    for (let i = 0; i < this.tweets.length; i++) {
      if (this.tweets[i].tx.transaction.sig === sig) {
        tweet_shown = 1;
        this.tweets[i].renderWithChildren(app, mod, ".redsquare-list");
      }
    }
    if (tweet_shown == 0) {
      for (let i = 0; i < this.tweets.length; i++) {
        if (this.tweets[i].returnTweet(app, mod, sig) != null) {
          let t = this.tweets[i].returnTweet(app, mod, sig);
          tweet_shown = 1;
          t.renderWithChildren(app, mod, ".redsquare-list");
        }
      }
    }
  }




  respondTo(type) {
    //if (type === "invite") {
    //  return new GameCreator(this.app, this);
    //}
    return null;
  }




  render(app, mod, selector = "") {
    this.saitoLoader.render(app, mod);
    if (this.ui_initialized == false) {
      this.main = new RedSquareMain(this.app, this);
      this.header = new SaitoHeader(this.app, this);
      this.addComponent(this.main);
      this.addComponent(this.header);
      this.ui_initialized = true;

    }

    super.render(app, this);

    this.saitoLoader.remove(app, mod);

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


  /*********************
    installModule(app) {
    
      if (this.app.BROWSER == 1) { return }
  
      super.installModule(app);
  
      let dummy_content = [
        {
          text: 'Etiam luctus, massa ut mattis maximus, magna dolor consequat massa, sit amet finibus velit nisi vitae sem.',
          img: 'https://cdn.titans.ventures/uploads/photo_2021_04_12_20_54_32_fe75007318.jpg',
        },
        {
          text: 'Checkout this awesome video about web3 and open source. https://www.youtube.com/watch?v=0tZFQs7qBfQ',
        },
        {
          text: 'Nice tutorial. https://webdesign.tutsplus.com/articles/best-minimal-shopify-themes--cms-35081',
        }
      ];
  
      for (let i = 0; i < dummy_content.length; i++) {
        this.sendTweetTransaction(app, this, dummy_content[i]);
      }
  
    }
  *********************/




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

    let redsquare_self = this;

    if (this.app.BROWSER == 1) {
      if (document.querySelector(".redsquare-list")) {

       let tweet_id = app.browser.returnURLParameter('tweet_id');
    
       if (!tweet_id) {
          let sql = 'SELECT * FROM tweets WHERE (flagged IS NOT 1 OR moderated IS NOT 1) AND tx_size < 1000000 ORDER BY updated_at DESC LIMIT 30';
          this.fetchTweets(app, redsquare_self, sql, function(app, mod) { mod.renderMainPage(app, redsquare_self); });
        } else {
          let sql = `SELECT * FROM tweets WHERE sig = '${tweet_id}' OR parent_id = '${tweet_id}'`;
          this.fetchTweets(app, redsquare_self, sql, function(app, mod) { mod.renderWithChildren(app, redsquare_self, tweet_id); });
        }

      }
    }
  }


  async onConfirmation(blk, tx, conf, app) {

    let redsquare_self = this;
    let txmsg = tx.returnMessage();

    try {
      if (conf == 0) {
        if (txmsg.request === "create tweet") {
          this.sqlcache = [];
          redsquare_self.receiveTweetTransaction(blk, tx, conf, app);
        }
        if (txmsg.request === "like tweet") {
          this.sqlcache = [];
          redsquare_self.receiveLikeTransaction(blk, tx, conf, app);
        }
      }
    } catch (err) {
      console.log("ERROR in " + this.name + " onConfirmation: " + err);
    }
  }

  fetchTweets(app, redsquare_self, sql, post_fetch_tweets_callback=null) {

    app.modules.returnModule("RedSquare").sendPeerDatabaseRequestWithFilter(

      "RedSquare",

      sql,

      async (res) => {

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
              } catch (err) { }
                redsquare_self.addTweetFromTransaction(app, redsquare_self, tx);
              }
          });

	  if (post_fetch_tweets_callback != null) {
	    post_fetch_tweets_callback(app, redsquare_self);
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
      if (tx.transaction.from[0] === app.wallet.returnPublicKey()) {
        this.redsquare.lik


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


  sendTweetTransaction(app, mod, data) {

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
      let redsquare_self = app.modules.returnModule("RedSquare");
      this.addTweet(app, redsquare_self, tweet);
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
    let sql = `UPDATE tweets SET flagged = 1 WHERE sig = $sig AND moderated IS NOT 1`;
    let params = {
      $sig: txmsg.data.sig,
    };
    app.storage.executeDatabase(sql, params, "redsquare");

    return;

  }


  loadRedSquare() {

    if (this.app.options.redsquare) {
      this.redsquare = this.app.options.redsquare;
      return;
    }

    this.redsquare = {};
    this.redsquare.last_checked_notifications_timestamp = new Date().getTime();
    this.redsquare.last_liked_tweets = [];
  }



  saveStun() {
    this.app.options.redsquare = this.redsquare;
    this.app.options.saveOptions();
  }

}

module.exports = RedSquare;

