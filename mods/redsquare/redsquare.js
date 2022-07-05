const ModTemplate = require('../../lib/templates/modtemplate');
const SaitoHeader = require('../../lib/saito/new-ui/saito-header/saito-header');
const SaitoSidebar = require('../../lib/saito/new-ui/saito-sidebar/saito-sidebar');
const SaitoCalendar = require('../../lib/saito/new-ui/saito-calendar/saito-calendar');
const RedSquareMain = require('./lib/main/redsquare-main');
const RedSquareMenu = require('./lib/menu');
const RedSquareChatBox = require('./lib/chatbox');


class RedSquare extends ModTemplate {

  constructor(app) {

    super(app);

    this.appname = "Red Square";
    this.name = "RedSquare";
    this.slug = "redsquare";
    this.description = "Open Source Twitter-clone for the Saito Network";
    this.categories = "Social Entertainment";

    this.styles = [
      '/saito/saito.css',
      '/redsquare/css/redsquare-main.css',
    ];

    this.ui_initialized = false;

  }



  render(app, mod) {

    console.log("RENDERING REDSQUARE!");

    if (this.ui_initialized == false) {

      this.main = new RedSquareMain(this.app);
      this.header = new SaitoHeader(this.app);
      this.menu = new RedSquareMenu(this.app);
      this.chatBox = new RedSquareChatBox(this.app)
      this.calendar = new SaitoCalendar(this.app);

      this.lsidebar = new SaitoSidebar(this.app);
      this.lsidebar.align = "left";

      this.rsidebar = new SaitoSidebar(this.app);
      this.rsidebar.align = "right";

      //
      // combine ui-components
      //
      this.addComponent(this.lsidebar);
      this.addComponent(this.main);
      this.addComponent(this.rsidebar);
      this.addComponent(this.header);

      this.lsidebar.addComponent(this.menu);
      this.lsidebar.addComponent(this.chatBox);

      this.rsidebar.addComponent(this.calendar);

      this.ui_initialized = true;
    }

    super.render(app, this);

  }


  //
  // TEMPORARY METHOD TO ADD TWEETS ON MODULE LOAD
  // NEEDS TO BE REMOVED BEFORE CODE MERGE
  //

  installModule(app){
    if (this.app.BROWSER == 1) { return }

    super.installModule(app);

    let dummy_content = [
      {
        content: 'Etiam luctus, massa ut mattis maximus, magna dolor consequat massa, sit amet finibus velit nisi vitae sem.',
        img: '',
        parent_id: 'https://cdn.titans.ventures/uploads/photo_2021_04_12_20_54_32_fe75007318.jpg', 
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

    for (let i=0; i<dummy_content.length; i++) {
      this.sendTweetTransaction(dummy_content[i]);
    }
  }


  onPeerHandshakeComplete(app, peer) {
    app.modules.returnModule("RedSquare").sendPeerDatabaseRequestWithFilter(
      "RedSquare",
      `SELECT * FROM tweets DESC LIMIT 100` ,
      (res) => {
        if (res.rows) {
          res.rows.forEach(row => {
            this.app.connection.emit('tweet-render-request', row);
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

  sendTweetTransaction(data){
    let newtx = this.app.wallet.createUnsignedTransaction();

    newtx.msg = {
      module: this.name,
      content: data.content,
      img: data.img,
      parent_id: data.parent_id, 
      flagged: data.flagged,
      moderated: data.moderated,
      request:  "create tweet",
      timestamp: new Date().getTime()
    };

    this.app.wallet.signTransaction(newtx);
    this.app.network.propagateTransaction(newtx); 
  }

  receiveTweetTransaction(blk, tx, conf, app) {
    let txmsg = tx.returnMessage();

    let txn = '';//JSON.stringify(tx); currently getting error when storing tx to db
    let tx_sig = tx.transaction.sig;
    let parent_id = txmsg.parent_id;
    let publickey = tx.transaction.from[0].add;
    let flagged = txmsg.flagged;
    let moderated = txmsg.moderated;
    let img = txmsg.img;
    let content = txmsg.content;
    let created_at = new Date().getTime();
    let updated_at = new Date().getTime();

    let sql = `INSERT INTO tweets (
                tx,
                tx_sig,
                parent_id, 
                publickey,
                flagged,
                moderated,
                img,
                content,
                created_at,
                updated_at
              ) VALUES (
                $txn,
                $tx_sig,
                $parent_id, 
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
      $tx_sig: tx_sig,
      $parent_id: parent_id, 
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

}

module.exports = RedSquare;

