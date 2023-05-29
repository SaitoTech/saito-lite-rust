
module.exports = (app, publickey) => {

  let imgsrc = (app.crypto.isPublicKey(publickey)) ? app.keychain.returnIdenticon(publickey) : "";
  let name = app.keychain.returnIdentifierByPublicKey(publickey, true);
  if (name == publickey) { 
    name = "Anonymous User";
  }

  return `
   <div class="saito-modal saito-modal-menu" id="saito-user-menu">
     <div class="saito-modal-title">
      <div class="saito-user">
        <div class="saito-identicon-box"><img class="saito-identicon" src="${imgsrc}"></div>
        ${name}
        <div class="saito-userline">${publickey}</div>
      </div>
     </div>
     <div class="saito-modal-content">
     </div>
   </div>
  
   `
};
