
module.exports = SaitoUserWithControlsTemplate = (app, mod, publickey="", userline="") => {

  return `
    <div class="saito-user">
      <div class="saito-identicon-container">
        <img class="saito-identicon" src="/saito/img/david.jpeg">
      </div>
      <div class="saito-username">${publickey}</div>
      <div class="saito-userline">posted on 3:46 PM - July 7, 2022</div>
      <div class="saito-controls">
        <i class="fas fa-solid fa-ellipsis-h"></i>
      </div>
    </div>
  `;

}

