
module.exports = SaitoUserTemplate = (user) => {

console.log("in template");

  let app = user.app;
  let publickey = user.publickey;
  let userline = user.notice;
  let fourthelem = user.fourthelem;
  let key = app.keychain.returnKey(publickey);
  let imgsrc = '/saito/img/no-profile.png';
  if (app.crypto.isPublicKey(publickey)) {
    imgsrc = app.keychain.returnIdenticon(publickey);
  }

  let identifier = publickey;
  if (key) { if (key.identifier != "") { identifier = publickey; } }

  
  return `
  <div class="saito-user saito-user-${publickey}" id="saito-user-${publickey}" data-id="${publickey}">
    <div class="saito-identicon-box"><img class="saito-identicon" src="${imgsrc}" data-id="${publickey}"></div>
    <div class="saito-address saito-address-${publickey}" data-id="${publickey}">${identifier}</div>
    <div class="saito-userline" data-id="${publickey}">${userline}</div>
    ${fourthelem}
  </div>
  `;

}

