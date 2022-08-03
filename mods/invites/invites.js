var saito = require('../../lib/saito/saito');
var InviteTemplate = require('../../lib/templates/invitetemplate');
const InvitesAppspace = require('./lib/appspace/main');


class Invites extends InviteTemplate {

  constructor(app) {
    super(app);

    this.app            = app;
    this.name           = "Invites";
    this.description    = "Demo module with UI for invite display and acceptance";
    this.categories     = "Utilities Education Demo";

    this.icon		= "fas fa-envelope-open-text";
    this.invites        = [];
    this.scripts	= [];
    this.styles		= ['/invites/css/appspace.css'];

    return this;

  }


  initialize(app) {
    this.load();
  }



  respondTo(type) {

    if (type == 'appspace') {
      super.render(this.app, this); // for scripts + styles
      return new InvitesAppspace(this.app, this);
    }

    return null;
  }


  //
  // InviteTemplate handles
  //
  async onConfirmation(blk, tx, conf, app) {
    super.onConfirmation(blk, tx, conf, app);
  }

}


module.exports = Invites;

