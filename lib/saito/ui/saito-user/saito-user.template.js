
module.exports = SaitoUserTemplate = (user) => {

  let app = user.app;
  let publickey = user.publickey;
  let userline = user.notice;
  let fourthelem = user.fourthelem;
  let key = "";

  if (app) {
    key = app.keychain.returnKey(publickey); // also checks registry (!)
    if (key) { if (key.identifier != "") { identifier = publickey; } }
  }

  if (app.crypto.isPublicKey(publickey)) {
    imgsrc = app.keychain.returnIdenticon(publickey);
  }

  let identifier = publickey;

  return `
  <div class="saito-user saito-user-${publickey}" id="saito-user-${publickey}" data-id="${publickey}">
    <div class="saito-identicon-box"><img class="saito-identicon" src="${imgsrc}" data-id="${publickey}"></div>
    <div class="saito-address saito-address-${publickey}" data-id="${publickey}">${identifier}</div>
    <div class="saito-userline" data-id="${publickey}">${userline}</div>
    ${fourthelem}
  </div>
  `;

}

