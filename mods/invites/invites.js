var saito = require('../../lib/saito/saito');
var InviteTemplate = require('../../lib/templates/invitetemplate');
const InvitesAppspace = require('./lib/email-appspace/invites-appspace');


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
      let obj = {};
	  obj.render = this.renderEmail;
	  obj.attachEvents = this.attachEventsEmail;
      return obj;
    }

    return null;
  }

  renderEmail(app, mod) {
     InvitesAppspace.render(app, this);
  }

  attachEventsEmail(app, mod) {
     InvitesAppspace.attachEvents(app, this);
  }

}


module.exports = Invites;

