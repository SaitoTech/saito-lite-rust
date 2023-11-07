module.exports = SaitoUserTemplate = (user) => {
  let app = user.app;
  let publicKey = user.publicKey;
  let userline = user.notice;
  let fourthelem = user.fourthelem;
  let key = "";
  let data_disable = false;
  let imgsrc = "";
  let uuid = user?.id;

  if (app.crypto.isPublicKey(publicKey)) {
    imgsrc = app.keychain.returnIdenticon(publicKey);
  }

  return `
  <div ${uuid ? `id="${uuid}"`:""}class="saito-user saito-user-${publicKey}" data-id="${publicKey}" data-disable="${data_disable}">
    <div class="saito-identicon-box"><img class="saito-identicon" src="${imgsrc}" data-id="${publicKey}"></div>
    ${app.browser.returnAddressHTML(publicKey)}
    <div class="saito-userline" data-id="${publicKey}">${userline}</div>
    ${fourthelem}
  </div>
  `;
};

