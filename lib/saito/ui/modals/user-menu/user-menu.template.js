module.exports = (app, publicKey) => {
	let imgsrc = app.keychain.returnIdenticon(publicKey);
	let name = app.keychain.returnIdentifierByPublicKey(publicKey, true);
	if (name == publicKey) {
		name = 'Anonymous User';
	}

	return `
   <div class="saito-modal saito-modal-menu" id="saito-user-menu">
     <div class="saito-modal-title">
      <div class="saito-user">
        <div class="saito-identicon-box"><img class="saito-identicon" src="${imgsrc}"></div>
        ${name}
        <div class="saito-userline">${publicKey}</div>
      </div>
     </div>
     <div class="saito-modal-content">
     </div>
   </div>
  
   `;
};
