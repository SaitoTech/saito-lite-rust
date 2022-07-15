
module.exports = SaitoUserTemplate = (app, mod, publickey, userline="") => {

  return `
    <div class="saito-user">
      <div class="saito-identicon-box"><img class="saito-identicon" src="/saito/img/david.jpeg"></div>
      <div>
        <div class="saito-username">${publickey}</div>
        <div class="saito-userline">${userline}</div>
      </div>
    </div>
  `;

}

