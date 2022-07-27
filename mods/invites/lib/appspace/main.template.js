const SaitoUserWithControlsTemplate = require('./../../../../lib/saito/new-ui/templates/saito-user-with-controls.template');

module.exports = InvitesAppspaceTemplate = (app, mod) => {

  return `

  <div class="invites-appspace">

    Invite

    <select class="saito-new-select">
      <option>1 person</option>
      <option>2 people</option>
      <option>3 people</option>
      <option>4 people</option>
    </select>

    to a

    <select class="saito-new-select">
      <option>video call</option>
      <option>arcade game</option>
      <option>other event</option>
    </select>

  </div>

  `;

}






