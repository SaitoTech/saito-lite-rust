
module.exports = SaitoUserTemplate = (app, mod, publickey = "", userline = "") => {

  let imgsrc = '/saito/img/no-profile.png';

  if (app.crypto.isPublicKey(publickey)) {
    imgsrc = app.keys.returnIdenticon(publickey);
  }

  return `
    <div class="saito-user saito-user-${publickey}" id="saito-user-${publickey}" data-id="${publickey}">
      <div class="saito-identicon-box"><img class="saito-identicon" src="${imgsrc}"></div>
      <div class="saito-username">${publickey}</div>
      <div class="saito-userline">${userline}</div>
    </div>
  `;

}

