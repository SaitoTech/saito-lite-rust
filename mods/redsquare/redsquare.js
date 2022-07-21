const saito = require("./../../lib/saito/saito");
const ModTemplate = require('../../lib/templates/modtemplate');
const SaitoHeader = require('../../lib/saito/new-ui/saito-header/saito-header');
const RedSquareMain = require('./lib/main');
const Tweet = require('./lib/tweet');
const JSON = require("json-bigint");
const fetch = require('node-fetch');
const HTMLParser = require('node-html-parser');
const prettify = require('html-prettify');


class RedSquare extends ModTemplate {

  constructor(app) {

    super(app);

    this.appname = "Red Square";
    this.name = "RedSquare";
    this.slug = "redsquare";
    this.description = "Open Source Twitter-clone for the Saito Network";
    this.categories = "Social Entertainment";

    this.tweets = [];

    this.styles = [
      '/saito/saito.css',
      '/redsquare/css/redsquare-main.css',
      '/redsquare/css/arcade.css',		// game creation overlays
    ];

    this.ui_initialized = false;
  }


  render(app, mod, selector = "") {

    if (this.ui_initialized == false) {

      this.main = new RedSquareMain(this.app, this);
      this.header = new SaitoHeader(this.app, this);

      this.addComponent(this.main);
      this.addComponent(this.header);

      this.ui_initialized = true;
    }

    super.render(app, this);

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

      let link = message.data.link;
      let link_properties = await this.fetchOpenGraphProperties(app, mod, link);

      mycallback(res);
      return;

    }

    super.handlePeerRequest(app, message, peer, mycallback);

  }


  //
  // TEMPORARY METHOD TO ADD TWEETS ON MODULE LOAD
  // NEEDS TO BE REMOVED BEFORE CODE MERGE
  //
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





  async fetchOpenGraphProperties(app, mod, link){

    if (this.app.BROWSER == 0) {

console.log("Trying to fetch: " + link);      

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

console.log("fetched!");

        // prettify html - unminify html if minified
        let html = prettify(data);

        // parse string html to DOM html
        let dom = HTMLParser.parse(html);

        // fetch meta element for og tags
        let meta_tags = dom.getElementsByTagName('meta');

        // loop each meta tag and fetch required og properties
        for (let i=0; i<meta_tags.length; i++) {
          let property = meta_tags[i].getAttribute('property');
          let content = meta_tags[i].getAttribute('content');
        
          console.log('property');
          console.log(property);
          console.log('content');
          console.log(content);

          // get required og properties only, discard others
          if (property in og_tags) {
            og_tags[property] = content;
            og_tags['og:exists'] = true;
          }
        }

        return og_tags;
      });
      } catch (err) {
console.log("Error: returning nothing: ");
return {};
      }
    } else {
      return {};
    }
  }




  onPeerHandshakeComplete(app, peer) {

    let redsquare_self = this;

    app.modules.returnModule("RedSquare").sendPeerDatabaseRequestWithFilter(

      "RedSquare",

      `SELECT * FROM tweets DESC LIMIT 100`,

      (res) => {

        if (res.rows) {

          res.rows.forEach(row => {

	    let new_tweet = 1;

	    for (let i = 0; i < redsquare_self.tweets.length; i++) {
	      if (redsquare_self.tweets[i].optional.sig == row.sig) {
		new_tweet = 0;
	      }
	    }

	    if (new_tweet) {

	      let tx = new saito.default.transaction(JSON.parse(row.tx));

	      if (!tx.optional) { tx.optional = {}; }
              tx.optional.likes 	= tx.msg.likes;
              tx.optional.retweets 	= tx.msg.retweets;
      	      tx.optional.parent_id 	= tx.msg.parent_id;
      	      tx.optional.thread_id 	= tx.msg.thread_id;

	      let tweet = new Tweet(app, redsquare_self, tx);
	      tweet.generateTweetProperties(app, redsquare_self, 0);
	      tx.tweet = tweet;

  	      redsquare_self.tweets.push(tx);
              app.connection.emit('tweet-render-request', tx);
	    }
          });
        }
      }
    );
  }


  async onConfirmation(blk, tx, conf, app) {

    let redsquare_self = this;
    let txmsg = tx.returnMessage();

    try {
      if (conf == 0) {
        if (txmsg.request === "create tweet") {

          this.receiveTweetTransaction(blk, tx, conf, app).then(

            function(value) {
              redsquare_self.tweets.push(tx);
              app.connection.emit('tweet-render-request', tx);
            },

            function(error) {
              console.log("ERROR in " + this.name + " onConfirmation: " + error);
            }
          );
        }

      }
    } catch (err) {
      console.log("ERROR in " + this.name + " onConfirmation: " + err);
    }
  }

  sendTweetTransaction(app, mod, data) {

    let redsquare_self = this;

    let obj = {
      module: redsquare_self.name,
      request: "create tweet",
      data : {} ,
    };
    for (let key in data) { 
      obj.data[key] = data[key];
    }

    let newtx = redsquare_self.app.wallet.createUnsignedTransaction();
    newtx.msg = obj;
    newtx = redsquare_self.app.wallet.signTransaction(newtx);

    redsquare_self.app.network.propagateTransaction(newtx);
  }

  async receiveTweetTransaction(blk, tx, conf, app) {

    let tweet     = new Tweet(app, this, tx);
        tweet     = await tweet.generateTweetProperties(app, this);

    //
    // browsers
    //
    if (app.BROWSER == 1) {
      tx.tweet      = tweet;
      this.tweets.push(tx);
      app.connection.emit("tweet-render-request", tx);
      return;
    } 


    //
    // servers
    //
    // fetch supporting link properties
    //
    tweet = await tweet.generateTweetProperties(app, this, 1);


    //
    // insert the basic information
    //
    let sql = `INSERT INTO tweets (
                tx,
                sig,
                publickey,
                link,
		link_properties
              ) VALUES (
                $txjson,
                $sig,
                $publickey,
		$link,
		$link_properties
              )`;
    let params = {
      $txjson: JSON.stringify(tx.transaction),
      $sig: tx.transaction.sig,
      $publickey: tx.transaction.from[0].add,
      $link: tweet.tweet.link,
      $link_properties: JSON.stringify(tweet.tweet.link_properties)
    };

console.log("PARAMS: " + JSON.stringify(params));

    app.storage.executeDatabase(sql, params, "redsquare");    return;

  }








/***** WAIT TO IMPLEMENT *****
  sendLikeTweetTransaction(tweet_id) {
    let newtx = this.app.wallet.createUnsignedTransaction();

    newtx.msg = {
      module: this.name,
      tweet_id: tweet_id,
      request: "like tweet",
      timestamp: new Date().getTime()
    };

    this.app.wallet.signTransaction(newtx);
    this.app.network.propagateTransaction(newtx);
  }


  receiveLikeTweetTransaction(blk, tx, conf, app) {
    let txmsg = tx.returnMessage();

    let tweet_id = txmsg.tweet_id;
    let publickey = tx.transaction.from[0].add;
    let created_at = new Date().getTime();
    let updated_at = new Date().getTime();


    // TO-DO
    // add data into columns according to the tweets.sql
    //

    let sql = `INSERT INTO likes (
                tweet_id,
                publickey,
                created_at,
                updated_at,
              ) VALUES (
                $tweet_id, 
                $publickey,
                $created_at,
                $updated_at
              )`;

    let params = {
      $tweet_id: tweet_id,
      $publickey: publickey,
      $created_at: created_at,
      $updated_at: updated_at
    };
    app.storage.executeDatabase(sql, params, "redsquare");
    return;
  }
***** WAIT TO IMPLEMENT *****/


}

module.exports = RedSquare;

