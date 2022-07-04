module.exports = InvitesEmailAppspaceTemplate = (app, mod) => {

  return `
  
  <h3>Invitations:</h3> 

  <p></p>

  <div class="invites-json-tree" id="invites-json-tree"></div>

  <p></p>

  <div class="invites" id="invites"></div>

  <p></p>

  <h3>Create New Invitation</h3>

  <input type="text" class="invite_address" id="invite_address" />

  <p></p>

  <div class="saito-button-primary invite_btn" id="invite_btn">Send Invite</div>

  `;

}
