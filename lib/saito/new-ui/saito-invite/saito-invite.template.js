
module.exports = (app, mod, options) => {

   return `
    <div class="saito-invite-container">
      <h5 class="invite-heading">Invite</h5>
    
      <div class="saito-user">
        <div class="saito-identicon-container">
          <img class="saito-identicon" src="/saito/img/no-profile.png">
        </div>
        <div class="saito-username">Public/Open</div>
        <div class="saito-userline">add a public slot allowing anyone can join</div>
      </div>

      <p class="invite-seperator">OR</p>

      <div class="saito-user">
        <div class="saito-identicon-container">
          <img class="saito-identicon" src="/saito/img/invite-private-profile.jpeg">
        </div>
        <div class="saito-username">Private</div>
        <div class="saito-userline">Invite someone specific</div>
      </div>
  </div>
   `;

}

