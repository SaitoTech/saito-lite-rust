module.exports  = (user) => {
	let app = user.app;
	let publicKey = user.publicKey;
	let userline = user.notice;
	let fourthelem = user.fourthelem;
	let extra_class = user?.extra_classes || "";
	let key = '';
	let data_disable = false;
	let imgsrc = '';
	let imgcolor = ':';
	let uuid = user?.id;
	let icon = user?.icon || "";

	let myPublicKey = user.app.wallet.publicKey;

	imgsrc = app.keychain.returnIdenticon(publicKey);
	imgcolor = app.keychain.returnIdenticonColor(publicKey);

	return `
  <div ${uuid ? `id="${uuid}"` : ''}
  	class="saito-user ${extra_class} saito-user-${publicKey}${myPublicKey == publicKey ? ' saito-user-self' : ''}" 
  	data-id="${publicKey}" data-disable="${data_disable}">
    <div class="saito-identicon-box">
    	<img class="saito-identicon" src="${imgsrc}" data-id="${publicKey}">
    	${icon}
    </div>
    ${app.browser.returnAddressHTML(publicKey)}
    <div class="saito-userline ${!userline ? "hidden" :""}" style="--key-color:${imgcolor};" data-id="${publicKey}">${userline}</div>
    ${fourthelem}
  </div>
  `;
};
