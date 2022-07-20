const saito = require("./../../lib/saito/saito");
const ModTemplate = require('../../lib/templates/modtemplate');
const SaitoHeader = require('../../lib/saito/new-ui/saito-header/saito-header');
const RedSquareMain = require('./lib/main');
const JSON = require("json-bigint");

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
  // TEMPORARY METHOD TO ADD TWEETS ON MODULE LOAD
  // NEEDS TO BE REMOVED BEFORE CODE MERGE
  //
  installModule(app) {

    if (this.app.BROWSER == 1) { return }

    super.installModule(app);

    let dummy_content = [
      // {
      //   text: 'Etiam luctus, massa ut mattis maximus, magna dolor consequat massa, sit amet finibus velit nisi vitae sem.',
      //   img: 'https://cdn.titans.ventures/uploads/photo_2021_04_12_20_54_32_fe75007318.jpg',
      // },
      {
        text: 'Aliquam rutrum consectetur neque, eu efficitur turpis volutpat sit amet.',
      },
      // {
      //   text: 'In molestie, turpis ac placerat consequat, nulla eros semper nisl, non auctor nibh ex non metus.',
      // },
      // {
      //   text: 'Nam tempor lacinia feugiat. Phasellus rutrum dui odio, eget condimentum ligula dictum at.',
      //   img: 'https://image.cnbcfm.com/api/v1/image/106820278-1609972654383-hand-holding-a-bitcoin-in-front-of-a-computer-screen-with-a-dark-graph-blockchain-mining-bitcoin_t20_pRrrjP.jpg?v=1623438422&w=1920&h=1080',
      // },
      // {
      //   text: 'Etiam hendrerit ex ut neque bibendum porta.',
      // },
      // {
      //   text: 'Sed in magna tortor. Maecenas interdum malesuada tellus vel malesuada.',
      //   img: 'https://tesla-cdn.thron.com/delivery/public/image/tesla/03e533bf-8b1d-463f-9813-9a597aafb280/bvlatuR/std/4096x2560/M3-Homepage-Desktop-LHD',
      // }
    ];

    for (let i = 0; i < dummy_content.length; i++) {
      this.sendTweetTransaction(dummy_content[i]);
    }
  }


  onPeerHandshakeComplete(app, peer) {

    let redsquare_self = this;

    app.modules.returnModule("RedSquare").sendPeerDatabaseRequestWithFilter(
      "RedSquare",
      `SELECT * FROM tweets DESC LIMIT 100`,
      (res) => {

        console.log('res');
        console.log(res);
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
              console.log('tweets array');
              console.log(redsquare_self.tweets);
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

  sendTweetTransaction(data) {

    // set defaults
    let obj = {
      module: this.name,
      request: "create tweet",
      data : {} ,
    };
    for (let key in data) { obj.data[key] = data[key]; }

    let newtx = this.app.wallet.createUnsignedTransaction();
    newtx.msg = obj;
    this.app.wallet.signTransaction(newtx);
    this.app.network.propagateTransaction(newtx);

  }

  async receiveTweetTransaction(blk, tx, conf, app) {

    let txmsg = tx.returnMessage();

    let txn = JSON.stringify(tx.transaction);
    let sig = tx.transaction.sig;
    let publickey = tx.transaction.from[0].add;

    console.log('inside receiveTweetTransaction');
    console.log(txmsg);

    let sql = `INSERT INTO tweets (
                tx,
                sig,
                publickey
              ) VALUES (
                $txn,
                $sig,
                $publickey
              )`;

    let params = {
      $txn: txn,
      $sig: sig,
      $publickey: publickey
    };
    app.storage.executeDatabase(sql, params, "redsquare");
    return;
  }

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

}

module.exports = RedSquare;

