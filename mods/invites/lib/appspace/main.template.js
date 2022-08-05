const SaitoUserWithControlsTemplate = require('./../../../../lib/saito/new-ui/templates/saito-user-with-controls.template');

module.exports = InvitesAppspaceTemplate = (app, mod) => {

  return `

  <div class="invites-appspace">

    <div class="saito-page-header">
      <div id="invites-new-invite" class="saito-button-secondary small" style="float: right;">Create Invite</div>
      <div id="saito-page-header-title" class="saito-page-header-title">INVITATIONS</div>
      <div id="saito-page-header-text" class="saito-page-header-text">Saito supports on-chain invitations to games, events, video-calls and more. Create a new invitation or accept invites sent to you by others.
      </div>
    </div>

    <div id="invites-list class="invites-list">
    </div>

  </div>

  `;

}






