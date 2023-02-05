
module.exports = SaitoUserSmallTemplate = (app, publickey = "") => {

  let imgsrc = '/saito/img/no-profile.png';

  if (app.crypto.isPublicKey(publickey)) {
    imgsrc = app.keychain.returnIdenticon(publickey);
  }

  return `

  <div class="saito-user small saito-user-${publickey}" id="saito-user-${publickey}" data-id="${publickey}">
    <div class="saito-identicon-box"><img class="saito-identicon" src="${imgsrc}" data-id="${publickey}"></div>
    <div class="saito-address saito-address-${publickey}" data-id="${publickey}">${publickey}</div>
  </div>
  `;

}

