const ModTemplate = require('../../lib/templates/modtemplate.js');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

class NTFY extends ModTemplate {
    constructor(app) {
        super(app);

        this.name = 'ntfy';
        this.description = 'Module to send notifications to ntfy server.';
        this.categories = 'Utilities';
        this.class = 'utility';

    this.name = 'NTFY';
    this.deascription = 'Integrates on-chain messages with mobile phones';
    this.categories = 'Core Utilities';
    this.class = 'utility';

    this.ntfy = {};
    this.ntfy.server = process.env.NTFY_SERVER || '';
    this.ntfy.user = process.env.NTFY_USER || '';
    this.ntfy.password = process.env.NTFY_PASSWORD || '';
  }
  onConfirmation(blk, tx, conf) {
    if (conf == 0) {
      //console.log(JSON.stringify(tx));
    }
  }

  onNewBlock(blk, lc) {
    // console.log('warehouse - on new block');
    //var json_block = JSON.parse(blk.toJson());

    var txs = [];
    try {
      blk.transactions.forEach((transaction) => {
        let tx = transaction.toJson();
        tx.msg = transaction.returnMessage();
        txs.push(tx);
      });
    } catch (err) {
      console.error(err);
    }
    if (txs.length > 0) {
      //json_block.transactions = txwmsgs;
      this.sendNotifications(txs);
    }
  }

  async sendNotifications(txs) {
    let this_self = this;

    //make a list of peer keys to filer on.
    let peerkeys = [];
    let peers = await this_self.app.network.getPeers();
    peers.forEach((p) => {
      peerkeys.push(p.publicKey);
    });

    txs.forEach((tx) => {
      //console.log(tx);
      let to = [];
      tx.to.forEach((slip) => {
        //don't send messages to connected peers - use native
        if (!peerkeys.includes(slip?.publicKey)) {
          //don't send messages sent to myself and don't message the node.
          if (
            slip?.publicKey != tx.from[0]?.publicKey &&
            slip?.publicKey != this_self.app.wallet.publicKey
          ) {
            to.push(slip.publicKey);
          }
        }
      });

      if (to.length > 0 && JSON.stringify(tx.msg).length > 2) {
        // here i would like to add logic to ask the module to return the notifcation message and actions.

        let notification = {
          topic: '', // string: Target topic name
          message: '', // string: Message body; set to triggered if empty or not passed
          title: '', // string: Message title
          tags: [], // string array: List of tags that may or not map to emojis
          priority: 3, // int (one of: 1, 2, 3, 4, or 5): Message priority with 1=min, 3=default and 5=max
          actions: [], // JSON array: Custom user action buttons for notifications
          //{ name: "Action1", url: "https://example.com/action1" },
          //{ name: "Action2", url: "https://example.com/action2" }
          click: '', // URL: Website opened when notification is clicked
          attach: '', // URL: URL of an attachment, see attach via URL
          markdown: true, // bool: Set to true if the message is Markdown-formatted
          icon: 'https://saito.tech/wp-content/uploads/2024/05/Logo_256x256.png', // string: URL to use as notification icon
          filename: '', // string: File name of the attachment
          delay: '', // string: Timestamp or duration for delayed delivery
          email: '', // e-mail address: E-mail address for e-mail notifications
          call: '' // phone number or 'yes': Phone number to use for voice call
        };

        let payload = {};
        payload.tx = tx;
        payload.notification = notification;

        for (const mod of this.app.modules.mods) {
          let reply_message = mod.respondTo('ntfy-notification', payload);

          if (reply_message != null) {
            notification = reply_message;

            to.forEach((key) => {
              notification.topic = key;
              try {
                //console.log(notification);
                fetch(this.ntfy.server, {
                  method: 'POST',
                  body: JSON.stringify(notification)
                });
              } catch (err) {
                console.log(err);
              }
            });
          } else {
            //handle fee transactions later
          }
        }
      }
    });
  }

  async initialize(app) {
    // browsers will not have server endpoint coded
    if (app.BROWSER) {
      return;
    }

    //For testing only, no need to initialize module
    await super.initialize(app);

    // add a notification
    let notification = {
      topic: '', // string: Target topic name
      message: '', // string: Message body; set to triggered if empty or not passed
      title: '', // string: Message title
      tags: [], // string array: List of tags that may or not map to emojis
      priority: 3, // int (one of: 1, 2, 3, 4, or 5): Message priority with 1=min, 3=default and 5=max
      actions: [], // JSON array: Custom user action buttons for notifications
      //{ name: "Action1", url: "https://example.com/action1" },
      //{ name: "Action2", url: "https://example.com/action2" }
      click: '', // URL: Website opened when notification is clicked
      attach: '', // URL: URL of an attachment, see attach via URL
      markdown: true, // bool: Set to true if the message is Markdown-formatted
      icon: 'https://saito.tech/wp-content/uploads/2024/05/Logo_256x256.png', // string: URL to use as notification icon
      filename: '', // string: File name of the attachment
      delay: '', // string: Timestamp or duration for delayed delivery
      email: '', // e-mail address: E-mail address for e-mail notifications
      call: '' // phone number or 'yes': Phone number to use for voice call
    };

    let url = 'unkown';
    try {
      url = this.app.options.server.url;
    } catch (err) {
      console.error(err);
    }

    notification.topic = 'basic';
    notification.title = 'Notification Service Activated';
    notification.message = 'The notification module at ' + url + ' has been activated';
    notification.tags = ['exclamation'];
    notification.actions = [
      { action: 'view', label: 'Saito', url: url }
    ];

    try {
      //fetch('https://ntfy.hda0.net/basic/publish?message=this+is+a+js+test');
      //fetch(notification.server+notification.topic+'/publish?'+'message='+notification.message+'&title='+notification.title+'&tags');
      console.info(JSON.stringify(notification));
      fetch(this.ntfy.server, {
        method: 'POST',
        body: JSON.stringify(notification)
      });
    } catch (err) {
      console.log(err);
    }
  }
}

module.exports = NTFY;