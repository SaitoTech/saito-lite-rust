
module.exports = SaitoUserTemplate = (app, mod, publickey = "", userline = "") => {


  let username = app.keys.returnIdentifierByPublicKey(publickey);
  if (username == "" || username == publickey) {
    username = publickey
  }

  let imgsrc = '/saito/img/no-profile.png';

  if (app.crypto.isPublicKey(publickey)) {
    imgsrc = app.keys.returnIdenticon(publickey);
  }

  return `
    <div class="saito-user saito-user-${publickey}" id="saito-user-${publickey}" data-id="${publickey}">
      <div class="saito-identicon-box"><img class="saito-identicon" src="${imgsrc}" data-id="${publickey}"></div>
      <div class="saito-username" data-id="${publickey}">${publickey}</div>
      <div class="saito-userline" data-id="${publickey}">${userline}</div>
    </div>
  `;

}

