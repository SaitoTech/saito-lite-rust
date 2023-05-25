module.exports = SaitoUserTemplate = (user) => {
  let app = user.app;
  let publickey = user.publickey;
  let userline = user.notice;
  let fourthelem = user.fourthelem;
  let key = "";
  let data_disable = false;
  let imgsrc = "";

  if (app) {
    key = app.keychain.returnKey(publickey); // also checks registry (!)
    if (key) {
      if (key.identifier != "") {
        identifier = publickey;
      }
    }
  }

  if (app.crypto.isPublicKey(publickey)) {
    console.log("is public key");
    imgsrc = app.keychain.returnIdenticon(publickey);
  } else {
    console.log("is not public key");
  }

  let identifier = publickey;

  console.log(
    "user template ",
    user,
    imgsrc,
    publickey,
    console.log(publickey.length),
    console.log(app.crypto.isBase58(publickey))
  );

  return `
  <div class="saito-user saito-user-${publickey}" id="saito-user-${publickey}" data-id="${publickey}" data-disable="${data_disable}">
    <div class="saito-identicon-box"><img class="saito-identicon" src="${imgsrc}" data-id="${publickey}"></div>
    ${app.browser.returnAddressHTML(publickey)}
    <div class="saito-userline" data-id="${publickey}">${userline}</div>
    ${fourthelem}
  </div>
  `;
};
