
module.exports = SaitoUserTemplate = (user) => {

//console.log("TESTING 1");

  let app = user.app;
  let publickey = user.publickey;
  let userline = user.notice;
  let fourthelem = user.fourthelem;
  let key = "";
//console.log("TESTING 3");
  if (app) {
    key = app.keychain.returnKey(publickey); // also checks registry (!)
    if (key) { if (key.identifier != "") { identifier = publickey; } }
  }

//console.log("TESTING 4");


  if (app.crypto.isPublicKey(publickey)) {
    imgsrc = app.keychain.returnIdenticon(publickey);
  }

//console.log("TESTING 5");
  let identifier = publickey;

//console.log("TESTING 6");
  
  return `
  <div class="saito-user saito-user-${publickey}" id="saito-user-${publickey}" data-id="${publickey}">
    <div class="saito-identicon-box"><img class="saito-identicon" src="${imgsrc}" data-id="${publickey}"></div>
    <div class="saito-address saito-address-${publickey}" data-id="${publickey}">${identifier}</div>
    <div class="saito-userline" data-id="${publickey}">${userline}</div>
    ${fourthelem}
  </div>
  `;

}

