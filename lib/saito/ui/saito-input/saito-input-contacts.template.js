module.exports  = (input_self) => {
	let keys = input_self.findKeyOrIdentifier();

	let contacts = `<div class="saito-input-contact-list">`;

	for (let key of keys) {
		//
		contacts += `<div class="saito-input-contact" tabindex="0" data-id="${
			key.publicKey
		}">
      					<img class="saito-identicon" src="${input_self.app.keychain.returnIdenticon(
		key.publicKey
	)}" data-disable="true">
      					<div class="saito-input-contact-name">${input_self.app.keychain.returnUsername(
		key.publicKey,
		20
	)}</div>
      				</div>`;
	}
	contacts += `</div>`;
	return contacts;
};
