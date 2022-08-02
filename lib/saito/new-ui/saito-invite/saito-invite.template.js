
module.exports = (app, mod, options) => {

   return `
    <div class="saito-invite-container">
      <h5 class="invite-heading">Invite</h5>

      <a href="#" id="invite-public-container">    
        <div class="saito-user" id="invite-public-container">
          <div class="saito-identicon-container">
            <img class="saito-identicon" src="/saito/img/no-profile.png">
          </div>
          <div class="saito-username">Public/Open</div>
          <div class="saito-userline">add a public slot allowing anyone can join</div>
        </div>
      </a>

      <p class="invite-seperator">OR</p>

      <a href="#" id="invite-private-container">
        <div class="saito-user" >
          <div class="saito-identicon-container">
            <img class="saito-identicon" src="/saito/img/invite-private-profile.jpeg">
          </div>
          <div class="saito-username">Private</div>
          <div class="saito-userline">Invite someone specific</div>
        </div>
      </a>

      <div class="invite-private-input-container" id="invite-private-input-container">
        <input type='text' id='invite-private-key' name='invite-private-key'>
        <div id="scheduler-overlay-next-btn" class="saito-button-primary small scheduler-overlay-control-btn">
          Invite
        </div>
      </div>
  </div>
   `;

}

