const saito = require("./../../lib/saito/saito");
const ModTemplate = require('../../lib/templates/modtemplate');
const SaitoHeader = require('../../lib/saito/new-ui/saito-header/saito-header');
const SaitoSidebar = require('../../lib/saito/new-ui/saito-sidebar/saito-sidebar');

const RedSquareFriends = require('./lib/friends');
const RedSquareMain = require('./lib/main/redsquare-main');
const RedSquareMenu = require('./lib/menu');
const RedSquarePostTweet = require('./lib/post-tweet');
const RedSquareSidebar = require('./lib/sidebar');
const RedSquareGamesSidebar = require('./lib/games-sidebar');
const RedSquareGamesAppspace = require('./lib/games-appspace');
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
    ];

    this.ui_initialized = false;
  }


  render(app, mod) {

    if (this.ui_initialized == false) {

      this.main = new RedSquareMain(this.app);
      this.header = new SaitoHeader(this.app);
      this.menu = new RedSquareMenu(this.app);
      this.games_appspace = new RedSquareGamesAppspace(this.app);

      this.contactlist = new RedSquareFriends(this.app, this);

      this.lsidebar = new SaitoSidebar(this.app, this, ".saito-container");
      this.lsidebar.align = "left";

      this.wide_sidebar = new RedSquareSidebar(this.app, this, ".saito-container");
      this.games_sidebar = new RedSquareGamesSidebar(this.app, this, ".saito-container");



      //this.post_tweet = new RedSquarePostTweet(this.app);

      //
      // combine ui-components
      //
      this.addComponent(this.lsidebar);
      this.addComponent(this.main);
      this.addComponent(this.wide_sidebar);
      this.addComponent(this.header);

      //this.addComponent(this.post_tweet)

      this.lsidebar.addComponent(this.menu);
      this.app.modules.respondTo("chat-manager").forEach(mod => {
	this.lsidebar.addComponent(mod.respondTo("chat-manager"));
      });
      //this.lsidebar.addComponent(this.chatBox);

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
      {
        content: 'Etiam luctus, massa ut mattis maximus, magna dolor consequat massa, sit amet finibus velit nisi vitae sem.',
        img: 'https://cdn.titans.ventures/uploads/photo_2021_04_12_20_54_32_fe75007318.jpg',
        parent_id: '',
        flagged: 0,
        moderated: 0
      },
      {
        content: 'Aliquam rutrum consectetur neque, eu efficitur turpis volutpat sit amet.',
        img: '',
        parent_id: '',
        flagged: 0,
        moderated: 0
      },
      {
        content: 'In molestie, turpis ac placerat consequat, nulla eros semper nisl, non auctor nibh ex non metus.',
        img: '',
        parent_id: 'https://dmccdn.com/uploads/share/Saitonetwork-tn.png',
        flagged: 0,
        moderated: 0
      },
      {
        content: 'Nam tempor lacinia feugiat. Phasellus rutrum dui odio, eget condimentum ligula dictum at.',
        parent_id: '',
        img: 'https://image.cnbcfm.com/api/v1/image/106820278-1609972654383-hand-holding-a-bitcoin-in-front-of-a-computer-screen-with-a-dark-graph-blockchain-mining-bitcoin_t20_pRrrjP.jpg?v=1623438422&w=1920&h=1080',
        flagged: 0,
        moderated: 0
      },
      {
        content: 'Etiam hendrerit ex ut neque bibendum porta.',
        img: '',
        parent_id: '',
        flagged: 0,
        moderated: 0
      },
      {
        content: 'Sed in magna tortor. Maecenas interdum malesuada tellus vel malesuada.',
        img: 'https://tesla-cdn.thron.com/delivery/public/image/tesla/03e533bf-8b1d-463f-9813-9a597aafb280/bvlatuR/std/4096x2560/M3-Homepage-Desktop-LHD',
        parent_id: '',
        flagged: 0,
        moderated: 0
      }
    ];

    for (let i = 0; i < dummy_content.length; i++) {
      this.sendTweetTransaction(dummy_content[i]);
    }
  }


  onPeerHandshakeComplete(app, peer) {

    let redsquare_self = this;

    app.modules.returnModule("RedSquare").sendPeerDatabaseRequestWithFilter(
      "RedSquare",
      `SELECT * FROM tweets9 DESC LIMIT 100`,
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
	      tx.optional.sig = tx.transaction.sig;
	      tx.optional.content = row.content;
	      tx.optional.created_at = row.created_at;
	      tx.optional.flagged = row.flagged;
	      tx.optional.identicon = row.identicon;
	      tx.optional.moderated = row.moderated;
	      tx.optional.parent_id = row.parent_id;
	      tx.optional.thread_id = row.thread_id;
	      tx.optional.updated_at = row.updated_at;

  	      redsquare_self.tweets.push(tx);
              app.connection.emit('tweet-render-request', tx);
	    }
          });
        }
      }
    );
  }


  async onConfirmation(blk, tx, conf, app) {
    let txmsg = tx.returnMessage();

    try {
      if (conf == 0) {
        if (txmsg.request === "create tweet") {
          this.receiveTweetTransaction(blk, tx, conf, app);

          //
          // TODO - update UI when tweet transaction is received
          //
          //this.app.connection.emit('redsquare-update-tweets', row);
        }

      }
    } catch (err) {
      console.log("ERROR in " + this.name + " onConfirmation: " + err);
    }
  }

  sendTweetTransaction(data) {

    let newtx = this.app.wallet.createUnsignedTransaction();
    let thread_id = data.parent_id;
    if (data.thread_id) { thread_id = data.thread_id; }

    newtx.msg = {
      module: this.name,
      content: data.content,
      img: data.img,
      parent_id: data.parent_id,
      thread_id: thread_id,
      flagged: data.flagged,
      moderated: data.moderated,
      request: "create tweet",
      timestamp: new Date().getTime()
    };

    this.app.wallet.signTransaction(newtx);
    this.app.network.propagateTransaction(newtx);

  }

  receiveTweetTransaction(blk, tx, conf, app) {

    let txmsg = tx.returnMessage();

    let txn = JSON.stringify(tx.transaction);
    let sig = tx.transaction.sig;
    let thread_id = txmsg.thread_id;
    let parent_id = txmsg.parent_id;
    let publickey = tx.transaction.from[0].add;
    let flagged = txmsg.flagged;
    let moderated = txmsg.moderated;
    let img = txmsg.img;
    let content = txmsg.content;
    let created_at = new Date().getTime();
    let updated_at = new Date().getTime();

    let sql = `INSERT INTO tweets9 (
                tx,
                sig,
                parent_id, 
                thread_id, 
                publickey,
                flagged,
                moderated,
                img,
                content,
                created_at,
                updated_at
              ) VALUES (
                $txn,
                $sig,
                $parent_id, 
                $thread_id, 
                $publickey,
                $flagged,
                $moderated,
                $img,
                $content,
                $created_at,
                $updated_at
              )`;

    let params = {
      $txn: txn,
      $sig: sig,
      $parent_id: parent_id,
      $thread_id: thread_id,
      $publickey: publickey,
      $flagged: flagged,
      $moderated: moderated,
      $img: img,
      $content: content,
      $created_at: created_at,
      $updated_at: updated_at
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

