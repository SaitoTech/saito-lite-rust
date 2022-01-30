const ModTemplate = require('../../lib/templates/modtemplate');
const MixinAppspace = require('./lib/mixin-appspace');

class MixinTest extends ModTemplate {

    constructor(app) {

        super(app);

        this.description = "Mixin Test"
        this.categories = "";

        this.name = "Mixin";
    }

    //    onConfirmation(blk, tx, conf, app) {
    //    }

    initialize(app) {
        //For testing only, no need to initialize module 
        super.initialize(app);

        if(app.BROWSER == 1 || this.browser_active == 1 ) { return; }

        //const ClientConfig = require('../../config/mixin-credentials');

        if(typeof process.env.MIXIN1 == "undefined") { return 0; }
    
        const mixin = JSON.parse(process.env.MIXIN1);
        console.log(mixin);

        const { Client } = require('mixin-node-sdk');

        const client = new Client(mixin);
        
        client.userMe().then(console.log);
        client.verifyPin(mixin.pin).then(a => console.log(a));

    }


    respondTo(type) {

      if (type == 'email-appspace') {
        let obj = {};
      obj.render = function (app, data) {
        MixinAppspace.render(app, data);
            }
      obj.attachEvents = function (app, data) {
        MixinAppspace.attachEvents(app, data);
      }
        return obj;
      }
  
      return null;
    }

    async handlePeerRequest(app, message, peer, callback) {
        /*    if (message.request == "send email") {
                let email = {};
                email.to = message.data.to;         //email address as string
                if (typeof (message.data.from) != "undefined" && message.data.from != "") {
                    email.from = message.data.from;       //email address as string
                } else {
                    email.from = "network@saito";
                }
                email.subject = message.data.subject;    //email subject as string
                email.cc = message.data.cc;         //cc addresses as array of strings
                email.bcc = message.data.bcc;        //bcc addresses as array of strings
                if (message.data.ishtml) {               //html email content flag - defaults to no.
                    email.html = message.data.body;
                } else {
                    email.text = message.data.body;
                }
                email.attachments = message.data.attachments;  //array of attahments in formats as defined here
                // ref: https://github.com/guileen/node-sendmail/blob/master/examples/attachmentFile.js
    
                try {
                    this.sendMail(email);
                } catch(err) {
                    console.err(err);
                }
            } */
    }




    shouldAffixCallbackToModule() { return 1; }

}

module.exports = MixinTest;
