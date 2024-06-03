const ModTemplate = require('../../lib/templates/modtemplate');
import fetch from 'node-fetch';

class NTFY extends ModTemplate {
  constructor(app) {
    super(app);

    this.description = 'Module to send notifications to phones.';
    this.categories = 'Communications Utilities';

    this.name = 'NTFY';
    this.deascription = 'Integrates on-chain messages with mobile phones';
    this.categories = 'Core Utilities';
    this.class = 'utility';

    this.ntfy = {};
    this.ntfy.server = 'https://ntfy.hda0.net/';
  }

  onConfirmation(blk, tx, conf) {
    if (conf == 0) {
      console.log(JSON.stringify(tx));
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

  sendNotifications(txs) {
    let this_self = this;
    txs.forEach((tx) => {
      //console.log(tx);
      let to = [];
      tx.to.forEach((slip) => {
        if (slip?.publicKey != tx.from[0]?.publicKey && slip?.publicKey != this_self.app.wallet.publicKey) {
          to.push(slip.publicKey);
        }
      });

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


      if (to.length > 0 && JSON.stringify(tx.msg).length > 2) {
        notification.title = 'Saito ' + tx.msg.module;
        let data = "";
        if (typeof tx.msg != "undefined") {
          data = JSON.stringify(tx.msg);
          data = data.substring(0, 50);
        }
        notification.message = "Message: " + tx.msg.request?.substring(0, 50) + "\nData: " + data;
        notification.tags = ['exclamation'];
        notification.actions = [
          { action: 'view', label: 'Open Saito', url: 'https://saito.io/' }
        ];
        
        to.forEach((key) => {
          console.log(to.toString());
          notification.topic = key;
          try {
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

    notification.topic = 'basic';
    notification.title = 'Notification Service Activated';
    notification.message = 'The notification module has been activated';
    notification.tags = ['exclamation'];
    notification.actions = [
      { action: 'view', label: 'Saito', url: 'localhost:12101' }
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
