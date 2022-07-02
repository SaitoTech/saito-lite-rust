
module.exports = InvitesInvitationTemplate = (app, mod, invite_index) => {

  let invite 		= mod.invites[invite_index];
  let title 		= invite.title;

  let html = `
    <div class="invites-invitation invites-invitation-${invite_index}">
      <div class="invites-invitation-title">${mod.invites[invite_index].title}</div>
      <div class="invites-invitation-adds saito-grid-1-1">
  `;
  for (let i = 0; i < invite.adds.length; i++) {
  html += `
        <div class="invites-invitation-adds-add">${invite.adds[i]}</div>
	<div class="invites-invitation-adds-terms">${invite.terms[i]}</div>
	`;
  }
  html += `
      </div>
      <div class="invites-invitation-controls">
        <div class="invites-invitation-join saito-button-secondary" data-id="${invite_index}">join</div>
        <div class="invites-invitation-accept saito-button-secondary" data-id="${invite_index}">accept</div>
        <div class="invites-invitation-cancel saito-button-secondary" data-id="${invite_index}>cancel</div>
      </div>
    </div>
  `;

  return html;

}

