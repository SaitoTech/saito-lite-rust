module.exports = SaitoUserTemplate = (user) => {
	let app = user.app;
	let publicKey = user.publicKey;
	let userline = user.notice;
	let fourthelem = user.fourthelem;
	let key = '';
	let data_disable = false;
	let imgsrc = '';
	let imgcolor = ':';
	let uuid = user?.id;

	let myPublicKey = user.app.wallet.publicKey;

	if (app.crypto.isPublicKey(publicKey)) {
		imgsrc = app.keychain.returnIdenticon(publicKey);
		imgcolor = app.keychain.returnIdenticonColor(publicKey);
	}

	return `
  <div ${uuid ? `id="${uuid}"` : ''}class="saito-user saito-user-${publicKey}${
		myPublicKey == publicKey ? ' saito-user-self' : ''
	}" data-id="${publicKey}" data-disable="${data_disable}">
    <div class="saito-identicon-box"><img class="saito-identicon" src="${imgsrc}" data-id="${publicKey}"></div>
    ${app.browser.returnAddressHTML(publicKey)}
    <div class="saito-userline" style="--key-color:${imgcolor};" data-id="${publicKey}">${userline}</div>
    ${fourthelem}
  </div>
  `;
};
