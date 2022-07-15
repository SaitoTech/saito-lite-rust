
module.exports = SaitoUserWithTimeTemplate = (app, mod, publickey="", userline="", timestamp="") => {

  return `
    <div class="saito-user">
      <div class="saito-identicon-container">
        <img class="saito-identicon" src="/saito/img/david.jpeg">
      </div>
      <div class="saito-username saito-username-long">${publickey}</div>
      <div class="saito-userline">${userline}</div>
      <div class="saito-datetime">3:46</div>
    </div>
  `;

}

