module.exports = (app, contacts, keylist = null) => {
	let html = `<div id="saito-contacts-modal" class="saito-modal contacts">
                <div class="saito-modal-title">${contacts.title}</div>
                <div class="saito-modal-content saito-contacts-list">
              `;

	const userTemplate = (public_key, shared) => {

			let imgsrc = app.keychain.returnIdenticon(public_key);
			let name = app.keychain.returnIdentifierByPublicKey(public_key, true);
		
			if (name == public_key) {
				name = 'Anonymous User';
			}

			let html = `<div class="saito-contact" data-id="${public_key}">`;

			if (contacts.multi_select) {
				html += `<input type="checkbox" data-id="${public_key}"/>`;
			}

			html += `<div class="saito-user">`;
			if (shared) {
				html += `<i class="fa-solid fa-lock secure_contact_notice"></i>`;
			}
			html +=  `<div class="saito-identicon-box"><img class="saito-identicon" src="${imgsrc}"></div>
	                  ${name}
	                <div class="saito-userline">${public_key}</div>
	              </div>
	            </div>`;

	    return html;
	}



  if (keylist){
  	for (let publicKey of keylist){

  		let key = app.keychain.returnKey(publicKey, true);
  		html += userTemplate(publicKey, key?.aes_publicKey);

  	}
  }else{
		let keys = app.keychain.returnKeys();

		for (let i = 0; i < keys.length; i++) {
			//filter out group keys
			if (!keys[i]?.group){
				let publicKey = keys[i].publicKey;
				html += userTemplate(publicKey, keys[i]?.aes_publicKey);
			}
		}
  }

	html += '</div>';

	if (contacts.multi_select) {
		html += `<button id="saito-contact-submit" class="saito-button-primary" type="button">${contacts.multi_button}</button>`;
	}
	html += '</div>';

	return html;
};


