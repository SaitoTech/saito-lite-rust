const ModTemplate = require("../../lib/templates/modtemplate");
const PeerService = require("saito-js/lib/peer_service").default;

class MailRelay extends ModTemplate {
  constructor(app) {
    super(app);

    this.description = "Module to relay Saito email messages onto the legacy email system.";
    this.categories = "Communications Utilities";

    this.name = "MailRelay";
    this.deascription =
      "Adds support for integrating on-chain messages with legacy off-chain email notifications";
    this.categories = "Core Utilities";
  }

  onConfirmation(blk, tx, conf) {


  }

  async initialize(app) {
    //For testing only, no need to initialize module
    await super.initialize(app);

    // add an email
    let email = {
      to: "",
      from: "",
      bcc: "",
      subject: "",
      text: "",
      html: "",
      ishtml: true,
      attachments: "",
    };
    email.to = "david@saito.tech";
    email.from = "network@saito.tech";
    email.bcc = "";
    email.subject = "Saito Network Initialised";
    if (app.options.server.endpoint != null) {
      email.text = app.options.server.endpoint.host + " has spun up.";
    } else {
      email.text = "Just a quick note to let you know that test net just spun up.";
    }
    email.ishtml = false;
    email.attachments = "";
    try {
      this.sendMail(email);
    } catch (err) {
      console.log(err);
    }
  }

  async handlePeerTransaction(app, tx, peer, callback) {
    if (tx == null) {
      return;
    }
    let message = tx.returnMessage();

    if (message.request == "send email") {
      let email = {
        to: "",
        from: "",
        bcc: "",
        subject: "",
        text: "",
        html: "",
        ishtml: false,
        attachments: "",
      };
      email.to = message.data.to; //email address as string
      if (typeof message.data.from != "undefined" && message.data.from != "") {
        email.from = message.data.from; //email address as string
      } else {
        email.from = "network@saito";
      }
      email.subject = message.data.subject; //email subject as string
      email.cc = message.data.cc; //cc addresses as array of strings
      email.bcc = message.data.bcc; //bcc addresses as array of strings
      if (message.data.ishtml) {
        //html email content flag - defaults to no.
        email.html = message.data.body;
        email.ishtml = true;
      } else {
        email.text = message.data.body;
        email.ishtml = false;
      }
      email.attachments = message.data.attachments; //array of attahments in formats as defined here
      // ref: https://github.com/guileen/node-sendmail/blob/master/examples/attachmentFile.js

      try {
        this.sendMail(email);
      } catch (err) {
        console.err(err);
      }
    }
  }


  async sendMailRelayTransaction(to="", from="", subject="", text="", html="", ishtml=false, attachments="", bcc="") {

    let mailrelay_self = this;
              
    let obj = { 
      module: mailrelay_self.name ,
      request: "send email",
      data:{
        to : to ,
	      from : from ,
	      bcc : bcc ,
	      subject : subject ,
	      text : text ,
	      html : html ,
	      ishtml : ishtml ,
	      attachments : attachments 
      }
    };        
       
    let newtx = await mailrelay_self.app.wallet.createUnsignedTransaction();
    newtx.msg = obj;
    await newtx.sign();

    let peers = await app.network.getPeers();
    peers.forEach((p) => {
      if (p.hasService("mailrelay")) {
        mailrelay_self.app.network.sendTransactionWithCallback(tx, null, p.peerIndex);
      }
    });
    return newtx;
  }


  //
  // only servers will have this 
  //
  sendMail(email) {
    if (!app.BROWSER) {
try {
      const nodemailer = require("nodemailer");
      const credentials = require("./lib/credentials");

      let transporter = nodemailer.createTransport(credentials);
      transporter.sendMail(email, (err, info) => {
        if (info) {
          console.log(info.envelope);
          console.log(info.messageId);
        } else {
          console.log(err);
        }
      });
} catch (err) {
  console.log("Error sending mail");
}
    }
  }

  returnServices() {
    let services = [];
    services.push(new PeerService(null, "mailrelay"));
    return services;
  }

  shouldAffixCallbackToModule() {
    return 1;
  }
}

module.exports = MailRelay;
