
module.exports = SaitoUserTemplate = (app, publickey = "", userline = "", fourthelem = "") => {

  let imgsrc = '/saito/img/no-profile.png';

  if (app.crypto.isPublicKey(publickey)) {
    imgsrc = app.keychain.returnIdenticon(publickey);
  }

  return `

  <div class="saito-user saito-user-${publickey}" id="saito-user-${publickey}" data-id="${publickey}">
    <div class="saito-identicon-box"><img class="saito-identicon" src="${imgsrc}" data-id="${publickey}"></div>
    <div class="saito-address saito-address-${publickey}" data-id="${publickey}">${publickey}</div>
    <div class="saito-userline" data-id="${publickey}">${userline}</div>
    ${fourthelem}
  </div>
  `;

}

