const SaitoArcadeInviteTemplate = require('./../../../../lib/saito/new-ui/templates/saito-arcade-invite.template');
const RedSquareLeagueSidebar = require('./league-sidebar.template');


module.exports = RedSquareGamesSidebarTemplate = (app, mod) => {

  return  `
        <div class="saito-sidebar right">
          <div class="saito-arcade-invite-list"></div>
          ${RedSquareLeagueSidebar(app, mod)}
        </div>`;

}

