var saito = require('../../lib/saito/saito');
var InviteTemplate = require('../../lib/templates/invitetemplate');
const InvitesEmailAppspace = require('./lib/email-appspace/email-appspace');


class Invites extends InviteTemplate {

  constructor(app) {
    super(app);

    this.app            = app;
    this.name           = "Invites";
    this.description    = "Demo module with UI for invite display and acceptance";
    this.categories     = "Utilities Education Demo";

    this.invites        = [];

    return this;
  }


  initialize(app) {
    this.load();
  }



  respondTo(type) {

    if (type == 'email-appspace') {
      return new InvitesEmailAppspace(this.app, this);
    }

    return null;
  }


  addInvite(tx) {

    let txmsg = tx.returnMessage();

    for (let i = 0; i < this.invites.length; i++) {
      if (JSON.stringify(txmsg) === JSON.stringify(this.invites[i])) {
	return;
      }
    }

    this.invites.push(txmsg);
  }



  //
  // InviteTemplate handles
  //
  async onConfirmation(blk, tx, conf, app) {
    super.onConfirmation(blk, tx, conf, app);
  }

}


module.exports = Invites;

