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

    return this;
  }




  respondTo(type) {

    if (type == 'email-appspace') {
      return new InvitesEmailAppspace(this.app, this);
    }

    return null;
  }

}


module.exports = Invites;

