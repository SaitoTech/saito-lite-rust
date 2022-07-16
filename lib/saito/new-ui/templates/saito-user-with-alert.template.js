
module.exports = SaitoUserWithAlertTemplate = (app, mod, publickey="", userline="", timestamp="") => {

  let imgsrc = '/saito/img/no-profile.png';

  if (publickey !== "") {
    imgsrc = app.keys.returnIdenticon(publickey);
  }


  return `
    <div class="saito-user">
      <div class="saito-identicon-container">
        <img class="saito-identicon" src="${imgsrc}">
      </div>
      <div class="saito-username saito-username-long">${publickey}</div>
      <div class="saito-userline">${userline}</div>
      <div class="saito-user-alert">3:46</div>
    </div>
  `;

}

