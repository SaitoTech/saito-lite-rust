
module.exports = SaitoUserTemplate = (app, mod, publickey = "", userline = "") => {

  let username = app.keys.returnIdentifierByPublicKey(app.wallet.returnPublicKey());
  if (username == "" || username == app.wallet.returnPublicKey()) {
    username = publickey
  }

  let imgsrc = '/saito/img/no-profile.png';

  if (app.crypto.isPublicKey(username)) {
    imgsrc = app.keys.returnIdenticon(username);
  }

  return `
    <div class="saito-user saito-user-${username}" id="saito-user-${username}" data-id="${username}">
      <div class="saito-identicon-box"><img class="saito-identicon" src="${imgsrc}"></div>
      <div class="saito-username saito-address">${username}</div>
      <div class="saito-userline">${userline}</div>
    </div>
  `;

}

