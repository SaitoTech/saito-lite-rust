const SaitoUserWithControlsTemplate = require('./../../../../lib/saito/new-ui/templates/saito-user-with-controls.template');

module.exports = RedSquareNotificationsAppspaceTemplate = (app, mod) => {

  let tx = app.wallet.createUnsignedTransaction();

  return `

    <div class="redsquare-appspace-notifications">

      <div class="saito-page-header">
        <div id="redsquare-notifications-settings" class="redsquare-notifications-settings saito-button-secondary small" style="float: right;">Notification Settings</div>
        <div class="saito-page-header-title">NOTIFICATIONS</div>
        <div class="saito-page-header-text">
This page shows invitations you have received from other users, as well as alerts flagged for your Red Square activity feed.
        </div>
      </div>

      <div class="redsquare-list redsquare-invites">
      </div>

    </div>

  `;

}

