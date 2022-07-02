
module.exports = InvitesInvitationTemplate = (app, mod, invite_index) => {

  return `
    <div class="invites-invitation invites-invitation-${invite_index}">
          <div class="invites-invitation-join saito-button-secondary" data-id="${invite_index}">join</div>
          <div class="invites-invitation-accept saito-button-secondary" data-id="${invite_index}">accept</div>
          <div class="invites-invitation-cancel saito-button-secondary" data-id="${invite_index}>cancel</div>
          </div>
    </div>
  `;

}

