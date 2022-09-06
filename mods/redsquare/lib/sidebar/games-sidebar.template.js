const SaitoArcadeInviteTemplate = require('./../../../../lib/saito/new-ui/templates/saito-arcade-invite.template');
const RedSquareSidebarTemplate = require('./league-sidebar.template');
const RedSquareObserverSidebarTemplate = require('./observer-sidebar.template');

module.exports = RedSquareGamesSidebarTemplate = (app, mod) => {

  return  `
        <div class="saito-sidebar right">
          <div class="saito-arcade-invite-list">
          </div>
          ${RedSquareObserverSidebarTemplate(app, mod)}
          ${RedSquareLeagueSidebarTemplate(app, mod)}
        </div>
       `;
  
}

