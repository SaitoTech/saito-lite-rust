module.exports = (app, mod, options) => {
	return `

    <div class="saito-inviter">

      <h5>Invite Whom?</h5>

      <div class="saito-invite saito-user saito-public-invitation" id="saito-public-invitation">
          <div class="saito-identicon-box">
            <img class="saito-identicon" src="/saito/img/no-profile.png">
          </div>
          <div class="saito-address">Public / Open</div>
          <div class="saito-userline">anyone can join...</div>
      </div>

      <div class="saito-invite saito-user saito-private-invitation" id="saito-private-invitation">
          <div class="saito-identicon-box">
            <img class="saito-identicon" src="/saito/img/no-profile.png">
          </div>
          <div class="saito-address">Private</div>
          <div class="saito-userline">invite by address...</div>
      </div>

  </div>
   `;
};
